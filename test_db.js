const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgres://postgres:0978627981ps@db.jxsmbturssyhhilycspo.supabase.co:5432/postgres'
});
client.connect().then(async () => {
  const res = await client.query("SELECT * FROM site_settings WHERE key = 'lipila_api_key' OR key = 'lipila_account_id'");
  console.log(res.rows);
  client.end();
}).catch(console.error);
