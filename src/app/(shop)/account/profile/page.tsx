import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { ProfileForm } from './profile-form';

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null; // Handled by layout redirect
  }

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Hồ Sơ Cá Nhân</h1>
        <p className="text-muted-foreground mt-1">Quản lý thông tin cá nhân của bạn.</p>
      </div>

      <div className="border rounded-2xl p-6 md:p-8 bg-card max-w-2xl">
        <ProfileForm profile={profile} userEmail={user.email} />
      </div>
    </div>
  );
}
