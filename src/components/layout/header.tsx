import Link from 'next/link';
import { Search, ShoppingCart, User, Menu, Phone, Heart } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { CartBadge } from '@/components/cart/cart-badge';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function Header() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: categories } = await supabase.from('categories').select('*').order('category_id').limit(4);

  const { data: { user } } = await supabase.auth.getUser();
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase.from('users').select('role').eq('user_id', user.id).single();
    if (profile && profile.role === 'admin') {
      isAdmin = true;
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Main Header Area */}
        <div className="flex h-20 items-center justify-between gap-4 md:gap-8">
          {/* Mobile Menu & Logo */}
          <div className="flex items-center gap-4 lg:hidden">
            <Sheet>
              <SheetTrigger className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none lg:hidden">
                <Menu className="h-6 w-6 text-foreground" />
                <span className="sr-only">Toggle menu</span>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                <SheetTitle className="sr-only">Menu Navigation</SheetTitle>
                <SheetDescription className="sr-only">Navigate around the store.</SheetDescription>
                <nav className="flex flex-col gap-4 mt-8">
                  <Link href="/" className="text-lg font-bold hover:text-primary transition-colors">Trang Chủ</Link>
                  <Link href="/products" className="text-lg font-bold hover:text-primary transition-colors">Tất Cả Sản Phẩm</Link>
                  {categories?.map((cat) => (
                    <Link key={cat.category_id} href={`/products?category=${cat.slug}`} className="text-lg font-bold hover:text-primary transition-colors">
                      {cat.category_name}
                    </Link>
                  ))}
                  <Link href="/about" className="text-lg font-bold hover:text-primary transition-colors">Giới Thiệu</Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          <Link href="/" className="flex items-center shrink-0">
            <img src="https://bbwylbgjopclabrnkcdj.supabase.co/storage/v1/object/public/product-images/HoanTT-LogoHoanTT150.png" alt="Hoan TT" className="h-10 md:h-12 w-auto object-contain" />
            <span className="sr-only">Hoan TT</span>
          </Link>

          {/* Center: Search Bar */}
          <div className="hidden flex-1 items-center justify-center lg:flex max-w-2xl px-6">
            <form action="/products" className="relative w-full group">
              <Input
                type="search"
                name="q"
                placeholder="Tìm kiếm sản phẩm, thương hiệu..."
                className="w-full rounded-full border-2 border-primary/20 bg-muted/20 pl-6 pr-14 h-12 text-base focus-visible:ring-0 focus-visible:border-primary focus-visible:bg-white transition-all shadow-sm"
              />
              <Button type="submit" size="icon" className="absolute right-1 top-1 h-10 w-10 rounded-full bg-primary hover:bg-primary/90 text-white">
                <Search className="h-5 w-5" />
                <span className="sr-only">Tìm kiếm</span>
              </Button>
            </form>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <div className="hidden xl:flex items-center gap-3 mr-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Phone className="h-5 w-5 fill-primary/20" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground font-medium">Hỗ trợ 24/7</span>
                <span className="text-sm font-bold text-primary">08129.111.88</span>
              </div>
            </div>

            <Link href="/account/profile" className={buttonVariants({ variant: "ghost", size: "icon", className: "rounded-full h-10 w-10 hover:text-primary hover:bg-primary/10 transition-colors hidden sm:flex" })}>
              <User className="h-5 w-5" />
              <span className="sr-only">Tài khoản</span>
            </Link>

            <CartBadge />

            {isAdmin && (
              <Link href="/admin" className={buttonVariants({ variant: "default", size: "sm", className: "rounded-full font-bold shadow-md hidden sm:flex ml-1" })}>
                Trang Admin
              </Link>
            )}
          </div>
        </div>

        {/* Desktop Navigation Link Bar */}
        <div className="hidden lg:flex items-center justify-center lg:justify-start h-12 border-t border-border/50">
          <nav className="flex items-center gap-8 text-[15px] font-bold text-foreground w-full">
            <Link href="/" className="uppercase tracking-wide hover:text-primary transition-colors border-b-2 border-primary py-3 text-primary">Trang Chủ</Link>
            <Link href="/products" className="uppercase tracking-wide hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary py-3">Tất Cả Sản Phẩm</Link>
            <span className="h-4 w-px bg-border"></span>
            {categories?.map((cat) => (
              <Link key={cat.category_id} href={`/products?category=${cat.slug}`} className="uppercase tracking-wide hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary py-3">
                {cat.category_name}
              </Link>
            ))}
            <span className="h-4 w-px bg-border"></span>
            <Link href="/tin-tuc" className="uppercase tracking-wide hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary py-3">Tin Tức</Link>
            <Link href="/about" className="uppercase tracking-wide hover:text-primary transition-colors border-b-2 border-transparent hover:border-primary py-3">Giới Thiệu</Link>
          </nav>
        </div>

        {/* Mobile Search Bar */}
        <div className="lg:hidden pb-4">
          <form action="/products" className="relative w-full">
            <Input
              type="search"
              name="q"
              placeholder="Tìm kiếm sản phẩm..."
              className="w-full rounded-full border border-primary/20 bg-muted/20 pl-10 pr-4 h-11 focus-visible:ring-1 focus-visible:ring-primary shadow-sm"
            />
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <button type="submit" className="hidden">Submit</button>
          </form>
        </div>
      </div>
    </header>
  );
}
