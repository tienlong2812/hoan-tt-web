import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { updateOrderStatus } from './actions';
import { Eye } from 'lucide-react';
import { OrderStatusSelect } from './status-select';
import { ExportOrdersModal } from './export-modal';

import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản Lý Đơn Hàng</h1>
          <p className="text-muted-foreground mt-1">Tìm thấy {orders?.length || 0} đơn hàng | Tổng: {filteredRevenue.toLocaleString('vi-VN')} ₫</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <ExportOrdersModal />
          <form className="flex flex-wrap items-center gap-3 flex-1 md:flex-initial">
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
      </div>
      </div>

      <div className="border rounded-xl bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground border-b border-border">
              <tr>
                <th className="font-medium text-left p-4">ID Đơn Hàng</th>
                <th className="font-medium text-left p-4">Khách Hàng</th>
                <th className="font-medium text-left p-4">Ngày Đặt</th>
                <th className="font-medium text-right p-4">Tổng Tiền</th>
                <th className="font-medium text-center p-4">Thanh Toán</th>
                <th className="font-medium text-center p-4">Trạng Thái</th>
                <th className="font-medium text-right p-4">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders && orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.order_id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-medium">#{order.order_id}</td>
                    <td className="p-4">
                      <div className="font-medium">{(order.users as any)?.full_name || 'Khách'}</div>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-4 text-right font-medium">
                      {order.total_amount.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="p-4 text-center">
                      <Badge variant="outline">{order.payment_status}</Badge>
                    </td>
                    <td className="p-4 text-center">
                      <form action={updateOrderStatus}>
                        <input type="hidden" name="order_id" value={order.order_id} />
                        <OrderStatusSelect orderId={order.order_id} currentStatus={order.order_status} />
                      </form>
                    </td>
                    <td className="p-4 text-right">
                       <Link href={`/admin/orders/${order.order_id}`}>
                         <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted" title="Xem chi tiết">
                           <Eye className="h-4 w-4" />
                         </Button>
                       </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    Chưa có đơn hàng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
