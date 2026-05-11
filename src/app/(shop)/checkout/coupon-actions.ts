'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function validateCoupon(code: string, orderTotal: number) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: coupon, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase().trim())
    .eq('status', 'active')
    .single();

  if (error || !coupon) {
    return { error: 'Mã giảm giá không hợp lệ hoặc đã hết hạn.' };
  }

  const now = new Date();
  if (coupon.valid_to && new Date(coupon.valid_to) < now) {
    return { error: 'Mã giảm giá đã hết hạn.' };
  }
  if (coupon.valid_from && new Date(coupon.valid_from) > now) {
    return { error: 'Mã giảm giá chưa có hiệu lực.' };
  }
  if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
    return { error: 'Mã giảm giá đã được sử dụng hết.' };
  }
  if (orderTotal < coupon.min_order_amount) {
    return { error: `Đơn hàng tối thiểu ${coupon.min_order_amount.toLocaleString('vi-VN')} ₫ để dùng mã này.` };
  }

  // Check per user limit
  const { data: { user } } = await supabase.auth.getUser();
  if (user && coupon.per_user_limit !== null) {
    const { count, error: countError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('coupon_id', coupon.coupon_id)
      .neq('order_status', 'cancelled');
    
    if (!countError && count !== null && count >= coupon.per_user_limit) {
      return { error: `Bạn đã sử dụng mã này tối đa ${coupon.per_user_limit} lần.` };
    }
  }

  let discount = 0;
  if (coupon.discount_type === 'percent' || coupon.discount_type === 'percentage') {
    discount = Math.round((orderTotal * coupon.discount_value) / 100);
  } else {
    discount = coupon.discount_value;
  }
  discount = Math.min(discount, orderTotal); // Can't discount more than total

  return {
    coupon_id: coupon.coupon_id,
    discount_amount: discount,
    message: (coupon.discount_type === 'percent' || coupon.discount_type === 'percentage')
      ? `Giảm ${coupon.discount_value}% = -${discount.toLocaleString('vi-VN')} ₫`
      : `Giảm -${discount.toLocaleString('vi-VN')} ₫`
  };
}
