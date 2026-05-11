import Link from 'next/link';
import { Package, ShoppingCart, LayoutDashboard, Tags, Settings, LogOut, Tag, Users } from 'lucide-react';
import { signoutAction } from '@/app/(auth)/actions';

export function AdminSidebar() {
  return (
    <div className="hidden border-r bg-muted/40 md:block md:w-64">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/admin" className="flex items-center gap-2 font-semibold">
            <Package className="h-6 w-6 text-primary" />
            <span className="">Hoan TT Admin</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-1">
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              href="/admin/orders"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
            >
              <ShoppingCart className="h-4 w-4" />
              Orders
            </Link>
            <Link
              href="/admin/products"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
            >
              <Package className="h-4 w-4" />
              Products
            </Link>
            <Link
              href="/admin/categories"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
            >
              <Tags className="h-4 w-4" />
              Categories
            </Link>
            <Link
              href="/admin/brands"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
            >
              <Tags className="h-4 w-4" />
              Brands
            </Link>
            <Link
              href="/admin/coupons"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
            >
              <Tag className="h-4 w-4" />
              Coupons
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
            >
              <Users className="h-4 w-4" />
              Users
            </Link>
          </nav>
        </div>
        <div className="mt-auto p-4">
          <nav className="grid items-start gap-1 text-sm font-medium">
            <Link
              href="/admin/settings"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
            <form action={signoutAction}>
              <button
                type="submit"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-destructive hover:bg-muted text-left w-full"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </form>
          </nav>
        </div>
      </div>
    </div>
  );
}
