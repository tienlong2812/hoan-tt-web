'use client';

import { useState } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Download, FileSpreadsheet } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { importProductsAction } from './import-actions';

export function ImportExcelModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleAction(formData: FormData) {
    setLoading(true);
    try {
      await importProductsAction(formData);
      setOpen(false);
    } catch (error: any) {
      alert(error.message || 'Lỗi khi import file.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" className="mr-2" />}>
        <Upload className="mr-2 h-4 w-4" /> Import Excel
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tải Lên Sản Phẩm Hàng Loạt</DialogTitle>
          <DialogDescription>
            Sử dụng file Excel (.xlsx) để tải lên nhiều sản phẩm cùng lúc.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-medium text-sm">File Excel Mẫu</p>
                <p className="text-xs text-muted-foreground">Tải file mẫu về để điền dữ liệu</p>
              </div>
            </div>
            <a href="/api/admin/download-template" download className={buttonVariants({ variant: 'secondary', size: 'sm' })}>
              <Download className="mr-2 h-4 w-4" /> Tải về
            </a>
          </div>

          <form action={handleAction} className="space-y-4">
            <div>
              <Label htmlFor="excelFile">Chọn file Excel đã điền dữ liệu</Label>
              <Input id="excelFile" name="excelFile" type="file" accept=".xlsx, .xls" required className="mt-2 cursor-pointer" />
            </div>
            
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Bắt Đầu Import'}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
