'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function createBrandAction(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const brand_name = formData.get('brand_name') as string;
  const description = formData.get('description') as string;

  let logo_url = null;
  const logoFile = formData.get('logo') as File | null;
  if (logoFile && logoFile.size > 0) {
    const fileExt = logoFile.name.split('.').pop();
    const fileName = `brand-${Date.now()}.${fileExt}`;
    const filePath = `brands/${fileName}`;

    const arrayBuffer = await logoFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, buffer, { contentType: logoFile.type });

    if (!uploadError && uploadData) {
      const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(filePath);
      logo_url = publicUrlData.publicUrl;
    }
  }

  const { error } = await supabase.from('brands').insert({
    brand_name,
    description: description || null,
    logo_url
  });

  if (error) {
    console.error('Insert Brand Error:', error);
    throw new Error('Failed to create brand');
  }

  redirect('/admin/brands');
}

export async function updateBrandAction(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const brand_id = parseInt(formData.get('brand_id') as string);
  const brand_name = formData.get('brand_name') as string;
  const description = formData.get('description') as string;

  const updatePayload: any = {
    brand_name,
    description: description || null
  };

  const logoFile = formData.get('logo') as File | null;
  if (logoFile && logoFile.size > 0) {
    const fileExt = logoFile.name.split('.').pop();
    const fileName = `brand-${brand_id}-${Date.now()}.${fileExt}`;
    const filePath = `brands/${fileName}`;

    const arrayBuffer = await logoFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, buffer, { contentType: logoFile.type });

    if (!uploadError && uploadData) {
      const { data: publicUrlData } = supabase.storage.from('product-images').getPublicUrl(filePath);
      updatePayload.logo_url = publicUrlData.publicUrl;
    }
  }

  const { error } = await supabase.from('brands').update(updatePayload).eq('brand_id', brand_id);

  if (error) {
    console.error('Update Brand Error:', error);
    throw new Error('Failed to update brand');
  }

  redirect('/admin/brands');
}

export async function deleteBrandAction(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const brand_id = parseInt(formData.get('brand_id') as string);

  const { error } = await supabase.from('brands').delete().eq('brand_id', brand_id);
  if (error) {
    console.error('Delete Brand Error:', error);
    throw new Error('Failed to delete brand. Make sure no products are using this brand.');
  }

  revalidatePath('/admin/brands');
}
