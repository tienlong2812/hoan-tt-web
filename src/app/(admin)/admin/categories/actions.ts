'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { withAdminToast } from '@/lib/admin-toast';

function generateSlug(text: string) {
  return text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
}

export async function createCategoryAction(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const category_name = formData.get('category_name') as string;
  let slug = formData.get('slug') as string;
  if (!slug) {
    slug = generateSlug(category_name);
  }

  const { error } = await supabase.from('categories').insert({
    category_name,
    slug
  });

  if (error) {
    console.error('Insert Category Error:', error);
    redirect(withAdminToast('/admin/categories', 'Không thể tạo danh mục. Vui lòng thử lại.', 'error'));
  }

  redirect(withAdminToast('/admin/categories', 'Đã tạo danh mục.'));
}

export async function updateCategoryAction(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const category_id = parseInt(formData.get('category_id') as string);
  const category_name = formData.get('category_name') as string;
  const slug = formData.get('slug') as string;

  const { error } = await supabase.from('categories').update({
    category_name,
    slug
  }).eq('category_id', category_id);

  if (error) {
    console.error('Update Category Error:', error);
    redirect(withAdminToast('/admin/categories', 'Không thể cập nhật danh mục. Vui lòng thử lại.', 'error'));
  }

  redirect(withAdminToast('/admin/categories', 'Đã cập nhật danh mục.'));
}

export async function deleteCategoryAction(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const category_id = parseInt(formData.get('category_id') as string);

  const { error } = await supabase.from('categories').delete().eq('category_id', category_id);
  if (error) {
    console.error('Delete Category Error:', error);
    redirect(withAdminToast('/admin/categories', 'Không thể xóa danh mục đang được sử dụng.', 'error'));
  }

  revalidatePath('/admin/categories');
  redirect(withAdminToast('/admin/categories', 'Đã xóa danh mục.'));
}
