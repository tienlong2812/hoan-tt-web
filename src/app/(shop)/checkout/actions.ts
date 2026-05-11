'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { CartItem } from '@/store/useCartStore';

export async function createOrderAction(
  formData: FormData,
  cartItems: CartItem[],
  totalAmount: number,
  couponId?: number | null,
  discountAmount?: number
) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // You would normally validate the user. If they aren't logged in, they checkout as guest.
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Bạn cần đăng nhập để thực hiện mua hàng!' };
  }

  const receiver_name = formData.get('receiver_name') as string;
  const receiver_phone = formData.get('receiver_phone') as string;
  const province = formData.get('province') as string;
  const district = formData.get('district') as string;
  const ward = formData.get('ward') as string;
  const detail_address = formData.get('detail_address') as string;

  const payment_method = formData.get('payment_method') as string || 'COD';

  // Double check coupon validity before creating order
  if (couponId) {
    const { data: coupon } = await supabase
      .from('coupons')
      .select('*')
      .eq('coupon_id', couponId)
      .eq('status', 'active')
      .single();

    if (!coupon) return { error: 'Mã giảm giá không còn hiệu lực.' };

    if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
      return { error: 'Mã giảm giá đã hết lượt sử dụng.' };
    }

    if (user && coupon.per_user_limit !== null) {
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('coupon_id', couponId)
        .neq('order_status', 'cancelled');

      if (count !== null && count >= coupon.per_user_limit) {
        return { error: 'Bạn đã hết lượt dùng mã giảm giá này.' };
      }
    }
  }

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user?.id || null,
      total_amount: totalAmount,
      shipping_fee: 0,
      payment_method: payment_method,
      payment_status: 'pending',
      order_status: 'pending',
      receiver_name,
      receiver_phone,
      province,
      district,
      ward,
      detail_address,
      coupon_id: couponId || null,
      discount_amount: discountAmount || 0,
    })
    .select('order_id')
    .single();

  if (orderError || !order) {
    console.error('Order Error:', orderError);
    return { error: 'Không thể tạo đơn hàng. Vui lòng thử lại.' };
  }

  // Create payment record
  const { error: paymentError } = await supabase
    .from('payments')
    .insert({
      order_id: order.order_id,
      payment_provider: payment_method,
      amount: totalAmount,
      status: 'pending',
    });

  if (paymentError) {
    console.error('Payment Record Error:', paymentError);
  }

  // Save address to address book if it's a new address and user is logged in
  if (user && formData.get('address_id') === 'new') {
    const { data: existingAddress } = await supabase
      .from('addresses')
      .select('address_id')
      .eq('user_id', user.id)
      .eq('receiver_name', receiver_name)
      .eq('receiver_phone', receiver_phone)
      .eq('province', province)
      .eq('district', district)
      .eq('ward', ward)
      .eq('detail_address', detail_address)
      .maybeSingle();

    if (!existingAddress) {
      await supabase.from('addresses').insert({
        user_id: user.id,
        receiver_name,
        receiver_phone,
        province,
        district,
        ward,
        detail_address,
        is_default: false
      });
    }
  }

  // Create order items
  const orderItemsData = cartItems.map(item => ({
    order_id: order.order_id,
    product_id: item.product_id,
    variant_id: item.variant_id || null,
    quantity: item.quantity,
    price_at_purchase: item.discount_price ?? item.price,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItemsData);

  if (itemsError) {
    console.error('Order items error:', itemsError);
    return { error: 'Order created but failed to save items. Please contact support.' };
  }

  // Increment coupon usage count
  if (couponId) {
    const { data: c } = await supabase.from('coupons').select('used_count').eq('coupon_id', couponId).single();
    await supabase.from('coupons').update({ used_count: (c?.used_count || 0) + 1 }).eq('coupon_id', couponId);
  }

  return { success: true, orderId: order.order_id };
}
