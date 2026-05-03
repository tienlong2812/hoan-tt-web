'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function updateOrderStatus(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const order_id = parseInt(formData.get('order_id') as string);
  const status = formData.get('status') as string;
  const payment_status = formData.get('payment_status') as string;

  if (!order_id || !status) return;

  const updateData: any = {
    order_status: status,
    updated_at: new Date().toISOString()
  };

  if (payment_status) {
    updateData.payment_status = payment_status;
  }

  const { error } = await supabase
    .from('orders')
    .update(updateData)
    .eq('order_id', order_id);

  if (error) {
    console.error('Error updating order status:', error);
    throw new Error('Failed to update order status');
  }

  revalidatePath('/admin/orders');
}
