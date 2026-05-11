import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Star } from 'lucide-react';
import Link from 'next/link';
import { ProductGallery } from '@/components/product/product-gallery';
import { ReviewForm } from './review-form';
import { VariantSelector } from '@/components/product/variant-selector';

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  const { data: product, error } = await supabase
    .from('products')
    .select('*, brands(brand_name, logo_url), categories(category_name)')
    .eq('slug', resolvedParams.slug)
    .single();

  if (error || !product) {
    return notFound();
  }

  const { data: gallery } = await supabase
    .from('product_gallery')
    .select('*')
    .eq('product_id', product.product_id)
    .order('sort_order', { ascending: true });

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, users(full_name)')
    .eq('product_id', product.product_id)
    .order('created_at', { ascending: false });

  const { data: variants } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', product.product_id)
    .order('variant_id', { ascending: true });

  // Fetch Recommended Products (same brand or category, excluding current)
  let orQuery = '';
  if (product.brand_id && product.category_id) {
    orQuery = `brand_id.eq.${product.brand_id},category_id.eq.${product.category_id}`;
  } else if (product.brand_id) {
    orQuery = `brand_id.eq.${product.brand_id}`;
  } else if (product.category_id) {
    orQuery = `category_id.eq.${product.category_id}`;
  }

  let recommendedProducts: any[] = [];
  if (orQuery) {
    const { data: recs } = await supabase
      .from('products')
      .select('*, brands(brand_name)')
      .eq('status', 'active')
      .neq('product_id', product.product_id)
      .or(orQuery)
      .limit(4);
    if (recs) recommendedProducts = recs;
  }

  const images = [
    ...(product.thumbnail_url ? [product.thumbnail_url] : []),
    ...(gallery ? gallery.map(g => g.image_url) : [])
  ];

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <Link href="/products" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Về trang Sản phẩm
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
        {/* Left: Gallery */}
        <div className="space-y-4">
          <ProductGallery images={images} productName={product.product_name} />
        </div>

        {/* Right: Details */}
        <div className="flex flex-col">
          <div className="mb-2 flex items-center justify-between">
            {product.brands && (
              <div className="flex items-center gap-2">
                {(product.brands as any).logo_url ? (
                  <img src={(product.brands as any).logo_url} alt={(product.brands as any).brand_name} className="h-8 w-auto object-contain" />
                ) : (
                  <div className="text-sm font-medium text-primary uppercase tracking-wider">{(product.brands as any).brand_name}</div>
                )}
              </div>
            )}
            {product.categories && <div className="text-sm text-muted-foreground">{(product.categories as any).category_name}</div>}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">{product.product_name}</h1>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center text-amber-500">
              <Star className="h-5 w-5 fill-current" />
              <Star className="h-5 w-5 fill-current" />
              <Star className="h-5 w-5 fill-current" />
              <Star className="h-5 w-5 fill-current" />
              <Star className="h-5 w-5 fill-current opacity-50" />
            </div>
            <span className="text-sm text-muted-foreground">({reviews?.length || 0} đánh giá)</span>
          </div>

          <div className="prose prose-sm text-muted-foreground mb-8">
            <p>{product.description || 'Chưa có thông tin mô tả cho sản phẩm này.'}</p>
          </div>

          <VariantSelector product={product} variants={variants || []} />
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-24 pt-10 border-t">
        <h2 className="text-2xl font-bold tracking-tight mb-8">Đánh giá từ khách hàng</h2>
        {reviews && reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {reviews.map((r) => (
              <div key={r.review_id} className="border p-6 rounded-2xl bg-muted/5">
                <div className="flex items-center justify-between mb-4">
                  <div className="font-medium">{(r.users as any)?.full_name || 'Khách hàng ẩn danh'}</div>
                  <div className="flex text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`h-4 w-4 ${s <= r.rating ? 'fill-current' : 'opacity-30'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{r.comment}</p>
                <div className="text-xs text-muted-foreground mt-4">{new Date(r.review_date).toLocaleDateString('vi-VN')}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground bg-muted/10 p-8 rounded-2xl text-center border">
            <Star className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
            Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!
          </div>
        )}

        <div className="mt-12 max-w-2xl">
          <ReviewForm productId={product.product_id} isAuthenticated={!!user} />
        </div>
      </div>

      {/* Recommended Products */}
      {recommendedProducts.length > 0 && (
        <div className="mt-24 pt-10 border-t">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Đề xuất cho bạn</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {recommendedProducts.map((recProd) => (
              <Link key={recProd.product_id} href={`/products/${recProd.slug}`}>
                <Card className="group overflow-hidden border border-border/60 hover:border-primary/40 focus-within:ring-2 focus-within:ring-primary transition-all duration-300 bg-white hover:shadow-xl rounded-xl h-full">
                  <div className="aspect-square relative overflow-hidden bg-[#f8f9fa] flex items-center justify-center p-4">
                    {recProd.thumbnail_url ? (
                      <img 
                        src={recProd.thumbnail_url} 
                        alt={recProd.product_name}
                        className="object-contain w-full h-full mix-blend-multiply group-hover:scale-110 transition-transform duration-500 ease-out"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground/30 bg-muted/10 text-sm font-medium rounded-lg">
                        No Image
                      </div>
                    )}
                    
                    {/* Quick Add Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 bg-gradient-to-t from-black/50 to-transparent">
                        <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-md shadow-lg" size="sm">
                          Xem Chi Tiết
                        </Button>
                    </div>
                  </div>
                  <CardContent className="p-4 md:p-5 flex flex-col gap-1.5 bg-white z-20 relative">
                    {recProd.brands && <p className="text-[11px] font-bold text-muted-foreground/80 uppercase tracking-widest">{(recProd.brands as any).brand_name}</p>}
                    <h3 className="font-semibold text-sm md:text-[15px] leading-tight line-clamp-2 min-h-[40px] group-hover:text-primary transition-colors text-foreground">
                      {recProd.product_name}
                    </h3>
                    <div className="flex items-end gap-2 mt-2">
                      <span className="font-bold text-lg md:text-xl text-[#d95115]">{recProd.base_price.toLocaleString('vi-VN')} ₫</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
