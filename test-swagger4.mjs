import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
  const res = await fetch(process.env.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/?apikey=' + process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY);
  const swagger = await res.json();
  console.log("Def keys:", Object.keys(swagger.definitions));
  if (swagger.definitions.addresses) {
      console.log("Address props:", Object.keys(swagger.definitions.addresses.properties));
  } else {
      console.log("No addresses table. Tables found:", Object.keys(swagger.definitions));
  }
}
run();
