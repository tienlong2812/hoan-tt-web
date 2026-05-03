'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createCouponAction(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const code = (formData.get('code') as string).toUpperCase().trim();
  const discount_type = formData.get('discount_type') as string;
  const discount_value = parseFloat(formData.get('discount_value') as string);
  const min_order_amount = parseFloat(formData.get('min_order_amount') as string) || 0;
  const usage_limit = formData.get('usage_limit') ? parseInt(formData.get('usage_limit') as string) : null;
  const valid_from = formData.get('valid_from') as string || null;
  const valid_to = formData.get('valid_to') as string || null;

  const { error } = await supabase.from('coupons').insert({
    code,
    discount_type,
    discount_value,
    min_order_amount,
    usage_limit,
    valid_from: valid_from || new Date().toISOString(),
    valid_to: valid_to || null,
    status: 'active'
  });

  if (error) {
    console.error('Error creating coupon:', error);
    throw new Error('Failed to create coupon');
  }

  revalidatePath('/admin/coupons');
  redirect('/admin/coupons');
}

export async function toggleCouponStatus(couponId: number, currentStatus: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

  const { error } = await supabase
    .from('coupons')
    .update({ status: newStatus })
    .eq('coupon_id', couponId);

  if (error) throw new Error('Failed to update coupon status');
  revalidatePath('/admin/coupons');
}

export async function deleteCouponAction(couponId: number) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from('coupons')
    .delete()
    .eq('coupon_id', couponId);

  if (error) throw new Error('Failed to delete coupon');
  revalidatePath('/admin/coupons');
}
