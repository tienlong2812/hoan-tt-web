import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY);

async function run() {
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  console.log("Error:", error);
  console.log("Data length:", data?.length);
}
run();
