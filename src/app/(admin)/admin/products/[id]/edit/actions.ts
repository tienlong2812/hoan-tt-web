'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { withAdminToast } from '@/lib/admin-toast';

type ProductUpdatePayload = {
  product_name: string;
  slug: string;
  description: string | null;
  base_price: number;
  weight: number | null;
  status: string;
  origin: string | null;
  brand_id: number | null;
  category_id: number | null;
  thumbnail_url?: string;
  stock?: number;
};

type ProductVariantInput = {
  variant_id?: number;
  variant_name: string;
  sku?: string | null;
  price: number;
  discount_price?: number | null;
  stock?: number;
  weight?: number | null;
};

export async function updateProductAction(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(withAdminToast('/admin/products', 'Bạn cần đăng nhập để thực hiện thao tác này.', 'error'));

  const product_id = parseInt(formData.get('product_id') as string);
  const productName = formData.get('product_name') as string;
  const slug = formData.get('slug') as string;

  const base_price = parseInt(formData.get('base_price') as string);
  const weight = formData.get('weight') ? parseFloat(formData.get('weight') as string) : null;
  
  const brand_id = formData.get('brand_id') ? parseInt(formData.get('brand_id') as string) : null;
  const category_id = formData.get('category_id') ? parseInt(formData.get('category_id') as string) : null;

  const stock = formData.get('stock') ? parseInt(formData.get('stock') as string) : 0;

  const updatePayload: ProductUpdatePayload = {
    product_name: productName,
    slug,
    description: formData.get('description') as string || null,
    base_price,
    weight,
    stock,
    status: formData.get('status') as string,
    origin: formData.get('origin') as string || null,
    brand_id,
    category_id,
  };

  // Handle Thumbnail Update
  const imageFile = formData.get('image') as File | null;
  if (imageFile && imageFile.size > 0) {
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `thumb-${Date.now()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, buffer, {
        contentType: imageFile.type,
      });

    if (uploadError) {
      console.error("THUMBNAIL UPLOAD ERROR:", uploadError);
    }

    if (!uploadError && uploadData) {
      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);
      updatePayload.thumbnail_url = publicUrlData.publicUrl;
    }
  }

  // Update Product
  const { error } = await supabase.from('products').update(updatePayload).eq('product_id', product_id);
  if (error) {
    console.error('Update Error:', error);
    redirect(withAdminToast('/admin/products', 'Không thể cập nhật sản phẩm. Vui lòng thử lại.', 'error'));
  }

  // Handle Variants
  const variantsJson = formData.get('variants_json') as string;
  if (variantsJson) {
    try {
      const variants = JSON.parse(variantsJson) as ProductVariantInput[];
      
      // Get existing variants to find which ones to delete
      const { data: existingVariants } = await supabase.from('product_variants').select('variant_id').eq('product_id', product_id);
      const existingIds = existingVariants?.map(v => v.variant_id) || [];
      const incomingIds = variants.map((v) => v.variant_id).filter(Boolean);
      
      const idsToDelete = existingIds.filter(id => !incomingIds.includes(id));
      if (idsToDelete.length > 0) {
        await supabase.from('product_variants').delete().in('variant_id', idsToDelete);
      }

      if (variants.length > 0) {
        const variantUpserts = variants.map((v) => {
          const payload: ProductVariantInput & { product_id: number } = {
            product_id: product_id,
            variant_name: v.variant_name,
            sku: v.sku || null,
            price: v.price,
            discount_price: v.discount_price || null,
            stock: v.stock || 0,
            weight: v.weight || null,
          };
          if (v.variant_id) payload.variant_id = v.variant_id;
          return payload;
        });

        const { error: variantError } = await supabase.from('product_variants').upsert(variantUpserts, { onConflict: 'variant_id' });
        if (variantError) console.error("Error upserting variants:", variantError);
      }
    } catch (e) {
      console.error("Failed to parse variants:", e);
    }
  }

  // Handle Gallery Append
  const galleryFiles = formData.getAll('gallery') as File[];
  if (galleryFiles && galleryFiles.length > 0) {
    const galleryInserts = [];
    
    // Get current max sort_order
    const { data: existingGallery } = await supabase.from('product_gallery').select('sort_order').eq('product_id', product_id).order('sort_order', { ascending: false }).limit(1);
    const startOrder = existingGallery && existingGallery.length > 0 ? existingGallery[0].sort_order + 1 : 0;

    for (let i = 0; i < galleryFiles.length; i++) {
      const file = galleryFiles[i];
      if (file.size === 0) continue;
      
      const fileExt = file.name.split('.').pop();
      const fileName = `gallery-${product_id}-${Date.now()}-${i}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, buffer, {
          contentType: file.type,
        });

      if (uploadError) {
        console.error("GALLERY UPLOAD ERROR:", uploadError);
      }

      if (!uploadError && uploadData) {
        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);
          
        galleryInserts.push({
          product_id: product_id,
          image_url: publicUrlData.publicUrl,
          sort_order: startOrder + i
        });
      }
    }
    
    if (galleryInserts.length > 0) {
      const { error: galleryInsertError } = await supabase.from('product_gallery').insert(galleryInserts);
      if (galleryInsertError) {
        console.error("GALLERY INSERT ERROR:", galleryInsertError);
      }
    }
  }

  redirect(withAdminToast('/admin/products', 'Đã cập nhật sản phẩm.'));
}
