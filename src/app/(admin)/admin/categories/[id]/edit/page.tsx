import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateCategoryAction } from '../../actions';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';

export default async function EditCategoryPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: category, error } = await supabase.from('categories').select('*').eq('category_id', params.id).single();

  if (error || !category) {
    return notFound();
  }

  return (
    <div className="max-w-xl mx-auto py-6">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/categories">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Sửa Danh Mục</h1>
      </div>

      <div className="bg-card border rounded-xl p-6">
        <form action={updateCategoryAction} className="space-y-6">
          <input type="hidden" name="category_id" value={category.category_id} />
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="category_name">Tên danh mục *</Label>
              <Input id="category_name" name="category_name" defaultValue={category.category_name} required />
            </div>

            <div>
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input id="slug" name="slug" defaultValue={category.slug} />
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
