import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { requestCancelOrder } from './actions';
import { OrderPaymentButton } from './order-payment-button';

export default async function OrdersPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: orders } = await supabase
    .from('orders')
    .select('*, order_items(*, products(product_name, thumbnail_url), product_variants(variant_name))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Quản Lý Đơn Hàng</h1>
        <p className="text-muted-foreground mt-1">Lịch sử giao dịch và trạng thái đơn hàng của bạn.</p>
      </div>
      {orders && orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.order_id} className="border rounded-xl p-6 bg-card text-card-foreground shadow-sm">
              <div className="flex flex-col md:flex-row justify-between mb-4 pb-4 border-b gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Mã đơn hàng #{order.order_id}</div>
                  <div className="font-medium text-lg">{order.total_amount.toLocaleString('vi-VN')} ₫</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={order.order_status === 'delivered' ? 'default' : 'secondary'}>
                    {order.order_status === 'pending' ? 'Chờ xác nhận' :
                     order.order_status === 'processing' ? 'Đang lấy hàng' :
                     order.order_status === 'shipped' ? 'Đang giao' :
                     order.order_status === 'delivered' ? 'Đã giao' :
                     order.order_status === 'cancelled' ? 'Đã hủy' : order.order_status.toUpperCase()}
                  </Badge>
                  
                  {order.payment_method === 'BankTransfer' ? (
                    <Badge variant={order.payment_status === 'paid' ? 'default' : 'secondary'} className={order.payment_status === 'paid' ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-0' : 'bg-amber-500 hover:bg-amber-600 text-white border-0'}>
                      {order.payment_status === 'paid' ? 'Đã thanh toán (VietQR)' : 'Chờ thanh toán (VietQR)'}
                    </Badge>
                  ) : (
                    <Badge variant="outline">{order.payment_method}</Badge>
                  )}

                  {order.payment_method === 'BankTransfer' && order.payment_status === 'pending' && order.order_status !== 'cancelled' && (
                    <OrderPaymentButton orderId={order.order_id} amount={order.total_amount} />
                  )}

                  {order.order_status === 'pending' && (
                    <form action={requestCancelOrder}>
                      <input type="hidden" name="order_id" value={order.order_id} />
                      <Button variant="destructive" size="sm" className="h-6 text-[11px] uppercase ml-2 px-2 py-0">Yêu cầu hủy</Button>
                    </form>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                {order.order_items.map((item: any) => (
                  <div key={item.order_item_id} className="flex gap-4">
                    <img src={item.products?.thumbnail_url || ''} alt="" className="w-16 h-16 rounded object-cover bg-muted" />
                    <div>
                      <div className="font-medium">{item.products?.product_name || 'Unknown Product'}</div>
                      {item.product_variants?.variant_name && (
                        <div className="text-xs text-primary font-medium">{item.product_variants.variant_name}</div>
                      )}
                      <div className="text-sm text-muted-foreground">SL: {item.quantity} x {item.price_at_purchase.toLocaleString('vi-VN')} ₫</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t flex flex-col gap-2">
                <div className="text-sm text-muted-foreground font-medium">Đặt ngày: {new Date(order.created_at).toLocaleDateString('vi-VN')}</div>
                <div className="text-sm text-muted-foreground overflow-hidden">
                  {order.receiver_name && (
                    <span>{order.receiver_name} · {order.receiver_phone}</span>
                  )}
                  {order.detail_address && (
                    <div className="mt-0.5">{order.detail_address}{order.ward ? `, ${order.ward}` : ''}, {order.district}, {order.province}</div>
                  )}
                </div>
                {order.ghn_order_code && (
                  <div className="text-sm mt-1">
                    <span className="text-muted-foreground mr-1">Tra cứu vận đơn GHN:</span>
                    <a 
                      href={`https://donhang.ghn.vn/?order_code=${order.ghn_order_code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-green-600 hover:underline"
                      title="Nhấn vào để theo dõi tiến trình giao hàng"
                    >
                      {order.ghn_order_code}
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center bg-muted/10 border border-dashed rounded-xl flex items-center justify-center flex-col">
          <p className="text-muted-foreground">Bạn chưa có đơn hàng nào.</p>
        </div>
      )}
    </div>
  );
}
