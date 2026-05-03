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

  const receiver_name = formData.get('receiver_name') as string;
  const receiver_phone = formData.get('receiver_phone') as string;
  const province = formData.get('province') as string;
  const district = formData.get('district') as string;
  const ward = formData.get('ward') as string;
  const detail_address = formData.get('detail_address') as string;

  const shipping_address = {
    receiver_name,
    receiver_phone,
    province,
    district,
    ward,
    detail_address,
  };

  const payment_method = formData.get('payment_method') as string || 'COD';

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
      shipping_address: JSON.stringify(shipping_address),
      coupon_id: couponId || null,
      discount_amount: discountAmount || 0,
    })
    .select('order_id')
    .single();

  if (orderError) {
    console.error('Order creation error:', orderError);
    return { error: 'Failed to create order. Please try again.' };
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

  return { success: true, orderId: order.order_id };
}
