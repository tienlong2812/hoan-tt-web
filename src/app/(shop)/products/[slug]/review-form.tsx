'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { submitReview } from './actions';
import { toast } from 'sonner';

export function ReviewForm({ productId, isAuthenticated }: { productId: number, isAuthenticated: boolean }) {
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="bg-muted/30 p-6 rounded-2xl border text-center">
        <p className="text-muted-foreground mb-4">Bạn cần đăng nhập để viết đánh giá.</p>
        <Button variant="outline" onClick={() => window.location.href = '/login'}>Đăng nhập ngay</Button>
      </div>
    );
  }

  async function onSubmit(formData: FormData) {
    setLoading(true);
    try {
      await submitReview(formData);
      toast.success('Đánh giá của bạn đã được gửi thành công!');
      // Reset form natively via event target or just relying on fast refresh/revalidate
      (document.getElementById('review-form') as HTMLFormElement)?.reset();
      setRating(5);
    } catch (error) {
      toast.error('Có lỗi xảy ra khi gửi đánh giá.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-card p-6 rounded-2xl border shadow-sm">
      <h3 className="font-bold text-lg mb-4">Viết đánh giá của bạn</h3>
      <form id="review-form" action={onSubmit} className="space-y-4">
        <input type="hidden" name="product_id" value={productId} />
        <input type="hidden" name="rating" value={rating} />
        
        <div>
          <label className="block text-sm font-medium mb-2">Đánh giá sao</label>
          <div className="flex gap-1 text-amber-500 cursor-pointer">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star 
                key={s} 
                className={`h-8 w-8 transition-colors ${s <= rating ? 'fill-current' : 'opacity-30'}`}
                onClick={() => setRating(s)}
                onMouseEnter={() => setRating(s)}
              />
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-medium mb-2">Bình luận</label>
          <Textarea 
            id="comment" 
            name="comment" 
            placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này..."
            rows={4}
            required
            className="resize-none"
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading ? 'Đang gửi...' : 'Gửi Đánh Giá'}
        </Button>
      </form>
    </div>
  );
}
