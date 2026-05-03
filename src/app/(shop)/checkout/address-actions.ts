'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function fetchMyAddresses() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data: addresses } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', user.id)
    .order('is_default', { ascending: false });

  return addresses || [];
}
