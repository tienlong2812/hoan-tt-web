import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Plus, Tag, Trash2, ToggleLeft } from 'lucide-react';
import { toggleCouponStatus, deleteCouponAction } from './actions';
import { AdminPageHeader, AdminTableShell } from '@/components/admin/admin-page';
import { ConfirmSubmitButton } from '@/components/admin/confirm-submit-button';
import { AdminPagination } from '@/components/admin/admin-pagination';

export default async function CouponsPage(props: {
  searchParams: Promise<{ page?: string; limit?: string }>;
}) {
  const searchParams = await props.searchParams;
  const page = Math.max(1, Number(searchParams.page) || 1);
  const limit = Number(searchParams.limit) || 20;
  const fromIndex = (page - 1) * limit;
  const toIndex = fromIndex + limit - 1;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Get total count of coupons
  const { count: totalItems } = await supabase
    .from('coupons')
    .select('*', { count: 'exact', head: true });

  // Get paginated coupons
  const { data: coupons } = await supabase
    .from('coupons')
    .select('*')
    .order('coupon_id', { ascending: false })
    .range(fromIndex, toIndex);

  return (
    <>
      <AdminPageHeader
        title="Mã giảm giá"
        description="Quản lý các coupon khuyến mãi cho khách hàng."
        actions={
        <Link href="/admin/coupons/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" /> Tạo mã mới
          </Button>
        </Link>
        }
      />

      <AdminTableShell>
        <table className="w-full text-sm">
          <thead className="bg-muted/40 border-b">
            <tr>
              <th className="text-left px-5 py-3 font-semibold">Mã code</th>
              <th className="text-left px-5 py-3 font-semibold">Giảm giá</th>
              <th className="text-left px-5 py-3 font-semibold">Đơn tối thiểu</th>
              <th className="text-left px-5 py-3 font-semibold">Sử dụng</th>
              <th className="text-left px-5 py-3 font-semibold">Hết hạn</th>
              <th className="text-left px-5 py-3 font-semibold">Trạng thái</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {(!coupons || coupons.length === 0) && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-muted-foreground">
                  <Tag className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  Chưa có mã giảm giá nào.
                </td>
              </tr>
            )}
            {coupons?.map((c) => (
              <tr key={c.coupon_id} className="hover:bg-muted/20 transition-colors">
                <td className="px-5 py-4 font-mono font-bold text-base tracking-wider">{c.code}</td>
                <td className="px-5 py-4">
                  {c.discount_type === 'percentage'
                    ? <span className="text-emerald-600 font-semibold">-{c.discount_value}%</span>
                    : <span className="text-emerald-600 font-semibold">-{c.discount_value.toLocaleString('vi-VN')} ₫</span>
                  }
                </td>
                <td className="px-5 py-4 text-muted-foreground">
                  {c.min_order_amount > 0 ? `${c.min_order_amount.toLocaleString('vi-VN')} ₫` : 'Không có'}
                </td>
                <td className="px-5 py-4 text-muted-foreground">
                  {c.used_count}/{c.usage_limit ?? '∞'}
                </td>
                <td className="px-5 py-4 text-muted-foreground text-xs">
                  {c.valid_to ? new Date(c.valid_to).toLocaleDateString('vi-VN') : 'Không giới hạn'}
                </td>
                <td className="px-5 py-4">
                  <Badge variant={c.status === 'active' ? 'default' : 'secondary'}>
                    {c.status === 'active' ? 'Đang hoạt động' : 'Tắt'}
                  </Badge>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2 justify-end">
                    <form action={toggleCouponStatus.bind(null, c.coupon_id, c.status)}>
                      <button type="submit" title="Bật/Tắt" className="text-muted-foreground hover:text-primary p-1 transition-colors">
                        <ToggleLeft className="h-4 w-4" />
                      </button>
                    </form>
                    <form action={deleteCouponAction.bind(null, c.coupon_id)}>
                      <ConfirmSubmitButton
                        message={`Bạn có chắc muốn xóa mã giảm giá "${c.code}"?`}
                        title="Xóa"
                        variant="ghost"
                        size="icon-sm"
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </ConfirmSubmitButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </AdminTableShell>
      <AdminPagination
        totalItems={totalItems || 0}
        currentPage={page}
        pageSize={limit}
      />
    </>
  );
}
