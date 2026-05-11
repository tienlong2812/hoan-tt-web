'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import Link from 'next/link';
import { registerAction } from './actions';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await registerAction(formData);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Đăng ký thành công!');
      if (result.requiresConfirmation) {
        toast.info('Vui lòng kiểm tra email để xác nhận tài khoản.');
        router.push('/login');
      } else {
        window.location.href = '/';
      }
    }

    setLoading(false);
  };

  return (
    <Card>
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl">Đăng Ký Tài Khoản</CardTitle>
        <CardDescription>Điền thông tin để tạo tài khoản mới</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Họ và Tên</Label>
            <Input id="full_name" name="full_name" type="text" placeholder="Nguyễn Văn A" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Tên đăng nhập (Username)</Label>
            <Input id="username" name="username" type="text" placeholder="nguyenvana" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone_number">Số điện thoại</Label>
            <Input id="phone_number" name="phone_number" type="tel" placeholder="0912345678" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="m@example.com" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? 'Đang đăng ký...' : 'Đăng Ký'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 border-t pt-4 text-center text-sm text-muted-foreground">
        <div>
          Đã có tài khoản? <Link href="/login" className="text-primary font-medium hover:underline">Đăng nhập ngay</Link>
        </div>
      </CardFooter>
    </Card>
  );
}
