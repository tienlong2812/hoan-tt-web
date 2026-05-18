import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createBrandAction } from '../actions';
import { AdminPageHeader, AdminPanel } from '@/components/admin/admin-page';

export default function CreateBrandPage() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
      <AdminPageHeader title="Thêm thương hiệu mới" description="Tạo thương hiệu và logo hiển thị trên shop." backHref="/admin/brands" />

      <AdminPanel>
        <form action={createBrandAction} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="brand_name">Tên thương hiệu *</Label>
              <Input id="brand_name" name="brand_name" required />
            </div>

            <div>
              <Label htmlFor="logo">Logo thương hiệu</Label>
              <Input id="logo" name="logo" type="file" accept="image/*" className="cursor-pointer bg-white" />
            </div>

            <div>
              <Label htmlFor="description">Mô tả</Label>
              <Textarea id="description" name="description" rows={4} />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" size="lg">Lưu Thương Hiệu</Button>
          </div>
        </form>
      </AdminPanel>
    </div>
  );
}
