import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY);

async function run() {
  const { data, error } = await supabase.from('addresses').select('*').limit(1);
  console.log("Data:", data);
  console.log("Error:", error);
}
run();
