import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function AdminPageHeader({
  title,
  description,
  actions,
  backHref,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  backHref?: string;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border bg-card p-5 shadow-sm md:flex-row md:items-center md:justify-between md:p-6">
      <div className="flex min-w-0 items-start gap-3">
        {backHref ? (
          <Link href={backHref} className="mt-0.5 shrink-0">
            <Button variant="outline" size="icon" aria-label="Quay lại">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
        ) : null}
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2 md:justify-end">{actions}</div> : null}
    </div>
  );
}

export function AdminPanel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('rounded-2xl border bg-card p-5 shadow-sm md:p-6', className)}>{children}</div>;
}

export function AdminTableShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('overflow-hidden rounded-2xl border bg-card shadow-sm', className)}>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}
