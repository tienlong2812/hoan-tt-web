'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { withAdminToast } from '@/lib/admin-toast';

type ProductVariantInput = {
  variant_name: string;
  sku?: string;
  price: number;
  discount_price?: number | null;
  stock?: number;
  weight?: number | null;
};

function generateSlug(text: string) {
  return text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Math.floor(Math.random() * 1000);
}

export async function createProductAction(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(withAdminToast('/admin/products', 'Bạn cần đăng nhập để thực hiện thao tác này.', 'error'));

  const productName = formData.get('product_name') as string;
  let slug = formData.get('slug') as string;
  if (!slug) {
    slug = generateSlug(productName);
  }

  const base_price = parseInt(formData.get('base_price') as string);
  const weight = formData.get('weight') ? parseFloat(formData.get('weight') as string) : null;
  
  const brand_id = formData.get('brand_id') ? parseInt(formData.get('brand_id') as string) : null;
  const category_id = formData.get('category_id') ? parseInt(formData.get('category_id') as string) : null;

  // Handle Thumbnail
  const imageFile = formData.get('image') as File | null;
  let thumbnail_url = null;

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

    if (!uploadError && uploadData) {
      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);
      thumbnail_url = publicUrlData.publicUrl;
    }
  }

  // Insert Product
  const newProduct = {
    product_name: productName,
    slug,
    description: formData.get('description') as string || null,
    base_price,
    weight,
    status: formData.get('status') as string,
    origin: formData.get('origin') as string || null,
    brand_id,
    category_id,
    thumbnail_url
  };

  const { data: insertedProduct, error } = await supabase.from('products').insert(newProduct).select().single();
  
  if (error || !insertedProduct) {
    console.error('Insert Error:', error);
    redirect(withAdminToast('/admin/products', 'Không thể tạo sản phẩm. Vui lòng thử lại.', 'error'));
  }

  // Handle Variants
  const variantsJson = formData.get('variants_json') as string;
  if (variantsJson) {
    try {
      const variants = JSON.parse(variantsJson) as ProductVariantInput[];
      if (variants && variants.length > 0) {
        const variantInserts = variants.map((v) => ({
          product_id: insertedProduct.product_id,
          variant_name: v.variant_name,
          sku: v.sku || null,
          price: v.price,
          discount_price: v.discount_price || null,
          stock: v.stock || 0,
          weight: v.weight || null,
        }));
        const { error: variantError } = await supabase.from('product_variants').insert(variantInserts);
        if (variantError) console.error("Error inserting variants:", variantError);
      }
    } catch (e) {
      console.error("Failed to parse variants:", e);
    }
  }

  // Handle Gallery
  const galleryFiles = formData.getAll('gallery') as File[];
  if (galleryFiles && galleryFiles.length > 0) {
    const galleryInserts = [];
    
    for (let i = 0; i < galleryFiles.length; i++) {
      const file = galleryFiles[i];
      if (file.size === 0) continue;
      
      const fileExt = file.name.split('.').pop();
      const fileName = `gallery-${insertedProduct.product_id}-${Date.now()}-${i}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, buffer, {
          contentType: file.type,
        });

      if (!uploadError && uploadData) {
        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);
          
        galleryInserts.push({
          product_id: insertedProduct.product_id,
          image_url: publicUrlData.publicUrl,
          display_order: i
        });
      }
    }
    
    if (galleryInserts.length > 0) {
      await supabase.from('product_gallery').insert(galleryInserts);
    }
  }

  redirect(withAdminToast('/admin/products', 'Đã tạo sản phẩm.'));
}
