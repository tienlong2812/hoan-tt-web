import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY);

async function run() {
  const { data: variants, error: vErr } = await supabase.from('product_variants').select('*').limit(1);
  const { data: coupons, error: cErr } = await supabase.from('coupons').select('*').limit(1);
  console.log("Variants Error:", vErr);
  console.log("Coupons Error:", cErr);
}
run();
