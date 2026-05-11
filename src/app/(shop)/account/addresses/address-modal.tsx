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
            <Label htmlFor="receiver_name" className="text-xs font-semibold uppercase">Họ và Tên người nhận *</Label>
            <Input id="receiver_name" name="receiver_name" required placeholder="Nguyễn Văn A" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="receiver_phone" className="text-xs font-semibold uppercase">Số Điện Thoại *</Label>
            <Input id="receiver_phone" name="receiver_phone" required placeholder="0912345678" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="province" className="text-xs font-semibold uppercase">Tỉnh/Thành Phố *</Label>
              <Input id="province" name="province" required placeholder="Ví dụ: Hà Nội" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="district" className="text-xs font-semibold uppercase">Quận/Huyện *</Label>
              <Input id="district" name="district" required placeholder="Ví dụ: Cầu Giấy" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ward" className="text-xs font-semibold uppercase">Xã/Phường *</Label>
              <Input id="ward" name="ward" required placeholder="Ví dụ: Dịch Vọng" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="detail_address" className="text-xs font-semibold uppercase">Địa chỉ chi tiết *</Label>
              <Input id="detail_address" name="detail_address" required placeholder="Số nhà, tên đường..." />
            </div>
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
