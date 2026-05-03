'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function updateUserRoleAction(userId: string, newRole: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Authorization check (optional if RLS already handles it, but good practice)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from('users')
    .update({ role: newRole })
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating user role:', error);
    throw new Error('Failed to update user role');
  }

  revalidatePath('/admin/users');
}

export async function updateUserStatusAction(userId: string, newStatus: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from('users')
    .update({ status: newStatus })
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating user status:', error);
    throw new Error('Failed to update user status');
  }

  revalidatePath('/admin/users');
}
