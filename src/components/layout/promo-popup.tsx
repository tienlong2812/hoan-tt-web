'use client';

import { useState, useEffect } from 'react';
import { X, Tag, Gift, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const PROMO_CODE = 'GIAM50K';
const STORAGE_KEY = 'hoan_tt_promo_dismissed';

export function PromoPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    // Chỉ hiện nếu user chưa chọn "không hiển thị lại"
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      // Delay nhỏ để trang load xong rồi mới hiện popup
      const timer = setTimeout(() => setIsVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem(STORAGE_KEY, 'true');
    }
    setIsVisible(false);
  };

  const handleUseNow = () => {
    if (dontShowAgain) {
      localStorage.setItem(STORAGE_KEY, 'true');
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={handleClose}
      />

      {/* Popup */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="relative w-full max-w-md pointer-events-auto animate-in fade-in zoom-in-95 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Card */}
          <div className="rounded-2xl overflow-hidden shadow-2xl">
            {/* Header gradient */}
            <div className="relative bg-gradient-to-br from-primary via-primary/90 to-accent px-8 pt-10 pb-20 text-white text-center overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10" />
              <div className="absolute -bottom-10 -left-8 w-40 h-40 rounded-full bg-white/5" />
              <div className="absolute top-4 left-8 w-16 h-16 rounded-full bg-white/10" />

              {/* Gift icon */}
              <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4 ring-2 ring-white/30">
                <Gift className="h-8 w-8 text-white" />
              </div>

              <p className="text-white/80 text-sm font-medium tracking-wide uppercase mb-1">
                Quà tặng cho bạn
              </p>
              <h2 className="text-2xl font-extrabold tracking-tight relative">
                Giảm ngay 50.000đ
              </h2>
              <p className="text-white/70 text-sm mt-1 relative">
                cho đơn hàng đầu tiên của bạn
              </p>
            </div>

            {/* Body */}
            <div className="relative bg-white px-8 pt-6 pb-8">
              {/* Coupon code display */}
              <div className="-mt-12 mb-6 flex items-center justify-center relative z-10">
                <div className="flex items-center gap-2 bg-white border-2 border-dashed border-primary/40 rounded-xl px-6 py-3 shadow-xl">
                  <Tag className="h-5 w-5 text-primary shrink-0" />
                  <span className="text-xl font-black text-primary tracking-widest">
                    {PROMO_CODE}
                  </span>
                </div>
              </div>

              <p className="text-center text-muted-foreground text-sm mb-6 leading-relaxed">
                Áp dụng khi thanh toán để được giảm <strong className="text-foreground">50.000đ</strong> cho{' '}
                <strong className="text-foreground">đơn hàng từ 300.000đ</strong>.
                <br />
                Ưu đãi có hạn, nhanh tay thôi! 🎉
              </p>

              {/* CTA Button */}
              <Link
                href="/products"
                onClick={handleUseNow}
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold py-3.5 text-base shadow-lg hover:opacity-90 active:scale-95 transition-all duration-150"
              >
                Mua sắm ngay
                <ArrowRight className="h-5 w-5" />
              </Link>

              {/* Don't show again */}
              <div className="mt-4 flex items-center justify-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer group select-none">
                  <input
                    id="dont-show-again"
                    type="checkbox"
                    checked={dontShowAgain}
                    onChange={(e) => setDontShowAgain(e.target.checked)}
                    className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                  />
                  <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    Không hiển thị lại
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:shadow-xl transition-all duration-150 ring-1 ring-border/50"
            aria-label="Đóng popup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );
}
