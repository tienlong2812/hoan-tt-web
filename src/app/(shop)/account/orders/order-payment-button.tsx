'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PaymentQrModal } from '@/components/checkout/payment-qr-modal';

interface OrderPaymentButtonProps {
  orderId: number;
  amount: number;
}

export function OrderPaymentButton({ orderId, amount }: OrderPaymentButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="default"
        size="sm"
        className="h-7 text-[11px] uppercase bg-primary hover:bg-primary/95 text-white font-semibold flex items-center gap-1 px-3 py-1 rounded-full shadow-sm"
        onClick={() => setIsOpen(true)}
      >
        <span>Thanh toán ngay (Quét QR)</span>
      </Button>

      <PaymentQrModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={() => setIsOpen(false)}
        orderId={orderId}
        amount={amount}
      />
    </>
  );
}
