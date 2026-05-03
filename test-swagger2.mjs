import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const res = await fetch(process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/', {
    headers: {
      apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
    }
  });
  const swagger = await res.json();
  console.log("Keys:", Object.keys(swagger));
  console.log("Definitions/components:", swagger.definitions || swagger.components);
}
run();
