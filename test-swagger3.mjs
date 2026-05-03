import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const res = await fetch(process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/?apikey=' + process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY);
  const swagger = await res.json();
  console.log("Addresses columns:", Object.keys(swagger.definitions.addresses.properties));
}
run();
