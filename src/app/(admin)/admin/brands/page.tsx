import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { deleteBrandAction } from './actions';
import { AdminPageHeader, AdminTableShell } from '@/components/admin/admin-page';

export default async function AdminBrandsPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: brands } = await supabase.from('brands').select('*').order('brand_id', { ascending: false });

  return (
    <>
      <AdminPageHeader
        title="Quản lý thương hiệu"
        description="Quản lý thông tin thương hiệu và logo hiển thị trên shop."
        actions={
        <Link href="/admin/brands/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Thêm Thương Hiệu
          </Button>
        </Link>
        }
      />

      <AdminTableShell>
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground border-b border-border">
              <tr>
                <th className="font-semibold text-left p-4 w-20">ID</th>
                <th className="font-semibold text-left p-4">Tên Thương Hiệu</th>
                <th className="font-semibold text-left p-4">Mô tả</th>
                <th className="font-semibold text-right p-4 w-32">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {brands && brands.length > 0 ? (
                brands.map((b) => (
                  <tr key={b.brand_id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 text-muted-foreground">#{b.brand_id}</td>
                    <td className="p-4 font-medium text-foreground">{b.brand_name}</td>
                    <td className="p-4 text-muted-foreground">{b.description || '-'}</td>
                    <td className="p-4 text-right space-x-1">
                       <Link href={`/admin/brands/${b.brand_id}/edit`}>
                         <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted">
                           <Edit className="h-4 w-4" />
                         </Button>
                       </Link>
                       <form className="inline-block" action={deleteBrandAction}>
                         <input type="hidden" name="brand_id" value={b.brand_id} />
                         <Button type="submit" variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600">
                           <Trash2 className="h-4 w-4" />
                         </Button>
                       </form>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    Chưa có thương hiệu nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
      </AdminTableShell>
    </>
  );
}
