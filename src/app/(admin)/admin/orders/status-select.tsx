'use client';

export function OrderStatusSelect({ currentStatus }: { currentStatus: string }) {
  const isDelivered = currentStatus === 'delivered';
  return (
    <select 
      name="status" 
      defaultValue={currentStatus}
      onChange={(e) => e.target.form?.requestSubmit()}
      disabled={isDelivered}
      className={`px-2 py-1 h-8 rounded border text-xs ${isDelivered ? 'bg-gray-100 cursor-not-allowed opacity-70' : 'bg-background cursor-pointer focus:ring-1'}`}
    >
      <option value="pending">Chờ xác nhận</option>
      <option value="processing">Đang lấy hàng</option>
      <option value="shipped">Đang giao</option>
      <option value="delivered">Đã giao</option>
      <option value="cancelled">Hủy</option>
    </select>
  );
}
