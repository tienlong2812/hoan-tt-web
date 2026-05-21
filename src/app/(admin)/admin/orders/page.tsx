import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { updateOrderStatus } from './actions';
import { Eye } from 'lucide-react';
import { OrderStatusSelect } from './status-select';
import { ExportOrdersModal } from './export-modal';
import { OrdersTableClient } from './orders-table-client';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { AdminPageHeader, AdminPanel, AdminTableShell } from '@/components/admin/admin-page';

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; from?: string; to?: string }>;
}) {
  const resolvedParams = await searchParams;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  let query = supabase
    .from('orders')
    .select('*, users(full_name, email)')
    .order('created_at', { ascending: false });

  if (resolvedParams.from) {
    query = query.gte('created_at', `${resolvedParams.from}T00:00:00Z`);
  }
  if (resolvedParams.to) {
    query = query.lte('created_at', `${resolvedParams.to}T23:59:59Z`);
  }

  if (resolvedParams.q) {
    const q = resolvedParams.q.trim();
    if (!isNaN(Number(q))) {
      // If it's a number, search by order_id
      query = query.eq('order_id', Number(q));
    } else {
      // Search by receiver name or phone
      query = query.or(`receiver_name.ilike.%${q}%,receiver_phone.ilike.%${q}%`);
    }
  }

  const { data: orders } = await query;
  
  const filteredRevenue = orders?.reduce((acc, o) => acc + Number(o.total_amount), 0) || 0;

  return (
    <>
      <AdminPageHeader
        title="Quản lý đơn hàng"
        description={`Tìm thấy ${orders?.length || 0} đơn hàng. Tổng giá trị: ${filteredRevenue.toLocaleString('vi-VN')} ₫.`}
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
      </AdminTableShell>
    </>
  );
}
