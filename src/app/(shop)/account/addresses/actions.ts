'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function deleteAddress(addressId: number) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const { error } = await supabase
    .from('addresses')
    .delete()
    .eq('address_id', addressId)
    .eq('user_id', user.id); 

  if (error) {
    console.error('Error deleting address:', error);
    throw new Error('Failed to delete address');
  }

  revalidatePath('/account/addresses');
}

export async function addAddress(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const full_name = formData.get('full_name') as string;
  const phone_number = formData.get('phone_number') as string;
  const province = formData.get('province') as string;
  const district = formData.get('district') as string;
  const detail_address = formData.get('detail_address') as string;

  // Check if it's the first address
  const { count } = await supabase
    .from('addresses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const is_default = count === 0;

  const { error } = await supabase.from('addresses').insert({
    user_id: user.id,
    full_name,
    phone_number,
    province,
    district,
    detail_address,
    is_default
  });

  if (error) {
    console.error('Error adding address:', error);
    throw new Error('Failed to add address');
  }

  revalidatePath('/account/addresses');
  revalidatePath('/checkout');
}

export async function setDefaultAddress(addressId: number) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Set all to false
  await supabase
    .from('addresses')
    .update({ is_default: false })
    .eq('user_id', user.id);

  // Set selected to true
  const { error } = await supabase
    .from('addresses')
    .update({ is_default: true })
    .eq('address_id', addressId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error setting default address:', error);
    throw new Error('Failed to set default address');
  }

  revalidatePath('/account/addresses');
  revalidatePath('/checkout');
}
