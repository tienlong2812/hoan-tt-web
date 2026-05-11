import { Metadata } from 'next';
import { Newspaper } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Tin Tức - Hoan TT',
  description: 'Tin tức và sự kiện mới nhất từ Hoan TT',
};

export default function NewsPage() {
  return (
    <div className="container mx-auto px-4 py-24 min-h-[60vh] flex flex-col items-center justify-center">
      <div className="bg-card border rounded-3xl p-12 md:p-20 shadow-sm max-w-2xl w-full text-center flex flex-col items-center space-y-6">
        <div className="bg-primary/5 p-6 rounded-full">
          <Newspaper className="h-16 w-16 text-primary/40" />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Tin Tức</h1>
          <p className="text-muted-foreground text-lg italic">
            Hiện không có tin tức nào mới.
          </p>
        </div>
        <div className="pt-4">
          <p className="text-muted-foreground text-sm">
            Quý khách vui lòng quay lại sau để cập nhật những thông tin mới nhất từ Hoan TT.
          </p>
        </div>
      </div>
    </div>
  );
}
