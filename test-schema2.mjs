import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY);

async function run() {
  const { data, error } = await supabase.rpc('get_schema_columns', { table_name: 'addresses' });
  console.log("Data RPC:", data, error);
  // Alternative: insert invalid row and catch error
  const { error: err } = await supabase.from('addresses').insert({ foo: 'bar' });
  console.log("Error fields:", err);
}
run();
