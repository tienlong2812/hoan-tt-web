import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, Users, DollarSign, CalendarDays, type LucideIcon } from 'lucide-react';
import { RevenueChart } from '@/components/admin/revenue-chart';
import { Badge } from '@/components/ui/badge';

import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { cn } from '@/lib/utils';

const orderStatusLabels: Record<string, string> = {
  pending: 'Chờ xử lý',
  processing: 'Đang xử lý',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  completed: 'Hoàn tất',
  cancelled: 'Đã hủy',
  returned: 'Hoàn trả',
};

function formatCurrency(value: number) {
  return `${value.toLocaleString('vi-VN')} ₫`;
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  tone = 'primary',
}: {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  tone?: 'primary' | 'accent' | 'neutral';
}) {
  return (
    <Card className="border-0 bg-card shadow-sm ring-1 ring-border/70">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-1">
        <div className="space-y-1">
          <CardDescription className="font-medium">{title}</CardDescription>
          <CardTitle className="text-2xl font-bold tracking-tight md:text-3xl">{value}</CardTitle>
        </div>
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-2xl',
            tone === 'primary' && 'bg-primary/10 text-primary',
            tone === 'accent' && 'bg-accent/10 text-accent',
            tone === 'neutral' && 'bg-muted text-muted-foreground'
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

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
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('order_date', fromDate.toISOString())
      .lte('order_date', toDate.toISOString()),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
  ]);

  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('*, users(full_name), order_items(quantity, price_at_purchase, product_id, products(product_name))')
    .gte('order_date', fromDate.toISOString())
    .lte('order_date', toDate.toISOString())
    .order('order_date', { ascending: false });

  if (ordersError) {
    console.error('Error fetching orders:', ordersError);
  }

  // For recent orders list, just take top 5 of the filtered ones
  const recentOrders = orders?.slice(0, 5) || [];

  const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

  // Aggregate Top 10 Customers
  const customerMap = new Map<string, { name: string, totalSpent: number, orderCount: number }>();
  orders?.forEach(order => {
    if (order.user_id) {
      const name = (order.users as any)?.full_name || 'Khách hàng';
      const existing = customerMap.get(order.user_id) || { name, totalSpent: 0, orderCount: 0 };
      existing.totalSpent += Number(order.total_amount);
      existing.orderCount += 1;
      customerMap.set(order.user_id, existing);
    }
  });
  const topCustomers = Array.from(customerMap.values())
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 10);

  // Aggregate Top 10 Products
  const productMap = new Map<number, { name: string, quantity: number, revenue: number }>();
  orders?.forEach(order => {
    order.order_items?.forEach((item: any) => {
      if (item.product_id && item.products) {
        const name = item.products.product_name;
        const existing = productMap.get(item.product_id) || { name, quantity: 0, revenue: 0 };
        existing.quantity += item.quantity;
        existing.revenue += (item.quantity * Number(item.price_at_purchase));
        productMap.set(item.product_id, existing);
      }
    });
  });
  const topProducts = Array.from(productMap.values())
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  const fromLabel = fromDate.toLocaleDateString('vi-VN');
  const toLabel = toDate.toLocaleDateString('vi-VN');

  return (
    <>
      <section className="rounded-3xl border bg-card p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-2">
            <Badge variant="secondary" className="h-6 rounded-full px-3">Tổng quan</Badge>
            <div>
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Dashboard</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Theo dõi doanh thu, đơn hàng và hiệu suất bán hàng từ {fromLabel} đến {toLabel}.
              </p>
            </div>
          </div>

          <form className="flex flex-col gap-3 rounded-2xl border bg-muted/30 p-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              Khoảng ngày
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                type="date"
                name="from"
                defaultValue={resolvedParams.from}
                className="h-9 bg-background sm:w-[150px]"
                title="Từ ngày"
              />
              <span className="hidden text-muted-foreground sm:inline">-</span>
              <Input
                type="date"
                name="to"
                defaultValue={resolvedParams.to}
                className="h-9 bg-background sm:w-[150px]"
                title="Đến ngày"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="h-9 flex-1 sm:flex-none">Lọc</Button>
              {(resolvedParams.from || resolvedParams.to) && (
                <Link href="/admin" className={buttonVariants({ variant: 'ghost', className: 'h-9 flex-1 sm:flex-none' })}>
                  Xóa
                </Link>
              )}
            </div>
          </form>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Doanh thu"
          value={formatCurrency(totalRevenue)}
          description="Tổng doanh thu trong khoảng lọc"
          icon={DollarSign}
          tone="primary"
        />
        <MetricCard
          title="Đơn hàng"
          value={(ordersCount || 0).toLocaleString('vi-VN')}
          description="Số đơn hàng trong khoảng lọc"
          icon={ShoppingCart}
          tone="accent"
        />
        <MetricCard
          title="Sản phẩm"
          value={(productsCount || 0).toLocaleString('vi-VN')}
          description="Tổng sản phẩm trong catalog"
          icon={Package}
          tone="neutral"
        />
        <MetricCard
          title="Khách hàng"
          value={(customersCount || 0).toLocaleString('vi-VN')}
          description="Tài khoản có vai trò khách hàng"
          icon={Users}
          tone="neutral"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="border-0 shadow-sm ring-1 ring-border/70 lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Tổng quan doanh thu</CardTitle>
              <CardDescription>10 ngày gần nhất có phát sinh đơn trong khoảng lọc</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {orders ? <RevenueChart data={orders} /> : <EmptyState>Không thể tải dữ liệu doanh thu.</EmptyState>}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm ring-1 ring-border/70">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Đơn hàng gần đây</CardTitle>
              <CardDescription>5 đơn mới nhất trong khoảng lọc</CardDescription>
            </div>
            <Link href="/admin/orders" className="text-sm font-medium text-primary hover:underline">Xem tất cả</Link>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <Link
                    key={order.order_id}
                    href={`/admin/orders/${order.order_id}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border bg-background p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="min-w-0 space-y-1">
                      <p className="truncate text-sm font-semibold">{(order.users as any)?.full_name || 'Khách'}</p>
                      <p className="text-xs text-muted-foreground">
                        #{order.order_id} · {new Date(order.order_date).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="text-sm font-bold text-primary">{formatCurrency(Number(order.total_amount))}</span>
                      <Badge variant="outline" className="h-5 text-[10px]">
                        {orderStatusLabels[order.order_status] || order.order_status}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState>Chưa có đơn hàng trong khoảng thời gian này.</EmptyState>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="border-0 shadow-sm ring-1 ring-border/70">
          <CardHeader>
            <CardTitle>Top hàng bán chạy</CardTitle>
            <CardDescription>10 sản phẩm có số lượng bán cao nhất</CardDescription>
          </CardHeader>
          <CardContent>
            {topProducts.length > 0 ? (
              <div className="space-y-3">
                {topProducts.map((product, index) => (
                  <div key={`${product.name}-${index}`} className="flex items-center justify-between gap-4 rounded-2xl border bg-background p-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {index + 1}
                      </div>
                      <div className="min-w-0 space-y-1">
                        <p className="truncate text-sm font-semibold" title={product.name}>{product.name}</p>
                        <p className="text-xs text-muted-foreground">Đã bán {product.quantity.toLocaleString('vi-VN')} sản phẩm</p>
                      </div>
                    </div>
                    <div className="shrink-0 text-sm font-bold text-primary">{formatCurrency(product.revenue)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState>Chưa có dữ liệu sản phẩm bán chạy.</EmptyState>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm ring-1 ring-border/70">
          <CardHeader>
            <CardTitle>Top khách mua nhiều</CardTitle>
            <CardDescription>10 khách hàng có tổng chi tiêu cao nhất</CardDescription>
          </CardHeader>
          <CardContent>
            {topCustomers.length > 0 ? (
              <div className="space-y-3">
                {topCustomers.map((customer, index) => (
                  <div key={`${customer.name}-${index}`} className="flex items-center justify-between gap-4 rounded-2xl border bg-background p-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
                        {index + 1}
                      </div>
                      <div className="min-w-0 space-y-1">
                        <p className="truncate text-sm font-semibold">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">{customer.orderCount.toLocaleString('vi-VN')} đơn hàng</p>
                      </div>
                    </div>
                    <div className="shrink-0 text-sm font-bold text-primary">{formatCurrency(customer.totalSpent)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState>Chưa có dữ liệu khách hàng.</EmptyState>
            )}
          </CardContent>
        </Card>
      </section>
    </>
  );
}
