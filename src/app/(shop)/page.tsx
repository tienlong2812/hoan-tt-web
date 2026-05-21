import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ShieldCheck, Truck, Zap } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { PromoPopup } from '@/components/layout/promo-popup';

export default async function HomePage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Safely fetch products. If the DB is missing tables, it returns an error rather than crashing the page hard.
  const [{ data: featuredProducts }, { data: topBrands }] = await Promise.all([
    supabase
      .from('products')
      .select('*, brands(brand_name)')
      .eq('status', 'active')
      .limit(8),
    supabase
      .from('brands')
      .select('*')
      .limit(8)
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <PromoPopup />
      {/* Premium Hero Banner Section */}
      <section className="relative w-full bg-gradient-to-r from-primary to-accent py-16 lg:py-24 overflow-hidden text-white">
        {/* Abstract Background pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        
        <div className="container px-4 md:px-6 relative z-10">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-6">
              <div className="space-y-4">
                <Badge className="bg-white/20 text-white hover:bg-white/30 px-4 py-1.5 text-sm rounded-full w-fit mb-2 backdrop-blur-sm border-none font-semibold shadow-sm">
                  Top Khuyên Dùng Tại Việt Nam
                </Badge>
                <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl xl:text-5xl uppercase text-white drop-shadow-md text-balance leading-tight">
                  Sức khỏe toàn cầu, chăm sóc Việt Nam
                </h1>
                <p className="max-w-[600px] text-white/90 md:text-lg lg:text-xl font-medium leading-relaxed drop-shadow-sm text-justify">
                  Hoan TT không chỉ đơn thuần là nhà nhập khẩu, mà là những người đưa đến những giải pháp sức khỏe và sắc đẹp xuất sắc từ khắp thế giới.<br/><br/>
                  Sứ mệnh của chúng tôi không chỉ là về việc mang sản phẩm tốt nhất đến tay khách hàng, mà còn là xây dựng cộng đồng chung quanh giá trị của sức khỏe và vẻ đẹp. Hãy cùng chúng tôi kiến tạo một cuộc sống khỏe mạnh và rạng ngời cho mọi người.
                </p>
              </div>
              <div className="flex flex-col gap-3 min-[400px]:flex-row pt-4">
                <Link 
                  href="/products" 
                  className={buttonVariants({ size: "lg", className: "px-8 !bg-white !text-[#d71921] hover:!bg-[#d71921] hover:!text-white font-bold text-base rounded-full shadow-lg transition-all" })}
                >
                  Mua Sắm Ngay <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link 
                  href="/about" 
                  className={buttonVariants({ variant: "outline", size: "lg", className: "px-8 rounded-full border-white text-white hover:bg-white/10 font-bold text-base bg-transparent/10 backdrop-blur-sm" })}
                >
                  Về Chúng Tôi
                </Link>
              </div>
            </div>
            
            {/* Hero Image Visual */}
            <div className="hidden lg:flex w-full justify-end relative h-[450px]">
              <img 
                 src="https://bbwylbgjopclabrnkcdj.supabase.co/storage/v1/object/public/product-images/HoanTT-z5988375418571_ea53a6270081de9c6caac585a65a0318.webp" 
                 alt="Hoan TT Banner"
                 className="w-full h-full object-cover rounded-2xl shadow-2xl relative z-20 border-4 border-white/20"
              />
              <div className="absolute top-6 right-6 w-full h-full bg-white/10 rounded-2xl border border-white/20 z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Categories Section */}
      <section className="w-full py-16">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-2">Thương Hiệu Nổi Bật</h2>
            <p className="text-muted-foreground">Khám phá các sản phẩm từ những đối tác hàng đầu thế giới</p>
          </div>
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full max-w-[calc(100vw-3rem)] md:max-w-full mx-auto"
          >
            <CarouselContent className="-ml-4">
              {topBrands?.map((brand) => {
                const slug = brand.brand_name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                return (
                  <CarouselItem key={brand.brand_id} className="pl-4 basis-1/2 md:basis-1/4 lg:basis-1/5">
                    <Link href={`/products?brand=${slug}`} className="block h-full">
                      <Card className="hover:border-primary/50 transition-colors bg-white hover:shadow-md h-full cursor-pointer overflow-hidden border border-border/50 group">
                        <CardContent className="p-6 md:p-8 flex items-center justify-center h-full min-h-[140px]">
                          {brand.logo_url ? (
                            <img 
                              src={brand.logo_url} 
                              alt={brand.brand_name} 
                              className="max-h-20 w-auto object-contain group-hover:scale-105 transition-transform" 
                            />
                          ) : (
                            <h3 className="text-xl md:text-2xl font-bold text-primary tracking-tight uppercase group-hover:scale-105 transition-transform text-center">
                              {brand.brand_name}
                            </h3>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <div className="hidden md:block">
              <CarouselPrevious className="-left-6 lg:-left-12" />
              <CarouselNext className="-right-6 lg:-right-12" />
            </div>
          </Carousel>
        </div>
      </section>

      {/* Trust Elements */}
      <section className="w-full py-12 md:py-16 border-y bg-muted/5">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-center text-center">
            <div className="flex flex-col items-center gap-2">
              <ShieldCheck className="h-10 w-10 text-primary mb-2" />
              <h3 className="font-semibold text-lg">100% Chính hãng</h3>
              <p className="text-sm text-muted-foreground max-w-xs text-balance">Nhập khẩu trực tiếp từ các thương hiệu lớn trên thế giới.</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Truck className="h-10 w-10 text-accent mb-2" />
              <h3 className="font-semibold text-lg">Giao hàng toàn quốc</h3>
              <p className="text-sm text-muted-foreground max-w-xs text-balance">Hỗ trợ giao hàng nội địa nhanh chóng với hơn 2000+ đại lý.</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Zap className="h-10 w-10 text-primary mb-2" />
              <h3 className="font-semibold text-lg">Hỗ trợ tận tâm</h3>
              <p className="text-sm text-muted-foreground max-w-xs text-balance">Chuyên gia sức khỏe tư vấn nhiệt tình mọi lúc.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="w-full py-16 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold tracking-tight border-l-4 border-primary pl-4">Sản Phẩm Bán Chạy</h2>
            <Link href="/products" className="text-accent font-medium hover:underline flex items-center">
              Xem tất cả <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts && featuredProducts.length > 0 ? (
              featuredProducts.map((product) => (
                <Link key={product.product_id} href={`/products/${product.slug}`}>
                  <Card className="group overflow-hidden border border-border/60 hover:border-primary/40 focus-within:ring-2 focus-within:ring-primary transition-all duration-300 bg-white hover:shadow-xl rounded-xl">
                    <div className="aspect-square relative overflow-hidden bg-[#f8f9fa] flex items-center justify-center p-4">
                      {product.thumbnail_url ? (
                        <img 
                          src={product.thumbnail_url} 
                          alt={product.product_name}
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
                      {product.brands && <p className="text-[11px] font-bold text-muted-foreground/80 uppercase tracking-widest">{(product.brands as any).brand_name}</p>}
                      <h3 className="font-semibold text-sm md:text-[15px] leading-tight line-clamp-2 min-h-[40px] group-hover:text-primary transition-colors text-foreground">
                        {product.product_name}
                      </h3>
                      <div className="flex items-end gap-2 mt-2">
                        <span className="font-bold text-lg md:text-xl text-[#d95115]">{product.base_price.toLocaleString('vi-VN')} ₫</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              // Empty State
              <div className="col-span-full py-12 text-center border rounded-xl bg-muted/10 border-dashed">
                <p className="text-muted-foreground mb-4">No products found. Please setup the database first.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
