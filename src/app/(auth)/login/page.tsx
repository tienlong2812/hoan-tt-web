'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
    } else {
      // Check user status in public.users
      if (data?.user?.id) {
        const { data: profile } = await supabase
          .from('users')
          .select('status')
          .eq('user_id', data.user.id)
          .single();

        if (profile?.status === 'banned') {
          await supabase.auth.signOut();
          toast.error('Tài khoản bị khóa');
          setLoading(false);
          return;
        }

        if (profile?.status === 'deleted') {
          await supabase.auth.signOut();
          toast.error('Tài khoản không tồn tại hoặc đã bị xóa');
          setLoading(false);
          return;
        }
      }

      toast.success('Đăng nhập thành công!');
      // Hard redirect forces Next.js to rebuild the page with fresh auth cookies
      window.location.href = '/';
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl">Đăng Nhập</CardTitle>
        <CardDescription>Nhập email và mật khẩu của bạn để truy cập hệ thống</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 border-t pt-4 text-center text-sm text-muted-foreground">
        <div>
          Chưa có tài khoản? <Link href="/register" className="text-primary font-medium hover:underline">Đăng ký ngay</Link>
        </div>
      </CardFooter>
    </Card>
  );
}
