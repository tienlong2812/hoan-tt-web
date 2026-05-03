import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createCouponAction } from '../actions';

export default function CreateCouponPage() {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/coupons">
          <Button variant="outline" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Tạo Mã Giảm Giá Mới</h1>
      </div>

      <div className="bg-card border rounded-xl p-6">
        <form action={createCouponAction} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Mã code *</Label>
              <Input id="code" name="code" required placeholder="VD: GIAM50K" className="font-mono uppercase" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount_type">Loại giảm giá *</Label>
              <select id="discount_type" name="discount_type" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" required>
                <option value="fixed_amount">Giảm số tiền cố định (₫)</option>
                <option value="percentage">Giảm theo phần trăm (%)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discount_value">Giá trị giảm *</Label>
              <Input id="discount_value" name="discount_value" type="number" min="0" required placeholder="VD: 50000 hoặc 10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="min_order_amount">Đơn tối thiểu (₫)</Label>
              <Input id="min_order_amount" name="min_order_amount" type="number" min="0" defaultValue="0" placeholder="0 = không giới hạn" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="usage_limit">Giới hạn số lần dùng</Label>
            <Input id="usage_limit" name="usage_limit" type="number" min="1" placeholder="Để trống = không giới hạn" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valid_from">Ngày bắt đầu</Label>
              <Input id="valid_from" name="valid_from" type="datetime-local" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="valid_to">Ngày hết hạn</Label>
              <Input id="valid_to" name="valid_to" type="datetime-local" />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" size="lg">Tạo Mã Giảm Giá</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
