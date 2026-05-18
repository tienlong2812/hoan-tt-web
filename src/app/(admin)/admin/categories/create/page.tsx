import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createCategoryAction } from '../actions';
import { AdminPageHeader, AdminPanel } from '@/components/admin/admin-page';

export default function CreateCategoryPage() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
      <AdminPageHeader title="Thêm danh mục mới" description="Tạo nhóm sản phẩm mới cho shop." backHref="/admin/categories" />

      <AdminPanel>
        <form action={createCategoryAction} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="category_name">Tên danh mục *</Label>
              <Input id="category_name" name="category_name" required />
            </div>

            <div>
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input id="slug" name="slug" placeholder="Bỏ trống để tự tạo từ tên" />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" size="lg">Lưu Danh Mục</Button>
          </div>
        </form>
      </AdminPanel>
    </div>
  );
}
