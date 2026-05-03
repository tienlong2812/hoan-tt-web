import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// We use Anon key here, which definitely has no INSERT permission without RLS
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY);

async function run() {
  const dummyBuffer = Buffer.from('hello world');
  const { data, error } = await supabase.storage
    .from('product-images')
    .upload('test.txt', dummyBuffer, { contentType: 'text/plain' });
    
  console.log("Upload result:", data);
  if (error) console.error("Upload error:", error);
}
run();
