import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createProductAction } from './actions';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { VariantList } from '../variant-list';
import { AdminPageHeader, AdminPanel } from '@/components/admin/admin-page';

export default async function CreateProductPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const [{ data: brands }, { data: categories }] = await Promise.all([
    supabase.from('brands').select('*'),
    supabase.from('categories').select('*'),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <AdminPageHeader title="Thêm sản phẩm mới" description="Tạo sản phẩm, biến thể và hình ảnh hiển thị trên shop." backHref="/admin/products" />

      <AdminPanel>
        <form action={createProductAction} className="space-y-8">
          <div className="space-y-4">
            <div>
              <Label htmlFor="product_name">Tên sản phẩm *</Label>
              <Input id="product_name" name="product_name" required />
            </div>

            <div>
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input id="slug" name="slug" placeholder="Bỏ trống để tự tạo từ tên sản phẩm" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="origin">Xuất xứ</Label>
                <Input id="origin" name="origin" />
              </div>
              <div>
                <Label htmlFor="weight">Khối lượng (g)</Label>
                <Input id="weight" name="weight" type="number" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="base_price">Giá gốc (VNĐ) *</Label>
                <Input id="base_price" name="base_price" type="number" required />
              </div>
              <div>
                <Label htmlFor="status">Trạng thái</Label>
                <select id="status" name="status" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="brand_id">Thương hiệu</Label>
                <select id="brand_id" name="brand_id" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                  <option value="">-- Chọn --</option>
                  {brands?.map(b => <option key={b.brand_id} value={b.brand_id}>{b.brand_name}</option>)}
                </select>
              </div>
              <div>
                <Label htmlFor="category_id">Danh mục</Label>
                <select id="category_id" name="category_id" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                  <option value="">-- Chọn --</option>
                  {categories?.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Mô tả</Label>
              <Textarea id="description" name="description" rows={5} />
            </div>

            <VariantList />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border p-4 rounded-lg bg-muted/10">
                <Label htmlFor="image" className="font-semibold text-primary mb-2 block">Hình ảnh đại diện (Thumbnail) *</Label>
                <Input id="image" name="image" type="file" accept="image/*" className="cursor-pointer bg-white" required />
                <p className="text-xs text-muted-foreground mt-2">Dung lượng tối đa 5MB. Định dạng JPG, PNG. Ảnh này hiển thị ở trang danh sách.</p>
              </div>

              <div className="border p-4 rounded-lg bg-muted/10">
                <Label htmlFor="gallery" className="font-semibold text-primary mb-2 block">Thư viện ảnh (Gallery)</Label>
                <Input id="gallery" name="gallery" type="file" accept="image/*" multiple className="cursor-pointer bg-white" />
                <p className="text-xs text-muted-foreground mt-2">Có thể chọn nhiều ảnh cùng lúc. Ảnh này sẽ hiển thị trong trang chi tiết sản phẩm.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" size="lg">Thêm Sản Phẩm</Button>
          </div>
        </form>
      </AdminPanel>
    </div>
  );
}
