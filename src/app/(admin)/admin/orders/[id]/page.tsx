import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2 } from 'lucide-react';
import { updateOrderStatus } from '../actions';
import { AdminPageHeader, AdminPanel } from '@/components/admin/admin-page';

export default async function AdminOrderDetailsPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: order, error } = await supabase
    .from('orders')
    .select('*, users(full_name, email, phone_number), coupons(code, discount_type, discount_value)')
    .eq('order_id', params.id)
    .single();

  if (error || !order) {
    return notFound();
  }

  const { data: items } = await supabase
    .from('order_items')
    .select('*, products(product_name, thumbnail_url), product_variants(variant_name)')
    .eq('order_id', order.order_id);

  // Address fields are now stored directly on the order row
  const shippingAddr = {
    receiver_name: order.receiver_name,
    receiver_phone: order.receiver_phone,
    province: order.province,
    district: order.district,
    ward: order.ward,
    detail_address: order.detail_address,
  };

  const statusMap: Record<string, string> = {
    'pending': 'Chờ xác nhận',
    'processing': 'Đang chuẩn bị hàng',
    'shipped': 'Đang giao hàng',
    'delivered': 'Đã giao thành công',
    'cancelled': 'Đã hủy'
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
      <AdminPageHeader
        title={`Chi tiết đơn hàng #${order.order_id}`}
        description="Theo dõi sản phẩm, khách hàng, thanh toán và trạng thái giao hàng."
        backHref="/admin/orders"
        actions={
        <Badge variant={order.order_status === 'delivered' ? 'default' : order.order_status === 'cancelled' ? 'destructive' : 'secondary'}>
          {statusMap[order.order_status] || order.order_status}
        </Badge>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <AdminPanel>
            <h2 className="text-lg font-semibold mb-4">Sản Phẩm Đã Đặt</h2>
            <div className="space-y-4">
              {items?.map((item) => (
                <div key={item.order_item_id} className="flex gap-4 items-center border-b pb-4 last:border-0 last:pb-0">
                  <div className="h-16 w-16 bg-muted rounded-md border overflow-hidden shrink-0">
                    {item.products?.thumbnail_url && (
                      <img src={item.products.thumbnail_url} alt={item.products.product_name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium line-clamp-1">{item.products?.product_name || 'Sản phẩm đã bị xóa'}</p>
                    {item.product_variants?.variant_name && (
                      <p className="text-xs text-primary font-medium">{item.product_variants.variant_name}</p>
                    )}
                    <p className="text-sm text-muted-foreground">SL: {item.quantity}</p>
                  </div>
                  <div className="font-semibold text-right">
                    {(item.price_at_purchase * item.quantity).toLocaleString('vi-VN')} ₫
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-6" />
            
            <div className="space-y-3 font-medium text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Tạm tính</span>
                <span>{(order.total_amount - order.shipping_fee + (order.discount_amount || 0)).toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Phí vận chuyển</span>
                <span>{order.shipping_fee === 0 ? 'Miễn phí' : `${order.shipping_fee.toLocaleString('vi-VN')} ₫`}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Mã giảm giá {(order.coupons as any)?.code ? `(${(order.coupons as any).code})` : ''}</span>
                  <span>-{order.discount_amount.toLocaleString('vi-VN')} ₫</span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between text-lg font-bold text-primary">
                <span>Tổng Cộng</span>
                <span>{order.total_amount.toLocaleString('vi-VN')} ₫</span>
              </div>
            </div>
          </AdminPanel>
        </div>

        <div className="space-y-8">
          <AdminPanel>
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">Cập Nhật Trạng Thái</h2>
            <form action={updateOrderStatus} className="space-y-4">
              <input type="hidden" name="order_id" value={order.order_id} />
              <input type="hidden" name="return_to" value={`/admin/orders/${order.order_id}`} />
              <div className="space-y-2">
                <label className="text-sm font-medium">Trạng thái đơn hàng</label>
                <select 
                  name="status" 
                  defaultValue={order.order_status}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="pending">Chờ xác nhận</option>
                  <option value="processing">Đang chuẩn bị hàng</option>
                  <option value="shipped">Đang giao hàng</option>
                  <option value="delivered">Đã giao thành công</option>
                  <option value="cancelled">Hủy đơn</option>
                </select>
              </div>
              
              <div className="space-y-2 pt-2">
                <label className="text-sm font-medium">Trạng thái thanh toán</label>
                <select 
                  name="payment_status" 
                  defaultValue={order.payment_status}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="pending">Chờ thanh toán</option>
                  <option value="paid">Đã thanh toán</option>
                  <option value="failed">Lỗi thanh toán</option>
                  <option value="refunded">Đã hoàn tiền</option>
                </select>
              </div>

              <Button type="submit" className="w-full mt-4">
                <CheckCircle2 className="h-4 w-4 mr-2" /> Lưu Trạng Thái
              </Button>
            </form>
          </AdminPanel>

          <AdminPanel>
            <h2 className="text-lg font-semibold mb-4 border-b pb-2">Thông Tin Khách Hàng</h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs">Người Đặt</span>
                <span className="font-medium">{(order.users as any)?.full_name || 'Khách Vãng Lai'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Email</span>
                <span>{(order.users as any)?.email || 'Không có'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Người Nhận Hàng</span>
                <span className="font-medium">{shippingAddr.receiver_name}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Số Điện Thoại</span>
                <span className="font-medium">{shippingAddr.receiver_phone}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Địa Chỉ Giao Hàng</span>
                <span>{shippingAddr.detail_address}, {shippingAddr.ward ? shippingAddr.ward + ', ' : ''}{shippingAddr.district}, {shippingAddr.province}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs mt-2">Phương thức thanh toán</span>
                <Badge variant="outline" className="uppercase">{order.payment_method}</Badge>
              </div>
            </div>
          </AdminPanel>
        </div>
      </div>
    </div>
  );
}
