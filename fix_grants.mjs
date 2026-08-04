import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: 'postgres://postgres:0978627981ps@db.jxsmbturssyhhilycspo.supabase.co:5432/postgres',
});

async function run() {
  await client.connect();
  console.log("Connected!");
  
  await client.query(`
    GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
    GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
    GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO anon, authenticated, service_role;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO anon, authenticated, service_role;
    NOTIFY pgrst, 'reload schema';
  `);
  
  console.log("Grants applied to jxsmbturssyhhilycspo!");
  await client.end();
}

run().catch(console.error);
