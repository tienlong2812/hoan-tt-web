'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { withAdminToast } from '@/lib/admin-toast';
import { createClient } from '@/utils/supabase/server';

export async function deleteProductAction(productId: number) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.from('products').delete().eq('product_id', productId);

  if (error) {
    console.error('Delete Product Error:', error);
    redirect(withAdminToast('/admin/products', 'Không thể xóa sản phẩm. Vui lòng thử lại.', 'error'));
  }

  revalidatePath('/admin/products');
  redirect(withAdminToast('/admin/products', 'Đã xóa sản phẩm.'));
}
