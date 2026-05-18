'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Package,
  ShoppingCart,
  LayoutDashboard,
  Tags,
  Settings,
  LogOut,
  Tag,
  Users,
  Store,
  type LucideIcon,
} from 'lucide-react';
import { signoutAction } from '@/app/(auth)/actions';
import { cn } from '@/lib/utils';

const mainNavItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'Đơn hàng', icon: ShoppingCart },
  { href: '/admin/products', label: 'Sản phẩm', icon: Package },
  { href: '/admin/categories', label: 'Danh mục', icon: Tags },
  { href: '/admin/brands', label: 'Thương hiệu', icon: Store },
  { href: '/admin/coupons', label: 'Mã giảm giá', icon: Tag },
  { href: '/admin/users', label: 'Khách hàng', icon: Users },
];

const utilityNavItems = [
  { href: '/admin/settings', label: 'Cài đặt', icon: Settings },
];

function isActivePath(pathname: string, href: string) {
  if (href === '/admin') {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function AdminNavLink({ href, label, icon: Icon }: { href: string; label: string; icon: LucideIcon }) {
  const pathname = usePathname();
  const active = isActivePath(pathname, href);

  return (
    <Link
      href={href}
      className={cn(
        'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
        active
          ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      <Icon
        className={cn(
          'h-4 w-4 shrink-0',
          active ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
        )}
      />
      <span>{label}</span>
    </Link>
  );
}

export function AdminNavigation() {
  return (
    <>
      <div className="px-5 pb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
        Quản lý
      </div>
      <nav className="grid gap-1.5 px-3 text-sm">
        {mainNavItems.map((item) => (
          <AdminNavLink key={item.href} {...item} />
        ))}
      </nav>
      <nav className="mt-auto grid gap-1.5 border-t px-3 py-4 text-sm">
        <div className="px-2 pb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          Hệ thống
        </div>
        {utilityNavItems.map((item) => (
          <AdminNavLink key={item.href} {...item} />
        ))}
        <form action={signoutAction}>
          <button
            type="submit"
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-destructive" />
            <span>Đăng xuất</span>
          </button>
        </form>
      </nav>
    </>
  );
}

export function AdminSidebar() {
  return (
    <aside className="hidden border-r bg-card/90 shadow-sm md:block">
      <div className="sticky top-0 flex h-screen flex-col">
        <div className="flex h-16 items-center border-b px-5">
          <Link href="/admin" className="flex items-center gap-3 font-semibold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Package className="h-5 w-5" />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-bold">Hoan TT</span>
              <span className="block text-xs font-medium text-muted-foreground">Admin Console</span>
            </span>
          </Link>
        </div>
        <div className="flex flex-1 flex-col overflow-y-auto py-4">
          <AdminNavigation />
        </div>
      </div>
    </aside>
  );
}
