import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY);

async function run() {
  const { data: buckets, error } = await supabase.storage.getBucket('product-images');
  console.log("Bucket info:", buckets);
  if (error) console.error("Error:", error);
}
run();
