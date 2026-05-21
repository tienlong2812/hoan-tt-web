import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { deleteCategoryAction } from './actions';
import { AdminPageHeader, AdminTableShell } from '@/components/admin/admin-page';
import { ConfirmSubmitButton } from '@/components/admin/confirm-submit-button';
import { AdminPagination } from '@/components/admin/admin-pagination';

export default async function AdminCategoriesPage(props: {
  searchParams: Promise<{ page?: string; limit?: string }>;
}) {
  const searchParams = await props.searchParams;
  const page = Math.max(1, Number(searchParams.page) || 1);
  const limit = Number(searchParams.limit) || 20;
  const fromIndex = (page - 1) * limit;
  const toIndex = fromIndex + limit - 1;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Get total count of categories
  const { count: totalItems } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true });

  // Get paginated categories
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('category_id', { ascending: false })
    .range(fromIndex, toIndex);

  return (
    <>
      <AdminPageHeader
        title="Quản lý danh mục"
        description="Tổ chức nhóm sản phẩm và đường dẫn danh mục."
        actions={
        <Link href="/admin/categories/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Thêm Danh Mục
          </Button>
        </Link>
        }
      />

      <AdminTableShell>
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground border-b border-border">
              <tr>
                <th className="font-semibold text-left p-4 w-20">ID</th>
                <th className="font-semibold text-left p-4">Tên Danh Mục</th>
                <th className="font-semibold text-left p-4">Slug (URL)</th>
                <th className="font-semibold text-right p-4 w-32">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories && categories.length > 0 ? (
                categories.map((c) => (
                  <tr key={c.category_id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 text-muted-foreground">#{c.category_id}</td>
                    <td className="p-4 font-medium text-foreground">{c.category_name}</td>
                    <td className="p-4 text-muted-foreground">{c.slug}</td>
                    <td className="p-4 text-right space-x-1">
                       <Link href={`/admin/categories/${c.category_id}/edit`}>
                         <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted">
                           <Edit className="h-4 w-4" />
                         </Button>
                       </Link>
                       <form className="inline-block" action={deleteCategoryAction}>
                         <input type="hidden" name="category_id" value={c.category_id} />
                          <ConfirmSubmitButton
                            message={`Bạn có chắc muốn xóa danh mục "${c.category_name}"?`}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </ConfirmSubmitButton>
                        </form>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    Chưa có danh mục nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
      </AdminTableShell>
      <AdminPagination
        totalItems={totalItems || 0}
        currentPage={page}
        pageSize={limit}
      />
    </>
  );
}
