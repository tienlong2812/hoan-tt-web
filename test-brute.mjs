import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY);

async function checkCol(colName) {
  const { error } = await supabase.from('addresses').insert({ [colName]: 'test' });
  if (error && error.message.includes('Could not find')) {
    return false;
  }
  return true;
}

async function run() {
  const cols = ['address_line1', 'address', 'street_address', 'address_line_1', 'street', 'detail_address'];
  for (const c of cols) {
    const exists = await checkCol(c);
    console.log(c, ":", exists);
  }
}
run();
