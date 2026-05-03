'use client';

import { useCartStore } from '@/store/useCartStore';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

export function AddToCartButton({ 
  product, 
  quantity
}: { 
  product: {
    product_id: number;
    product_name: string;
    price: number;
    discount_price?: number | null;
    thumbnail_url?: string | null;
    stock: number;
  };
  quantity: number;
}) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAdd = () => {
    if (product.stock <= 0) return;
    
    addItem({
      product_id: product.product_id,
      name: product.product_name,
      price: product.price,
      discount_price: product.discount_price || null,
      thumbnail_url: product.thumbnail_url || '',
      quantity: quantity
    });

    toast.success("Đã thêm vào giỏ hàng", {
      description: `${product.product_name} đã được thêm vào giỏ của bạn.`,
    });
  };

  return (
    <Button 
      size="lg" 
      className="flex-1 rounded-full h-14 text-base" 
      disabled={product.stock <= 0}
      onClick={handleAdd}
    >
      <ShoppingCart className="mr-2 h-5 w-5" /> Thêm vào Giỏ hàng
    </Button>
  );
}
