'use server';

import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Bạn chưa đăng nhập.' };
  }

  const adminClient = createAdminClient();
  if (!adminClient) {
    return { error: 'Cấu hình server chưa hoàn tất.' };
  }

  const full_name = formData.get('full_name') as string;
  const phone_number = formData.get('phone_number') as string;
  const username = formData.get('username') as string;

  const { error } = await adminClient
    .from('users')
    .update({
      full_name,
      phone_number,
      username,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id);

  if (error) {
    console.error('[Profile] Error updating profile:', error);
    return { error: 'Cập nhật thất bại: ' + error.message };
  }

  revalidatePath('/account/profile');
  return { success: true };
}
