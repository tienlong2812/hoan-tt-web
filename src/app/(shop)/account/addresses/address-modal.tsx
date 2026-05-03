'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { addAddress } from './actions';
import { toast } from 'sonner';

export function AddressModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    try {
      await addAddress(formData);
      toast.success('Đã thêm địa chỉ mới');
      setOpen(false);
    } catch (error) {
      toast.error('Có lỗi xảy ra khi thêm địa chỉ');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center rounded-full bg-primary hover:bg-primary/90 text-white h-10 px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background">
        <Plus className="h-4 w-4 mr-2" /> Thêm Địa Chỉ Mới
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Thêm Địa Chỉ Giao Hàng</DialogTitle>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Họ và Tên</Label>
            <Input id="full_name" name="full_name" required placeholder="Nguyễn Văn A" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone_number">Số Điện Thoại</Label>
            <Input id="phone_number" name="phone_number" required placeholder="0912345678" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="province">Tỉnh/Thành Phố</Label>
              <Input id="province" name="province" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="district">Quận/Huyện</Label>
              <Input id="district" name="district" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="detail_address">Địa chỉ chi tiết (Số nhà, Đường...)</Label>
            <Input id="detail_address" name="detail_address" required />
          </div>
          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? 'Đang lưu...' : 'Lưu Địa Chỉ'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
