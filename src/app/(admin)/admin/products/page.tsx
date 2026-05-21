import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Search as SearchIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ImportExcelModal } from './import-modal';
import { ExportProductsModal } from './export-modal';
import { AdminPageHeader, AdminPanel, AdminTableShell } from '@/components/admin/admin-page';
import { deleteProductAction } from './actions';
import { ConfirmSubmitButton } from '@/components/admin/confirm-submit-button';
import { AdminPagination } from '@/components/admin/admin-pagination';

export default async function AdminProductsPage(props: {
  searchParams: Promise<{ q?: string; category?: string; page?: string; limit?: string }>;
}) {
  const searchParams = await props.searchParams;
  const q = searchParams?.q || '';
  const categoryFilter = searchParams?.category || '';
  const page = Math.max(1, Number(searchParams?.page) || 1);
  const limit = Number(searchParams?.limit) || 20;
  const fromIndex = (page - 1) * limit;
  const toIndex = fromIndex + limit - 1;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Fetch Categories for Filter Dropdown
  const { data: categories } = await supabase.from('categories').select('*');

  // Build Count Query
  let countQuery = supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  // Build Main Query
  let query = supabase
    .from('products')
    .select('*, brands(brand_name), categories(category_name)')
    .order('created_at', { ascending: false });

  if (q) {
    countQuery = countQuery.ilike('product_name', `%${q}%`);
    query = query.ilike('product_name', `%${q}%`);
  }
  if (categoryFilter) {
    countQuery = countQuery.eq('category_id', categoryFilter);
    query = query.eq('category_id', categoryFilter);
  }

  const { count: totalItems } = await countQuery;

  query = query.range(fromIndex, toIndex);
  const { data: products } = await query;

  return (
    <>
      <AdminPageHeader
        title="Quản lý sản phẩm"
        description="Quản lý danh mục sản phẩm, giá bán, trạng thái và import/export dữ liệu."
        actions={
        <>
          <ExportProductsModal />
          <ImportExcelModal />
          <Link href="/admin/products/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Thêm Sản Phẩm
            </Button>
          </Link>
        </>
        }
      />

      {/* Filters & Search */}
      <AdminPanel className="p-4 md:p-4">
        <form className="flex-1 flex items-center gap-4 w-full" method="GET">
          <div className="relative w-full max-w-sm">
            <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              name="q" 
              defaultValue={q} 
              placeholder="Tìm kiếm sản phẩm..." 
              className="pl-9 w-full bg-muted/50 focus-visible:bg-white transition-colors"
            />
          </div>
          
          <select 
            name="category"
            defaultValue={categoryFilter}
            className="flex h-10 w-full max-w-[200px] rounded-md border border-input bg-muted/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:bg-white transition-colors"
          >
            <option value="">Tất cả danh mục</option>
            {categories?.map(c => (
              <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
            ))}
          </select>

          <Button type="submit" variant="secondary">Lọc</Button>
          {(q || categoryFilter) && (
            <Link href="/admin/products" className="text-sm text-muted-foreground hover:text-foreground hover:underline ml-2">
              Xóa bộ lọc
            </Link>
          )}
        </form>
      </AdminPanel>

      <AdminTableShell>
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-muted-foreground border-b border-border">
              <tr>
                <th className="font-semibold text-left p-4">Sản Phẩm</th>
                <th className="font-semibold text-left p-4">Danh Mục / Hãng</th>
                <th className="font-semibold text-right p-4">Giá (VNĐ)</th>
                <th className="font-semibold text-right p-4">Tồn Kho</th>
                <th className="font-semibold text-center p-4">Trạng Thái</th>
                <th className="font-semibold text-right p-4 w-32">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products && products.length > 0 ? (
                products.map((p) => (
                  <tr key={p.product_id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-md bg-muted overflow-hidden shrink-0 border border-border/50">
                          {p.thumbnail_url ? (
                            <img src={p.thumbnail_url} className="w-full h-full object-cover" alt="" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-muted-foreground bg-secondary/50">No img</div>
                          )}
                        </div>
                        <span className="font-medium max-w-[200px] truncate block text-foreground" title={p.product_name}>
                          {p.product_name}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-foreground font-medium">{(p.categories as any)?.category_name || 'N/A'}</div>
                      <div className="text-xs text-muted-foreground">{(p.brands as any)?.brand_name}</div>
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="font-medium">{p.base_price.toLocaleString('vi-VN')} ₫</div>
                    </td>
                    <td className="p-4 text-right">
                      <span className="text-muted-foreground text-xs">Xem biến thể</span>
                    </td>
                    <td className="p-4 text-center">
                      <Badge variant={p.status === 'active' ? 'default' : 'secondary'} className={p.status === 'active' ? 'bg-primary/10 text-primary hover:bg-primary/20' : ''}>
                        {p.status === 'active' ? 'Hiển thị' : 'Ẩn'}
                      </Badge>
                    </td>
                    <td className="p-4 text-right space-x-1">
                       <Link href={`/admin/products/${p.product_id}/edit`}>
                         <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted text-muted-foreground hover:text-foreground">
                           <Edit className="h-4 w-4" />
                         </Button>
                       </Link>
                       <form className="inline-block" action={deleteProductAction.bind(null, p.product_id)}>
                          <ConfirmSubmitButton
                            message={`Bạn có chắc muốn xóa sản phẩm "${p.product_name}"?`}
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
                  <td colSpan={6} className="p-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <SearchIcon className="h-8 w-8 opacity-20" />
                      <p>Không tìm thấy sản phẩm nào.</p>
                    </div>
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
