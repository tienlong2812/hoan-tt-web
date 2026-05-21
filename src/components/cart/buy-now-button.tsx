'use client';

import { useCartStore } from '@/store/useCartStore';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function BuyNowButton({ 
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
    variant_id?: number;
    variant_name?: string;
    slug?: string;
  };
  quantity: number;
}) {
  const addItem = useCartStore((state) => state.addItem);
  const router = useRouter();

  const handleBuyNow = () => {
    if (product.stock <= 0) return;
    
    addItem({
      product_id: product.product_id,
      name: product.product_name,
      price: product.price,
      discount_price: product.discount_price || null,
      thumbnail_url: product.thumbnail_url || '',
      quantity: quantity,
      variant_id: product.variant_id,
      variant_name: product.variant_name,
      slug: product.slug,
    });

    router.push('/checkout');
  };

  return (
    <Button 
      size="lg" 
      variant="default"
      className="flex-1 rounded-full h-14 text-base bg-accent text-accent-foreground hover:bg-accent/90" 
      disabled={product.stock <= 0}
      onClick={handleBuyNow}
    >
      Mua Ngay
    </Button>
  );
}
