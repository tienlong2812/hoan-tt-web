import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY);

function generateSlug(text) {
  if (!text) return '';
  return text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
}

async function run() {
  const brandsArray = ['lotte'];
  const { data: allBrands } = await supabase.from('brands').select('brand_id, brand_name');
  
  const matchingIds = allBrands
    ?.filter(b => brandsArray.includes(generateSlug(b.brand_name)))
    .map(b => b.brand_id) || [];
  console.log("matchingIds:", matchingIds);
  
  if (matchingIds.length > 0) {
    let query = supabase.from('products').select('*, brands(brand_name), categories(category_name, slug)').eq('status', 'active');
    query = query.in('brand_id', matchingIds);
    const { data } = await query;
    console.log("Filtered products:", data?.length);
  }
}
run();
