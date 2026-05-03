'use client';

import { useCartStore } from '@/store/useCartStore';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function CartPage() {
  const [mounted, setMounted] = useState(false);
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="p-8 text-center">Loading cart...</div>;

  return (
    <div className="container mx-auto px-4 py-8 md:py-16 max-w-6xl">
      <h1 className="text-3xl font-bold tracking-tight text-foreground mb-8">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="py-24 text-center border rounded-2xl bg-muted/5 border-dashed flex flex-col items-center">
          <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center mb-6">
            <ShoppingCart className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium text-foreground mb-2">Your cart is empty</h3>
          <p className="text-muted-foreground mb-8">Looks like you haven't added anything to your cart yet.</p>
          <Link href="/products">
            <Button size="lg" className="rounded-full px-8">Start Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_380px] gap-12">
          {/* Cart Items */}
          <div className="space-y-6">
            {items.map((item) => (
              <div key={`${item.product_id}-${item.variant_id ?? 'base'}`} className="flex gap-4 sm:gap-6 border-b pb-6">
                <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-xl bg-muted/20 border overflow-hidden shrink-0">
                  {item.thumbnail_url ? (
                    <img src={item.thumbnail_url} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No image</div>
                  )}
                </div>
                <div className="flex flex-col flex-1">
                  <div className="flex justify-between items-start gap-2">
                    <Link href={`/products/`} className="font-medium text-base sm:text-lg hover:text-primary transition-colors line-clamp-2">
                      {item.name}
                    </Link>
                    <button 
                      onClick={() => removeItem(item.product_id, item.variant_id)}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="mt-1 flex items-baseline gap-2">
                    {item.discount_price ? (
                      <>
                        <span className="font-bold text-red-500">{item.discount_price.toLocaleString('vi-VN')} ₫</span>
                        <span className="text-sm text-muted-foreground line-through">{item.price.toLocaleString('vi-VN')} ₫</span>
                      </>
                    ) : (
                      <span className="font-bold">{item.price.toLocaleString('vi-VN')} ₫</span>
                    )}
                  </div>
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <div className="flex items-center border rounded-full overflow-hidden h-10 w-28 bg-background">
                      <button 
                        onClick={() => updateQuantity(item.product_id, item.variant_id, Math.max(1, item.quantity - 1))}
                        className="flex-1 flex items-center justify-center hover:bg-muted text-muted-foreground h-full"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="font-medium flex-1 text-center text-sm">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.product_id, item.variant_id, item.quantity + 1)}
                        className="flex-1 flex items-center justify-center hover:bg-muted text-muted-foreground h-full"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="font-semibold text-right">
                      {((item.discount_price ?? item.price) * item.quantity).toLocaleString('vi-VN')} ₫
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-muted/10 border rounded-2xl p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              <div className="space-y-4 text-sm mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{getTotalPrice().toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping Estimate</span>
                  <span className="text-emerald-500 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-muted-foreground border-b pb-4">
                  <span>Tax</span>
                  <span>Included</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2">
                  <span>Total</span>
                  <span className="text-primary">{getTotalPrice().toLocaleString('vi-VN')} ₫</span>
                </div>
              </div>
              <Link href="/checkout">
                <Button size="lg" className="w-full rounded-full h-14 text-base">
                  Proceed to Checkout <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Just an import workaround placeholder for missing ShoppingCart on empty
import { ShoppingCart } from 'lucide-react';
