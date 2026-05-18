'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { withAdminToast } from '@/lib/admin-toast';

export async function updateUserRoleAction(userId: string, newRole: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Authorization check (optional if RLS already handles it, but good practice)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(withAdminToast('/admin/users', 'Bạn cần đăng nhập để thực hiện thao tác này.', 'error'));

  const { error } = await supabase
    .from('users')
    .update({ role: newRole })
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating user role:', error);
    redirect(withAdminToast('/admin/users', 'Không thể cập nhật quyền người dùng.', 'error'));
  }

  revalidatePath('/admin/users');
  redirect(withAdminToast('/admin/users', 'Đã cập nhật quyền người dùng.'));
}

export async function updateUserStatusAction(userId: string, newStatus: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(withAdminToast('/admin/users', 'Bạn cần đăng nhập để thực hiện thao tác này.', 'error'));

  const { error } = await supabase
    .from('users')
    .update({ status: newStatus })
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating user status:', error);
    redirect(withAdminToast('/admin/users', 'Không thể cập nhật trạng thái người dùng.', 'error'));
  }

  revalidatePath('/admin/users');
  redirect(withAdminToast('/admin/users', 'Đã cập nhật trạng thái người dùng.'));
}

export async function getUsersForExport() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .neq('status', 'deleted')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching users for export:', error);
    throw new Error('Failed to fetch users');
  }

  return data;
}
