import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY);

async function run() {
  const { data: { user } } = await supabase.auth.getUser(); // might be null
  // insert empty to trigger not-null
  const { error } = await supabase.from('addresses').insert({});
  console.log("Insert empty error:", error);
}
run();
