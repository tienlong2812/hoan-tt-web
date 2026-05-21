'use client';

import { useState } from 'react';
import { AddToCartButton } from '@/components/cart/add-to-cart-button';
import { BuyNowButton } from '@/components/cart/buy-now-button';

type Variant = {
  variant_id: number;
  variant_name: string;
  sku: string | null;
  price: number;
  discount_price?: number | null;
  stock: number;
  weight?: number | null;
  status?: string;
};

export function VariantSelector({ product, variants }: { product: any, variants: Variant[] }) {
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(
    variants.length > 0 ? variants[0].variant_id : null
  );

  const selectedVariant = variants.find(v => v.variant_id === selectedVariantId);

  // Determine current display info
  // If a variant is selected: use variant price/stock/sku; 
  // If no variants exist: use 1 as default stock to allow purchase of legacy products
  const hasVariants = variants.length > 0;
  const currentPrice = selectedVariant ? selectedVariant.price : product.base_price;
  const currentDiscountPrice = selectedVariant?.discount_price ?? null;
  const currentStock = selectedVariant ? selectedVariant.stock : (product.stock ?? 0);
  const currentSku = selectedVariant?.sku || null;

  // Prepare product object for cart
  const cartProduct = {
    ...product,
    price: currentPrice,
    discount_price: currentDiscountPrice,
    stock: currentStock,
    variant_id: selectedVariant?.variant_id,
    variant_name: selectedVariant?.variant_name
  };

  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-muted-foreground mb-4 bg-muted/10 p-3 rounded-lg w-fit">
        <div className="font-medium">Mã sản phẩm (SKU):</div>
        <div>{currentSku || 'N/A'}</div>
        <div className="font-medium">Xuất xứ:</div>
        <div>{product.origin || 'Đang cập nhật'}</div>
        <div className="font-medium">Tình trạng:</div>
        <div>
          {currentStock > 0 ? (
            <span className="text-green-600 font-medium">Còn hàng {hasVariants ? `(${currentStock})` : ''}</span>
          ) : (
            <span className="text-red-500 font-medium">Hết hàng</span>
          )}
        </div>
      </div>

      {hasVariants && (
        <div className="mb-6">
          <div className="font-medium mb-3">Chọn phân loại:</div>
          <div className="flex flex-wrap gap-2">
            {variants.map(v => (
              <button
                key={v.variant_id}
                onClick={() => setSelectedVariantId(v.variant_id)}
                className={`px-4 py-2 border rounded-xl text-sm font-medium transition-all ${selectedVariantId === v.variant_id ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary' : 'border-input hover:border-primary/50'}`}
              >
                {v.variant_name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-end gap-3 mb-8">
        {currentDiscountPrice ? (
          <>
            <span className="text-4xl font-bold text-red-500">{currentDiscountPrice.toLocaleString('vi-VN')} ₫</span>
            <span className="text-xl text-muted-foreground line-through mb-1">{currentPrice.toLocaleString('vi-VN')} ₫</span>
          </>
        ) : (
          <span className="text-4xl font-bold text-foreground">{currentPrice.toLocaleString('vi-VN')} ₫</span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-auto">
        <AddToCartButton product={cartProduct} quantity={1} />
        <BuyNowButton product={cartProduct} quantity={1} />
      </div>
    </div>
  );
}
