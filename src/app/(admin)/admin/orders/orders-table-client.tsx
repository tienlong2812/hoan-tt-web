'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Truck } from 'lucide-react';
import Link from 'next/link';
import { OrderStatusSelect } from './status-select';
import { updateOrderStatus } from './actions';
import { pushOrdersToGHN } from './ghn-actions';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { useRouter } from 'next/navigation';

interface OrdersTableClientProps {
  orders: any[];
}

export function OrdersTableClient({ orders }: OrdersTableClientProps) {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isPushing, setIsPushing] = useState(false);
  const router = useRouter();

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Only select pending or processing orders maybe? Or all.
      // Let's just select all
      setSelectedIds(new Set(orders.map(o => o.order_id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (checked: boolean, id: number) => {
    const newSet = new Set(selectedIds);
    if (checked) newSet.add(id);
    else newSet.delete(id);
    setSelectedIds(newSet);
  };

  const handlePushGHN = async () => {
    if (selectedIds.size === 0) return;
    setIsPushing(true);
    
    try {
      const orderIds = Array.from(selectedIds);
      const result = await pushOrdersToGHN(orderIds);
      
      if (result.success) {
        toast.success(`Đẩy GHN thành công ${result.successCount} đơn, thất bại ${result.failCount} đơn.`);
        setSelectedIds(new Set());
        router.refresh();
      } else {
        toast.error(result.error || 'Đã có lỗi xảy ra khi đẩy GHN.');
      }
    } catch (e: any) {
      toast.error('Lỗi khi gọi tác vụ đẩy GHN: ' + e.message);
    } finally {
      setIsPushing(false);
    }
  };

  return (
    <div className="w-full">
      {selectedIds.size > 0 && (
        <div className="mb-4 flex items-center justify-between bg-muted/50 p-3 rounded-lg border border-border">
          <span className="text-sm font-medium">Đã chọn {selectedIds.size} đơn hàng</span>
          <Button onClick={handlePushGHN} disabled={isPushing} className="gap-2 bg-green-600 hover:bg-green-700">
            <Truck className="h-4 w-4" />
            {isPushing ? 'Đang đẩy lên GHN...' : 'Xác nhận & Đẩy GHN'}
          </Button>
        </div>
      )}

      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-muted-foreground border-b border-border">
          <tr>
            <th className="p-4 text-center w-12">
              <Checkbox 
                checked={orders.length > 0 && selectedIds.size === orders.length}
                onCheckedChange={(checked) => handleSelectAll(checked === true)}
                aria-label="Chọn tất cả"
              />
            </th>
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
                <td className="p-4 text-center">
                  <Checkbox 
                    checked={selectedIds.has(order.order_id)}
                    onCheckedChange={(checked) => handleSelectOne(checked === true, order.order_id)}
                    aria-label={`Chọn đơn ${order.order_id}`}
                  />
                </td>
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
                    <input type="hidden" name="return_to" value="/admin/orders" />
                    <OrderStatusSelect currentStatus={order.order_status} />
                  </form>
                  {order.ghn_order_code && (
                    <div className="mt-2 text-xs font-semibold text-green-600 bg-green-50 inline-block px-2 py-0.5 rounded border border-green-200">
                      GHN: {order.ghn_order_code}
                    </div>
                  )}
                  {order.shipping_error && (
                    <div className="mt-2 text-xs font-semibold text-red-600 bg-red-50 inline-block px-2 py-0.5 rounded border border-red-200" title={order.shipping_error}>
                      Lỗi GHN
                    </div>
                  )}
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
              <td colSpan={8} className="p-8 text-center text-muted-foreground">
                Chưa có đơn hàng nào.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
