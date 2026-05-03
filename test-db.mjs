import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const { data: brands } = await supabase.from('brands').select('*');
  console.log("Brands:", brands);
  
  const { data: products } = await supabase.from('products').select('product_name, brand_id, brands(brand_name, slug)');
  console.log("Products:", products);
}
run();
