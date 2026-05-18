'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { withAdminToast } from '@/lib/admin-toast';

export async function updateOrderStatus(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(withAdminToast('/admin/orders', 'Bạn cần đăng nhập để thực hiện thao tác này.', 'error'));

  const order_id = parseInt(formData.get('order_id') as string);
  const status = formData.get('status') as string;
  const payment_status = formData.get('payment_status') as string;
  const returnTo = (formData.get('return_to') as string) || '/admin/orders';

  if (!order_id || !status) {
    redirect(withAdminToast(returnTo, 'Thiếu thông tin đơn hàng cần cập nhật.', 'error'));
  }

  // Get current order info for additional logic
  const { data: order } = await supabase
    .from('orders')
    .select('payment_method, payment_status, total_amount')
    .eq('order_id', order_id)
    .single();

  let finalPaymentStatus = payment_status;

  // If order is delivered and it's COD, automatically mark as paid if not already
  const isCOD = order?.payment_method?.toUpperCase() === 'COD';
  if (status === 'delivered' && isCOD) {
    finalPaymentStatus = 'success';
  } else if (finalPaymentStatus === 'paid') {
    finalPaymentStatus = 'success';
  }

  const updateData: { order_status: string; updated_at: string; payment_status?: string } = {
    order_status: status,
    updated_at: new Date().toISOString()
  };

  if (finalPaymentStatus) {
    updateData.payment_status = finalPaymentStatus;
  }

  const { error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('order_id', order_id);

  if (error) {
    console.error('Error updating order status:', error);
    redirect(withAdminToast(returnTo, 'Không thể cập nhật trạng thái đơn hàng.', 'error'));
  }

  // Sync to payments table
  if (finalPaymentStatus) {
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('payment_id')
      .eq('order_id', order_id)
      .maybeSingle();

    if (existingPayment) {
      await supabase
        .from('payments')
        .update({
          status: finalPaymentStatus,
          paid_at: finalPaymentStatus === 'success' ? new Date().toISOString() : null
        })
        .eq('order_id', order_id);
    } else {
      await supabase.from('payments').insert({
        order_id: order_id,
        payment_provider: order?.payment_method || 'COD',
        amount: order?.total_amount || 0,
        status: finalPaymentStatus,
        paid_at: finalPaymentStatus === 'success' ? new Date().toISOString() : null
      });
    }
  }

  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${order_id}`);
  redirect(withAdminToast(returnTo, 'Đã cập nhật trạng thái đơn hàng.'));
}

export async function getOrdersForExport(filters: { from?: string; to?: string; q?: string }) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  let query = supabase
    .from('orders')
    .select('*, users(full_name, email)')
    .order('created_at', { ascending: false });

  if (filters.from) {
    query = query.gte('created_at', `${filters.from}T00:00:00Z`);
  }
  if (filters.to) {
    query = query.lte('created_at', `${filters.to}T23:59:59Z`);
  }
  if (filters.q) {
    const q = filters.q.trim();
    if (!isNaN(Number(q))) {
      query = query.eq('order_id', Number(q));
    } else {
      query = query.or(`receiver_name.ilike.%${q}%,receiver_phone.ilike.%${q}%`);
    }
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching orders for export:', error);
    throw new Error('Failed to fetch orders');
  }

  return data;
}
