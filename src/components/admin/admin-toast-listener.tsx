'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

export function AdminToastListener() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const message = searchParams.get('toast');
    if (!message) return;

    const type = searchParams.get('toastType') || 'success';
    if (type === 'error') {
      toast.error(message);
    } else {
      toast.success(message);
    }

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete('toast');
    nextParams.delete('toastType');
    const nextQuery = nextParams.toString();
    window.history.replaceState(null, '', nextQuery ? `${pathname}?${nextQuery}` : pathname);
  }, [pathname, searchParams]);

  return null;
}
