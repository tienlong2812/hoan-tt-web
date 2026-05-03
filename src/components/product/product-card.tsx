'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { toast } from 'sonner';

interface ProductCardProps {
  product: {
    product_id: number;
    product_name: string;
    slug: string;
    price: number;
    discount_price?: number | null;
    thumbnail_url?: string | null;
    brands?: { brand_name: string } | null;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevents navigating to product detail
    addItem({
      product_id: product.product_id,
      name: product.product_name,
      price: product.price,
      discount_price: product.discount_price || null,
      quantity: 1,
      thumbnail_url: product.thumbnail_url || '',
    });
    toast.success(`${product.product_name} added to cart`);
  };

  return (
    <Card className="overflow-hidden border-border/50 hover:border-primary/50 transition-colors h-full flex flex-col hover:shadow-md bg-white group">
      <div className="aspect-square bg-muted/20 relative overflow-hidden">
        <Link href={`/products/${product.slug}`} className="absolute inset-0 z-0">
          <span className="sr-only">Xem chi tiết {product.product_name}</span>
        </Link>
          {product.discount_price && (
            <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              SALE
            </div>
          )}
          {product.thumbnail_url ? (
            <img 
              src={product.thumbnail_url} 
              alt={product.product_name}
              className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground bg-primary/5 text-xs">
              No Image
            </div>
          )}
          {/* Quick Add Button showing on hover */}
          <div className="absolute bottom-0 left-0 w-full p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
            <Button onClick={handleAddToCart} className="w-full shadow-lg" size="sm">
              <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
            </Button>
          </div>
          {/* Gradient for text visibility */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <CardContent className="p-4 flex flex-col flex-1 relative z-10">
          {product.brands && <p className="text-xs text-muted-foreground mb-1">{product.brands.brand_name}</p>}
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-medium text-sm md:text-base line-clamp-2 mb-2 group-hover:text-primary transition-colors flex-1">
              {product.product_name}
            </h3>
          </Link>
          <div className="flex items-center gap-2 mt-auto">
            {product.discount_price ? (
              <>
                <span className="font-bold text-red-500">{product.discount_price.toLocaleString('vi-VN')} ₫</span>
                <span className="text-sm text-muted-foreground line-through">{product.price.toLocaleString('vi-VN')} ₫</span>
              </>
            ) : (
              <span className="font-bold text-foreground">{product.price.toLocaleString('vi-VN')} ₫</span>
            )}
          </div>
        </CardContent>
    </Card>
  );
}
