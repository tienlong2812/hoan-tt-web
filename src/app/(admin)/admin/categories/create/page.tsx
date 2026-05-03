import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createCategoryAction } from '../actions';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CreateCategoryPage() {
  return (
    <div className="max-w-xl mx-auto py-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/categories">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Thêm Danh Mục Mới</h1>
      </div>

      <div className="bg-card border rounded-xl p-6">
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
      </div>
    </div>
  );
}
