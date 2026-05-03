import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateProfile } from './actions';

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
        <form action={updateProfile} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="full_name">Họ và Tên</Label>
              <Input 
                id="full_name" 
                name="full_name" 
                defaultValue={profile?.full_name || ''} 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone_number">Số Điện Thoại</Label>
              <Input 
                id="phone_number" 
                name="phone_number" 
                defaultValue={profile?.phone_number || ''} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              name="email" 
              defaultValue={profile?.email || user.email} 
              disabled 
              className="bg-muted/50 cursor-not-allowed text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">Email không thể thay đổi sau khi đăng ký.</p>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" size="lg" className="rounded-full px-8">
              Lưu Thay Đổi
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
