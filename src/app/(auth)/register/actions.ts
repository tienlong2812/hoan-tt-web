'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/utils/supabase/admin';

export async function registerAction(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('full_name') as string;
  const phoneNumber = formData.get('phone_number') as string;
  const username = formData.get('username') as string;

  // Check if email confirmation is disabled in system settings
  const { data: setting } = await supabase
    .from('system_settings')
    .select('value')
    .eq('key', 'require_email_confirmation')
    .single();

  const requireEmailConfirmation = setting?.value !== 'false';

  // Admin client dùng để bypass RLS khi ghi dữ liệu user
  const adminClient = createAdminClient();
  if (!adminClient) {
    return { error: 'Cấu hình server chưa hoàn tất. Vui lòng liên hệ quản trị viên.' };
  }

  if (!requireEmailConfirmation) {
    const { data: adminData, error: adminError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, phone_number: phoneNumber, username },
    });

    if (adminError) {
      return { error: adminError.message };
    }

    // Dùng adminClient để bypass RLS
    if (adminData.user) {
      const { error: insertError } = await adminClient.from('users').upsert({
        user_id: adminData.user.id,
        email: adminData.user.email,
        full_name: fullName,
        phone_number: phoneNumber,
        username,
        role: 'customer',
        status: 'active',
      }, { onConflict: 'user_id' });

      if (insertError) {
        console.error('[Register] Failed to upsert user profile (admin path):', insertError);
      }
    }

    // Sign in the user automatically
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      return { success: true, requiresConfirmation: false };
    }

    return { success: true, requiresConfirmation: false };
  }

  // Normal signup with email confirmation
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone_number: phoneNumber,
        username,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Dùng adminClient để bypass RLS
  if (data.user) {
    const { error: insertError } = await adminClient.from('users').upsert({
      user_id: data.user.id,
      email: data.user.email,
      full_name: fullName,
      phone_number: phoneNumber,
      username,
      role: 'customer',
      status: 'active',
    }, { onConflict: 'user_id' });

    if (insertError) {
      console.error('[Register] Failed to upsert user profile (normal path):', insertError);
    }
  }

  if (data.session) {
    return { success: true, requiresConfirmation: false };
  } else {
    return { success: true, requiresConfirmation: true };
  }
}
