'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function submitReview(formData: FormData) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('Not authenticated');
  }

  const product_id = parseInt(formData.get('product_id') as string);
  const rating = parseInt(formData.get('rating') as string);
  const comment = formData.get('comment') as string;

  const { error } = await supabase.from('reviews').insert({
    product_id,
    user_id: user.id,
    rating,
    comment
  });

  if (error) {
    console.error('Submit Review Error:', error);
    throw new Error('Failed to submit review');
  }

  // Revalidate the product page to show the new review
  revalidatePath('/products/[slug]', 'page');
}
