import Link from 'next/link';
import { Suspense } from 'react';
import { AdminNavigation, AdminSidebar } from '@/components/layout/admin-sidebar';
import { AdminToastListener } from '@/components/admin/admin-toast-listener';
import { Menu, Package, Store } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen w-full bg-muted/30 md:grid-cols-[256px_1fr]">
      <Suspense fallback={null}>
        <AdminToastListener />
      </Suspense>
      <AdminSidebar />
      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/80 lg:px-6">
          <Sheet>
            <SheetTrigger className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-input bg-background text-foreground transition-colors hover:bg-muted md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-[320px] gap-0 p-0 sm:max-w-[320px]">
              <div className="flex h-16 items-center border-b px-5">
                <Link href="/admin" className="flex items-center gap-3 font-semibold">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                    <Package className="h-5 w-5" />
                  </span>
                  <div className="leading-tight">
                    <SheetTitle className="text-sm font-bold">Hoan TT</SheetTitle>
                    <SheetDescription className="text-xs font-medium">Admin Console</SheetDescription>
                  </div>
                </Link>
              </div>
              <div className="flex flex-1 flex-col overflow-y-auto py-4">
                <AdminNavigation />
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Admin</span>
            <span className="truncate text-sm font-semibold text-foreground md:text-base">Quản trị Hoan TT</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hidden items-center gap-2 rounded-xl border bg-background px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
            >
              <Store className="h-4 w-4" />
              Xem shop
            </Link>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              A
            </div>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 sm:p-5 lg:gap-6 lg:p-6">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 lg:gap-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
