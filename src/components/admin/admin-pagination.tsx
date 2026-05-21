'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight 
} from 'lucide-react';
import { useTransition } from 'react';

interface AdminPaginationProps {
  totalItems: number;
  currentPage: number;
  pageSize: number;
  pageSizeOptions?: number[];
}

export function AdminPagination({
  totalItems,
  currentPage,
  pageSize,
  pageSizeOptions = [20, 50, 100, 200],
}: AdminPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const updateUrl = (newPage: number, newLimit: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    params.set('limit', newLimit.toString());
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    updateUrl(page, pageSize);
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const limit = Number(e.target.value);
    updateUrl(1, limit);
  };

  // Generate pagination numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show page 1
      pages.push(1);

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      if (start > 2) {
        pages.push('...');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push('...');
      }

      // Always show last page
      pages.push(totalPages);
    }
    return pages;
  };

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border bg-card p-4 md:p-6 select-none">
      <div className="text-sm text-muted-foreground">
        Hiển thị <span className="font-semibold text-foreground">{totalItems > 0 ? startItem : 0}</span> đến{' '}
        <span className="font-semibold text-foreground">{endItem}</span> trong tổng số{' '}
        <span className="font-semibold text-foreground">{totalItems}</span> dòng
      </div>

      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Số dòng mỗi trang:</span>
          <select
            value={pageSize}
            onChange={handleLimitChange}
            disabled={isPending}
            className="h-8 rounded-md border border-input bg-background px-2 py-1 text-sm outline-hidden focus:border-ring focus:ring-2 focus:ring-ring/50 disabled:opacity-50"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1 || isPending}
            className="h-8 w-8"
            title="Trang đầu"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || isPending}
            className="h-8 w-8"
            title="Trang trước"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {getPageNumbers().map((p, idx) => {
            if (p === '...') {
              return (
                <span
                  key={`dots-${idx}`}
                  className="px-2 text-muted-foreground text-sm flex items-center justify-center h-8 min-w-[2rem]"
                >
                  ...
                </span>
              );
            }
            return (
              <Button
                key={`page-${p}`}
                variant={currentPage === p ? 'default' : 'outline'}
                onClick={() => handlePageChange(p as number)}
                disabled={isPending}
                className={`h-8 min-w-[2rem] px-2 ${
                  currentPage === p
                    ? 'bg-primary text-primary-foreground pointer-events-none'
                    : ''
                }`}
              >
                {p}
              </Button>
            );
          })}

          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || isPending}
            className="h-8 w-8"
            title="Trang sau"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages || isPending}
            className="h-8 w-8"
            title="Trang cuối"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
