import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY);

async function run() {
  let query = supabase
    .from('products')
    .select('*, brands(brand_name), categories(category_name, slug)')
    .eq('status', 'active');

  const [{ data: products, error }, { data: brands }, { data: categories }] = await Promise.all([
    query.order('created_at', { ascending: false }),
    supabase.from('brands').select('*'),
    supabase.from('categories').select('*')
  ]);
  console.log("products length:", products?.length);
  if (error) console.log("ERROR:", error);
}
run();
