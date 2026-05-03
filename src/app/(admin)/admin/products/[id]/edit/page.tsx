import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { updateProductAction } from './actions';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { VariantList } from '../../variant-list';

export default async function EditProductPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const [
    { data: product, error: prodErr },
    { data: brands },
    { data: categories },
    { data: variants }
  ] = await Promise.all([
    supabase.from('products').select('*').eq('product_id', params.id).single(),
    supabase.from('brands').select('*'),
    supabase.from('categories').select('*'),
    supabase.from('product_variants').select('*').eq('product_id', params.id).order('variant_id', { ascending: true })
  ]);

  if (prodErr || !product) {
    return notFound();
  }

  return (
    <div className="max-w-3xl mx-auto py-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Sửa Sản Phẩm</h1>
      </div>

      <div className="bg-card border rounded-xl p-6">
        <form action={updateProductAction} className="space-y-8">
          <input type="hidden" name="product_id" value={product.product_id} />
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="product_name">Tên sản phẩm *</Label>
              <Input id="product_name" name="product_name" defaultValue={product.product_name} required />
            </div>

            <div>
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input id="slug" name="slug" defaultValue={product.slug} placeholder="Bỏ trống để tự tạo từ tên sản phẩm" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sku">SKU</Label>
                <Input id="sku" name="sku" defaultValue={product.sku || ''} />
              </div>
              <div>
                <Label htmlFor="origin">Xuất xứ</Label>
                <Input id="origin" name="origin" defaultValue={product.origin || ''} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Giá (VNĐ) *</Label>
                <Input id="price" name="price" type="number" defaultValue={product.price} required />
              </div>
              <div>
                <Label htmlFor="discount_price">Giá khuyến mãi (VNĐ)</Label>
                <Input id="discount_price" name="discount_price" type="number" defaultValue={product.discount_price || ''} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stock">Tồn kho *</Label>
                <Input id="stock" name="stock" type="number" defaultValue={product.stock} required />
              </div>
              <div>
                <Label htmlFor="status">Trạng thái</Label>
                <select id="status" name="status" defaultValue={product.status} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="brand_id">Thương hiệu</Label>
                <select id="brand_id" name="brand_id" defaultValue={product.brand_id || ''} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                  <option value="">-- Chọn --</option>
                  {brands?.map(b => <option key={b.brand_id} value={b.brand_id}>{b.brand_name}</option>)}
                </select>
              </div>
              <div>
                <Label htmlFor="category_id">Danh mục</Label>
                <select id="category_id" name="category_id" defaultValue={product.category_id || ''} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                  <option value="">-- Chọn --</option>
                  {categories?.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Mô tả</Label>
              <Textarea id="description" name="description" rows={5} defaultValue={product.description || ''} />
            </div>

            <VariantList initialVariants={variants || []} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border p-4 rounded-lg bg-muted/10">
                <Label htmlFor="image" className="font-semibold text-primary mb-2 block">Hình ảnh đại diện mới</Label>
                {product.thumbnail_url && (
                   <img src={product.thumbnail_url} className="w-24 h-24 object-cover mb-4 rounded border" alt="Current thumbnail" />
                )}
                <Input id="image" name="image" type="file" accept="image/*" className="cursor-pointer bg-white" />
                <p className="text-xs text-muted-foreground mt-2">Bỏ trống nếu muốn giữ nguyên ảnh cũ.</p>
              </div>

              <div className="border p-4 rounded-lg bg-muted/10">
                <Label htmlFor="gallery" className="font-semibold text-primary mb-2 block">Thêm thư viện ảnh</Label>
                <Input id="gallery" name="gallery" type="file" accept="image/*" multiple className="cursor-pointer bg-white" />
                <p className="text-xs text-muted-foreground mt-2">Ảnh tải lên sẽ được thêm vào thư viện hiện tại.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" size="lg">Cập Nhật</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
