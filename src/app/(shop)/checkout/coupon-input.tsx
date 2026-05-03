'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tag, X } from 'lucide-react';
import { validateCoupon } from './coupon-actions';
import { toast } from 'sonner';

type CouponResult = {
  coupon_id: number;
  discount_amount: number;
  message: string;
};

export function CouponInput({
  orderTotal,
  onApply
}: {
  orderTotal: number;
  onApply: (result: CouponResult | null) => void;
}) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState<CouponResult | null>(null);

  async function handleApply() {
    if (!code.trim()) return;
    setLoading(true);
    const result = await validateCoupon(code, orderTotal);
    setLoading(false);

    if ('error' in result) {
      toast.error(result.error);
    } else {
      setApplied(result);
      onApply(result);
      toast.success(`Áp dụng thành công! ${result.message}`);
    }
  }

  function handleRemove() {
    setApplied(null);
    setCode('');
    onApply(null);
  }

  if (applied) {
    return (
      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
        <div className="flex items-center gap-2 text-emerald-700">
          <Tag className="h-4 w-4" />
          <span className="font-medium text-sm">{applied.message}</span>
        </div>
        <button onClick={handleRemove} className="text-emerald-600 hover:text-emerald-800">
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Input
        placeholder="Nhập mã giảm giá..."
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        onKeyDown={(e) => e.key === 'Enter' && handleApply()}
        className="font-mono tracking-wider"
      />
      <Button
        type="button"
        variant="outline"
        onClick={handleApply}
        disabled={loading || !code.trim()}
        className="shrink-0"
      >
        {loading ? '...' : 'Áp dụng'}
      </Button>
    </div>
  );
}
