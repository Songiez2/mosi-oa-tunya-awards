const { Client } = require('pg');
const client = new Client("postgres://postgres:0978627981ps@db.jxsmbturssyhhilycspo.supabase.co:5432/postgres");
client.connect().then(async () => {
  const res = await client.query("SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'public';");
  console.log("Schema exists:", res.rowCount > 0);
  const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';");
  console.log("Tables:", tables.rows.map(r => r.table_name));
  
  const cats = await client.query("SELECT * FROM public.categories;");
  console.log("Categories count:", cats.rowCount);
  client.end();
}).catch(e => { console.error(e.message); });
