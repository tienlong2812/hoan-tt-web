'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Truck } from 'lucide-react';
import { pushOrdersToGHN } from '../ghn-actions';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function GhnPushButton({ orderId }: { orderId: number }) {
  const [isPushing, setIsPushing] = useState(false);
  const router = useRouter();

  const handlePush = async () => {
    setIsPushing(true);
    try {
      const result = await pushOrdersToGHN([orderId]);
      if (result.success && (result.successCount || 0) > 0) {
        toast.success('Tạo đơn vận chuyển thành công!');
        router.refresh();
      } else {
        toast.error(result.error || 'Có lỗi xảy ra, vui lòng kiểm tra log lỗi vận chuyển.');
        router.refresh(); // refresh to show the error on UI
      }
    } catch (e: any) {
      toast.error('Lỗi ngoại lệ: ' + e.message);
    } finally {
      setIsPushing(false);
    }
  };

  return (
    <Button onClick={handlePush} disabled={isPushing} className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white">
      <Truck className="h-4 w-4 mr-2" />
      {isPushing ? 'Đang xử lý...' : 'Gửi đơn vị vận chuyển'}
    </Button>
  );
}
