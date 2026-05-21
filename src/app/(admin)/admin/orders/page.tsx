import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ExportOrdersModal } from './export-modal';
import { OrdersTableClient } from './orders-table-client';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { AdminPageHeader, AdminPanel, AdminTableShell } from '@/components/admin/admin-page';
import { AdminPagination } from '@/components/admin/admin-pagination';

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; from?: string; to?: string; page?: string; limit?: string }>;
}) {
  const resolvedParams = await searchParams;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Parse page and limit parameters
  const page = Math.max(1, Number(resolvedParams.page) || 1);
  const limit = Number(resolvedParams.limit) || 20;
  const fromIndex = (page - 1) * limit;
  const toIndex = fromIndex + limit - 1;

  // Base queries
  let countQuery = supabase
    .from('orders')
    .select('*', { count: 'exact', head: true });

  let revenueQuery = supabase
    .from('orders')
    .select('total_amount');

  let query = supabase
    .from('orders')
    .select('*, users(full_name, email)')
    .order('created_at', { ascending: false });

  // Apply filters
  if (resolvedParams.from) {
    const fromStr = `${resolvedParams.from}T00:00:00Z`;
    countQuery = countQuery.gte('created_at', fromStr);
    revenueQuery = revenueQuery.gte('created_at', fromStr);
    query = query.gte('created_at', fromStr);
  }
  if (resolvedParams.to) {
    const toStr = `${resolvedParams.to}T23:59:59Z`;
    countQuery = countQuery.lte('created_at', toStr);
    revenueQuery = revenueQuery.lte('created_at', toStr);
    query = query.lte('created_at', toStr);
  }

  if (resolvedParams.q) {
    const q = resolvedParams.q.trim();
    if (!isNaN(Number(q))) {
      countQuery = countQuery.eq('order_id', Number(q));
      revenueQuery = revenueQuery.eq('order_id', Number(q));
      query = query.eq('order_id', Number(q));
    } else {
      const searchStr = `receiver_name.ilike.%${q}%,receiver_phone.ilike.%${q}%`;
      countQuery = countQuery.or(searchStr);
      revenueQuery = revenueQuery.or(searchStr);
      query = query.or(searchStr);
    }
  }

  // Execute queries for count, revenue, and paginated orders
  const { count: totalItems } = await countQuery;
  const { data: revenueData } = await revenueQuery;
  const filteredRevenue = revenueData?.reduce((acc, o) => acc + Number(o.total_amount), 0) || 0;

  query = query.range(fromIndex, toIndex);
  const { data: orders } = await query;

  return (
    <>
      <AdminPageHeader
        title="Quản lý đơn hàng"
        description={`Tìm thấy ${totalItems || 0} đơn hàng. Tổng giá trị: ${filteredRevenue.toLocaleString('vi-VN')} ₫.`}
        actions={<ExportOrdersModal />}
      />

      <AdminPanel className="p-4 md:p-4">
          <form className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                name="q" 
                defaultValue={resolvedParams.q}
                placeholder="SĐT, Tên, ID đơn..." 
                className="pl-8 w-[200px]"
              />
            </div>
            <div className="flex items-center gap-2">
              <Input type="date" name="from" defaultValue={resolvedParams.from} className="w-auto" title="Từ ngày" />
              <span className="text-muted-foreground">-</span>
              <Input type="date" name="to" defaultValue={resolvedParams.to} className="w-auto" title="Đến ngày" />
            </div>
            <Button type="submit" variant="secondary">Lọc</Button>
            {(resolvedParams.q || resolvedParams.from || resolvedParams.to) && (
              <Link href="/admin/orders">
                <Button variant="ghost">Xóa lọc</Button>
              </Link>
            )}
          </form>
      </AdminPanel>

      <AdminTableShell>
        <OrdersTableClient orders={orders || []} />
        <AdminPagination
          totalItems={totalItems || 0}
          currentPage={page}
          pageSize={limit}
        />
      </AdminTableShell>
    </>
  );
}
