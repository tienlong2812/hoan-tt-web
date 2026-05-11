'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateProfile } from './actions';

type Profile = {
  full_name?: string | null;
  phone_number?: string | null;
  username?: string | null;
  email?: string | null;
};

type Props = {
  profile: Profile | null;
  userEmail: string | undefined;
};

export function ProfileForm({ profile, userEmail }: Props) {
  const [state, action, pending] = useActionState(
    async (_prev: unknown, formData: FormData) => updateProfile(formData),
    null
  );

  return (
    <form action={action} className="space-y-6">
      {state && 'error' in state && state.error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}
      {state && 'success' in state && state.success && (
        <div className="rounded-lg bg-green-500/10 border border-green-500/30 px-4 py-3 text-sm text-green-600 dark:text-green-400">
          Cập nhật thành công!
        </div>
      )}

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
          <Label htmlFor="username">Tên đăng nhập (Username)</Label>
          <Input
            id="username"
            name="username"
            defaultValue={profile?.username || ''}
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

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            defaultValue={profile?.email || userEmail}
            disabled
            className="bg-muted/50 cursor-not-allowed text-muted-foreground"
          />
          <p className="text-xs text-muted-foreground">Email không thể thay đổi.</p>
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <Button type="submit" size="lg" className="rounded-full px-8" disabled={pending}>
          {pending ? 'Đang lưu...' : 'Lưu Thay Đổi'}
        </Button>
      </div>
    </form>
  );
}
