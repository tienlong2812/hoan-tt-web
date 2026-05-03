import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, Users, DollarSign } from 'lucide-react';
import { RevenueChart } from '@/components/admin/revenue-chart';
import { Badge } from '@/components/ui/badge';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const resolvedParams = await searchParams;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Default to last 30 days if no filter
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  
  const fromDate = resolvedParams.from ? new Date(`${resolvedParams.from}T00:00:00Z`) : thirtyDaysAgo;
  const toDate = resolvedParams.to ? new Date(`${resolvedParams.to}T23:59:59Z`) : today;

  const [{ count: productsCount }, { count: ordersCount }, { count: customersCount }] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', fromDate.toISOString()).lte('created_at', toDate.toISOString()),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'customer')
  ]);

  const { data: orders } = await supabase
    .from('orders')
    .select('*, users(full_name)')
    .gte('created_at', fromDate.toISOString())
    .lte('created_at', toDate.toISOString())
    .order('created_at', { ascending: false });

  // For recent orders list, just take top 5 of the filtered ones
  const recentOrders = orders?.slice(0, 5) || [];

  const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

  return (
    <>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
        
        <form className="flex flex-wrap items-center gap-2">
          <Input type="date" name="from" defaultValue={resolvedParams.from} className="w-auto" title="Từ ngày" />
          <span className="text-muted-foreground">-</span>
          <Input type="date" name="to" defaultValue={resolvedParams.to} className="w-auto" title="Đến ngày" />
          <Button type="submit" variant="secondary">Lọc Báo Cáo</Button>
          {(resolvedParams.from || resolvedParams.to) && (
            <Link href="/admin">
              <Button variant="ghost">Xóa lọc</Button>
            </Link>
          )}
        </form>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue.toLocaleString('vi-VN')} ₫</div>
            <p className="text-xs text-muted-foreground">From paid orders</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{ordersCount || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products in Catalog</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{productsCount || 0}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{customersCount || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3 mt-8">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Tổng Quan Doanh Thu</CardTitle>
          </CardHeader>
          <CardContent>
             {orders ? <RevenueChart data={orders} /> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Đơn Hàng Gần Đây</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentOrders.map(o => (
                <div key={o.order_id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{(o.users as any)?.full_name || 'Khách'}</p>
                    <p className="text-sm text-muted-foreground">
                      #{o.order_id} - {new Date(o.created_at).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="font-medium text-sm">+{o.total_amount.toLocaleString('vi-VN')}₫</div>
                    <Badge variant="outline" className="text-[10px] h-4 leading-none">{o.order_status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
