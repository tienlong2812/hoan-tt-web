'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Copy, Check, Info, ShieldCheck } from 'lucide-react';

interface PaymentQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number;
  amount: number;
  onConfirm?: () => void;
}

export function PaymentQrModal({
  isOpen,
  onClose,
  orderId,
  amount,
  onConfirm,
}: PaymentQrModalProps) {
  const [copiedAcc, setCopiedAcc] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [copiedDes, setCopiedDes] = useState(false);

  const accNumber = '4880683549';
  const bankName = 'BIDV';
  const accountHolder = 'HOAN TT';
  const transferMessage = `Thanh toan don hang #${orderId}`;

  const handleCopy = (text: string, type: 'acc' | 'amount' | 'des') => {
    navigator.clipboard.writeText(text);
    if (type === 'acc') {
      setCopiedAcc(true);
      setTimeout(() => setCopiedAcc(false), 1500);
    } else if (type === 'amount') {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 1500);
    } else if (type === 'des') {
      setCopiedDes(true);
      setTimeout(() => setCopiedDes(false), 1500);
    }
    toast.success('Đã sao chép thành công!');
  };

  const qrUrl = `https://qr.sepay.vn/img?acc=${accNumber}&bank=${bankName}&amount=${amount}&des=${encodeURIComponent(transferMessage)}`;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto rounded-2xl p-6">
        <DialogHeader className="text-center pb-2">
          <DialogTitle className="text-2xl font-bold flex items-center justify-center gap-2 text-primary">
            <span>Thanh Toán Chuyển Khoản</span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm text-center">
            Quét mã QR bằng ứng dụng ngân hàng của bạn để hoàn tất thanh toán.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center space-y-4 my-2">
          {/* QR Code Container */}
          <div className="relative bg-white p-3 rounded-2xl border-2 border-primary/20 shadow-md transition-all duration-300 hover:border-primary/50 max-w-[240px] aspect-square flex items-center justify-center">
            <img
              src={qrUrl}
              alt="Mã QR Chuyển Khoản"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="text-xs text-muted-foreground text-center bg-muted/40 px-3 py-1.5 rounded-full flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Mã QR VietQR động tạo tự động từ Sepay</span>
          </div>
        </div>

        {/* Banking Information Details */}
        <div className="space-y-3 bg-muted/30 p-4 rounded-xl border text-sm">
          <div className="flex justify-between items-center py-1">
            <span className="text-muted-foreground">Ngân hàng</span>
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <span className="bg-blue-600 text-white font-black text-[9px] px-1 rounded">BIDV</span>
              <span>BIDV - Đầu tư & Phát triển</span>
            </span>
          </div>

          <div className="flex justify-between items-center py-1 border-t border-dashed">
            <span className="text-muted-foreground">Chủ tài khoản</span>
            <span className="font-semibold text-foreground">{accountHolder}</span>
          </div>

          <div className="flex justify-between items-center py-1 border-t border-dashed">
            <span className="text-muted-foreground">Số tài khoản</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold font-mono text-foreground">{accNumber}</span>
              <button
                onClick={() => handleCopy(accNumber, 'acc')}
                className="text-muted-foreground hover:text-primary transition-colors p-1 rounded-md hover:bg-muted"
                title="Sao chép số tài khoản"
              >
                {copiedAcc ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center py-1 border-t border-dashed">
            <span className="text-muted-foreground">Số tiền</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-primary font-mono text-base">
                {amount.toLocaleString('vi-VN')} ₫
              </span>
              <button
                onClick={() => handleCopy(amount.toString(), 'amount')}
                className="text-muted-foreground hover:text-primary transition-colors p-1 rounded-md hover:bg-muted"
                title="Sao chép số tiền"
              >
                {copiedAmount ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center py-1 border-t border-dashed">
            <span className="text-muted-foreground">Nội dung CK</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold font-mono text-foreground text-xs bg-primary/5 px-2 py-0.5 rounded border border-primary/20">
                {transferMessage}
              </span>
              <button
                onClick={() => handleCopy(transferMessage, 'des')}
                className="text-muted-foreground hover:text-primary transition-colors p-1 rounded-md hover:bg-muted"
                title="Sao chép nội dung"
              >
                {copiedDes ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Warning Alert */}
        <div className="flex gap-2 items-start text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 p-3 rounded-xl mt-3">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Lưu ý quan trọng:</p>
            <p>Vui lòng chuyển khoản chính xác <strong>số tiền</strong> và <strong>nội dung</strong> ở trên để hệ thống tự động xác nhận đơn hàng của bạn.</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-4 border-t mt-4">
          <Button
            onClick={onConfirm || onClose}
            className="w-full rounded-full h-11 text-sm font-semibold shadow-md hover:shadow-lg transition-all"
          >
            Đã Chuyển Khoản Thành Công
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full rounded-full h-11 text-sm font-semibold"
          >
            Hủy / Thanh Toán Sau
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
