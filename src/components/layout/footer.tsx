import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t bg-muted/20 pb-8 pt-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl font-bold tracking-tighter text-primary">HOAN TT</span>
            </Link>
            <p className="max-w-sm text-sm text-muted-foreground space-y-1">
              <strong>Công ty TNHH Đầu tư XNK HOAN TT</strong><br />
              ML 6-17 Vinhomes Greenbay Mễ Trì, phường Đại Mỗ, Hà Nội<br />
              Hotline: 08129.111.88<br />
              Email: hoanttcompany@hoantt.vn
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Sản Phẩm</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/products" className="hover:text-primary transition-colors">Tất cả sản phẩm</Link></li>
              <li><Link href="/products?category=dinh-duong" className="hover:text-primary transition-colors">Dinh dưỡng</Link></li>
              <li><Link href="/products?category=sac-dep" className="hover:text-primary transition-colors">Sắc đẹp</Link></li>
              <li><Link href="/products?category=suc-khoe" className="hover:text-primary transition-colors">Sức khỏe</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Hỗ Trợ Khách Hàng</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/pages/contact" className="hover:text-primary transition-colors">Liên hệ</Link></li>
              <li><Link href="/pages/faq" className="hover:text-primary transition-colors">Câu hỏi thường gặp</Link></li>
              <li><Link href="/pages/shipping" className="hover:text-primary transition-colors">Chính sách giao hàng</Link></li>
              <li><Link href="/pages/returns" className="hover:text-primary transition-colors">Đổi trả & Hoàn tiền</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Pháp Lý</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/pages/terms" className="hover:text-primary transition-colors">Điều khoản dịch vụ</Link></li>
              <li><Link href="/pages/privacy" className="hover:text-primary transition-colors">Chính sách bảo mật</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-16 flex flex-col items-center justify-between border-t pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Hoan TT. All rights reserved.
          </p>
          <div className="mt-4 flex gap-4 sm:mt-0">
            {/* Social icons placeholder */}
            <div className="h-5 w-5 bg-muted rounded-full" />
            <div className="h-5 w-5 bg-muted rounded-full" />
            <div className="h-5 w-5 bg-muted rounded-full" />
          </div>
        </div>
      </div>
    </footer>
  );
}
