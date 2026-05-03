import Link from 'next/link';
import { User, MapPin, Package, LogOut } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { signoutAction } from '@/app/(auth)/actions';

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Note: we'd also make a Sign out action that calls Supabase logout
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="border rounded-2xl p-4 bg-muted/5 sticky top-24">
            <div className="mb-6 pb-6 border-b">
              <p className="text-sm text-muted-foreground">Tài khoản của</p>
              <p className="font-bold text-lg text-foreground truncate">{user.email}</p>
            </div>
            
            <nav className="space-y-1">
              <Link href="/account/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/50 text-foreground transition-colors group">
                <User className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                <span className="font-medium">Hồ Sơ Cá Nhân</span>
              </Link>
              <Link href="/account/addresses" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/50 text-foreground transition-colors group">
                <MapPin className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                <span className="font-medium">Sổ Địa Chỉ</span>
              </Link>
              <Link href="/account/orders" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/50 text-foreground transition-colors group">
                <Package className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                <span className="font-medium">Quản Lý Đơn Hàng</span>
              </Link>
              <form action={signoutAction} className="border-t mt-4 pt-4">
                <button type="submit" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-red-600 transition-colors group w-full text-left">
                  <LogOut className="h-5 w-5" />
                  <span className="font-medium">Đăng Xuất</span>
                </button>
              </form>
            </nav>
          </div>
        </aside>

        {/* Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
