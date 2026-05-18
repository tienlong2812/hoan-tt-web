import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { updateBrandAction } from '../../actions';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { AdminPageHeader, AdminPanel } from '@/components/admin/admin-page';

export default async function EditBrandPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: brand, error } = await supabase.from('brands').select('*').eq('brand_id', params.id).single();

  if (error || !brand) {
    return notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
      <AdminPageHeader title="Sửa thương hiệu" description="Cập nhật thông tin và logo thương hiệu." backHref="/admin/brands" />

      <AdminPanel>
        <form action={updateBrandAction} className="space-y-6">
          <input type="hidden" name="brand_id" value={brand.brand_id} />
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="brand_name">Tên thương hiệu *</Label>
              <Input id="brand_name" name="brand_name" defaultValue={brand.brand_name} required />
            </div>

            <div>
              <Label htmlFor="logo">Logo thương hiệu</Label>
              {brand.logo_url && (
                <div className="mb-2 p-2 border rounded inline-block bg-white">
                  <img src={brand.logo_url} alt="Current Logo" className="h-12 w-auto object-contain" />
                </div>
              )}
              <Input id="logo" name="logo" type="file" accept="image/*" className="cursor-pointer bg-white" />
              <p className="text-xs text-muted-foreground mt-2">Bỏ trống nếu muốn giữ nguyên logo cũ.</p>
            </div>

            <div>
              <Label htmlFor="description">Mô tả</Label>
              <Textarea id="description" name="description" rows={4} defaultValue={brand.description || ''} />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <Button type="submit" size="lg">Cập Nhật</Button>
          </div>
        </form>
      </AdminPanel>
    </div>
  );
}
