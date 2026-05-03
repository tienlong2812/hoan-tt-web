'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function requestCancelOrder(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const order_id = formData.get('order_id') as string;

  const { error } = await supabase
    .from('orders')
    .update({ order_status: 'cancelled' })
    .eq('order_id', order_id);

  if (error) {
    console.error('Request Cancel Error:', error);
    throw new Error('Failed to request cancellation');
  }

  revalidatePath('/account/orders');
  revalidatePath('/admin/orders');
}
