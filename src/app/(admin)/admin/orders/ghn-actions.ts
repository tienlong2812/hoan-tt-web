'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function pushOrdersToGHN(orderIds: number[]) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Bạn cần đăng nhập để thực hiện thao tác này.' };
  }

  const GHN_API_TOKEN = process.env.GHN_API_TOKEN;
  const GHN_SHOP_ID = process.env.GHN_SHOP_ID;
  const GHN_API_URL = process.env.GHN_API_URL || 'https://dev-online-gateway.ghn.vn/shiip/public-api/v2';

  if (!GHN_API_TOKEN || !GHN_SHOP_ID) {
    return { success: false, error: 'Chưa cấu hình GHN_API_TOKEN hoặc GHN_SHOP_ID trong biến môi trường.' };
  }

  let successCount = 0;
  let failCount = 0;

  for (const orderId of orderIds) {
    try {
      // 1. Fetch order details
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            price_at_purchase,
            products ( product_name ),
            product_variants ( variant_name )
          )
        `)
        .eq('order_id', orderId)
        .single();

      if (orderError || !orderData) {
        console.error(`Error fetching order ${orderId}:`, orderError);
        failCount++;
        continue;
      }

      // Check if already has GHN code to prevent pushing again if it succeeded
      if (orderData.ghn_order_code) {
        // Skip or update? For now, skip
        console.log(`Order ${orderId} already has GHN code: ${orderData.ghn_order_code}. Skipping.`);
        continue;
      }

      // 2. Prepare items payload
      const items = (orderData.order_items || []).map((item: any) => ({
        name: item.products?.product_name || 'Sản phẩm',
        code: String(item.product_variants?.variant_name || 'N/A'),
        quantity: item.quantity,
        price: item.price_at_purchase,
        weight: 500, // Default weight 500g
        length: 10,
        width: 10,
        height: 10
      }));

      // Fallback if no items
      if (items.length === 0) {
        items.push({
          name: 'Đơn hàng không có sản phẩm',
          code: 'N/A',
          quantity: 1,
          price: orderData.total_amount,
          weight: 500,
          length: 10,
          width: 10,
          height: 10
        });
      }

      // 3. Prepare GHN request payload
      const isCOD = orderData.payment_method?.toUpperCase() === 'COD';
      const codAmount = isCOD ? Number(orderData.total_amount) : 0;
      
      const payload = {
        payment_type_id: 1, // 1: Shop pays shipping
        required_note: 'CHOXEMHANGKHONGTHU',
        client_order_code: `ORDER_${orderData.order_id}`,
        to_name: orderData.receiver_name || 'Khách Hàng',
        to_phone: orderData.receiver_phone || '0999999999',
        to_address: orderData.detail_address,
        to_ward_name: orderData.ward,
        to_district_name: orderData.district,
        to_province_name: orderData.province,
        cod_amount: codAmount,
        content: `Đơn hàng #${orderData.order_id}`,
        weight: 500, // Default weight for the whole package
        length: 10,
        width: 10,
        height: 10,
        service_type_id: 2, // 2: Standard/Light shipping
        items: items
      };

      // 4. Call GHN API
      const response = await fetch(`${GHN_API_URL}/shipping-order/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Token': GHN_API_TOKEN,
          'ShopId': GHN_SHOP_ID
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      // 5. Update Database
      if (response.ok && result.code === 200) {
        // Success
        await supabase
          .from('orders')
          .update({
            ghn_order_code: result.data?.order_code,
            expected_delivery_time: result.data?.expected_delivery_time,
            shipping_status: 'ready_to_pick',
            order_status: 'shipping', // Auto change status
            ghn_raw_response: result,
            shipping_error: null,
            updated_at: new Date().toISOString()
          })
          .eq('order_id', orderId);
          
        successCount++;
      } else {
        // Failed
        await supabase
          .from('orders')
          .update({
            ghn_raw_response: result,
            shipping_error: result.message_display || result.message || 'Lỗi không xác định từ GHN',
            updated_at: new Date().toISOString()
          })
          .eq('order_id', orderId);
          
        failCount++;
      }
    } catch (e: any) {
      console.error(`Exception pushing order ${orderId}:`, e);
      await supabase
        .from('orders')
        .update({
          shipping_error: e.message || 'Lỗi hệ thống khi gọi GHN API',
          updated_at: new Date().toISOString()
        })
        .eq('order_id', orderId);
      failCount++;
    }
  }

  revalidatePath('/admin/orders');
  return { success: true, successCount, failCount };
}
