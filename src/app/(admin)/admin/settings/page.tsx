import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/admin-page';

export default function AdminSettingsPage() {
  return (
    <>
      <AdminPageHeader title="Cấu hình hệ thống" description="Quản lý các cài đặt chung của hệ thống." />

      <Card className="max-w-3xl border-0 shadow-sm ring-1 ring-border/70">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Tính năng đang phát triển</CardTitle>
              <CardDescription>Trang cấu hình hệ thống đang trong quá trình hoàn thiện.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-12 text-center border-2 border-dashed rounded-xl bg-muted/10">
            <h3 className="text-lg font-medium text-foreground mb-2">Coming Soon</h3>
            <p className="text-sm text-muted-foreground">
              Các tính năng cấu hình phí vận chuyển, tích hợp thanh toán, và thay đổi thông tin liên hệ sẽ sớm ra mắt trong bản cập nhật tiếp theo.
            </p>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
