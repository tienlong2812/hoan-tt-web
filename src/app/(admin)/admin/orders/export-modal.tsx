'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { getOrdersForExport } from './actions';
import * as XLSX from 'xlsx';

const EXPORT_FIELDS = [
  { id: 'order_id', label: 'ID Đơn Hàng' },
  { id: 'order_date', label: 'Ngày Đặt' },
  { id: 'receiver_name', label: 'Tên Người Nhận' },
  { id: 'receiver_phone', label: 'SĐT Người Nhận' },
  { id: 'users.email', label: 'Email Tài Khoản' },
  { id: 'total_amount', label: 'Tổng Tiền' },
  { id: 'shipping_fee', label: 'Phí Ship' },
  { id: 'discount_amount', label: 'Tiền Giảm Giá' },
  { id: 'payment_method', label: 'PT Thanh Toán' },
  { id: 'payment_status', label: 'Trạng Thái TT' },
  { id: 'order_status', label: 'Trạng Thái ĐH' },
  { id: 'detail_address', label: 'Địa Chỉ Chi Tiết' },
  { id: 'ward', label: 'Xã/Phường' },
  { id: 'district', label: 'Quận/Huyện' },
  { id: 'province', label: 'Tỉnh/Thành' },
];

export function ExportOrdersModal() {
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFields, setSelectedFields] = useState<string[]>(EXPORT_FIELDS.map(f => f.id));

  const handleToggleField = (fieldId: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldId) ? prev.filter(id => id !== fieldId) : [...prev, fieldId]
    );
  };

  const handleToggleAll = () => {
    if (selectedFields.length === EXPORT_FIELDS.length) {
      setSelectedFields([]);
    } else {
      setSelectedFields(EXPORT_FIELDS.map(f => f.id));
    }
  };

  const handleExport = async () => {
    if (selectedFields.length === 0) {
      toast.error('Vui lòng chọn ít nhất một trường dữ liệu');
      return;
    }

    setLoading(true);
    try {
      const filters = {
        from: searchParams.get('from') || undefined,
        to: searchParams.get('to') || undefined,
        q: searchParams.get('q') || undefined,
      };

      const orders = await getOrdersForExport(filters);
      
      if (!orders || orders.length === 0) {
        toast.error('Không có dữ liệu để xuất');
        return;
      }

      // Format data based on selected fields
      const formattedData = orders.map((order: any) => {
        const row: any = {};
        
        EXPORT_FIELDS.forEach(field => {
          if (selectedFields.includes(field.id)) {
            if (field.id === 'users.email') {
              row[field.label] = order.users?.email || '';
            } else if (field.id === 'order_date') {
              row[field.label] = new Date(order[field.id]).toLocaleString('vi-VN');
            } else {
              row[field.label] = order[field.id] ?? '';
            }
          }
        });
        
        return row;
      });

      // Generate Excel file
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
      
      const fileName = `Danh_Sach_Don_Hang_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);
      
      toast.success('Xuất file Excel thành công');
      setOpen(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Có lỗi xảy ra khi xuất báo cáo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" className="gap-2" />}>
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">Xuất Excel</span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Chọn Trường Dữ Liệu</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2">
          <div className="flex items-center space-x-2 pb-2 border-b">
            <Checkbox 
              id="select-all" 
              checked={selectedFields.length === EXPORT_FIELDS.length}
              onCheckedChange={handleToggleAll}
            />
            <Label htmlFor="select-all" className="font-semibold cursor-pointer">
              Chọn tất cả
            </Label>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {EXPORT_FIELDS.map((field) => (
              <div key={field.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`field-${field.id}`} 
                  checked={selectedFields.includes(field.id)}
                  onCheckedChange={() => handleToggleField(field.id)}
                />
                <Label htmlFor={`field-${field.id}`} className="cursor-pointer text-sm font-normal">
                  {field.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Hủy
          </Button>
          <Button onClick={handleExport} disabled={loading || selectedFields.length === 0}>
            {loading ? 'Đang xuất...' : 'Tải File Excel'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
