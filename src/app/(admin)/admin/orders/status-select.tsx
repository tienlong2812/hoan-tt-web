'use client';

export function OrderStatusSelect({ orderId, currentStatus }: { orderId: number, currentStatus: string }) {
  return (
    <select 
      name="status" 
      defaultValue={currentStatus}
      onChange={(e) => e.target.form?.requestSubmit()}
      className="px-2 py-1 h-8 rounded border bg-background text-xs cursor-pointer focus:ring-1"
    >
      <option value="pending">Chờ xác nhận</option>
      <option value="processing">Đang lấy hàng</option>
      <option value="shipped">Đang giao</option>
      <option value="delivered">Đã giao</option>
      <option value="cancelled">Hủy</option>
    </select>
  );
}
