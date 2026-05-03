import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createBrandAction } from '../actions';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CreateBrandPage() {
  return (
    <div className="max-w-xl mx-auto py-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/brands">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Thêm Thương Hiệu Mới</h1>
      </div>

      <div className="bg-card border rounded-xl p-6">
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
      </div>
    </div>
  );
}
