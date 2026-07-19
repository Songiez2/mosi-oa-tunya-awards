const { Client } = require('pg');
const fs = require('fs');

const connectionString = 'postgres://postgres:0978627981ps@db.jxsmbturssyhhilycspo.supabase.co:5432/postgres';
const client = new Client({ connectionString });

const tables = [
  'site_settings',
  'profiles',
  'categories',
  'nominees',
  'sponsors',
  'partners',
  'payments',
  'votes',
  'news',
  'gallery'
];

async function run() {
  await client.connect();
  console.log("Connected to NEW DB");

  // 1. Ensure schema has all necessary tables and columns
  await client.query(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS news (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      image_url TEXT,
      published_at TIMESTAMPTZ DEFAULT NOW(),
      is_published BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS gallery (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT,
      image_url TEXT NOT NULL,
      category TEXT,
      sort_order INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country TEXT;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS province TEXT;
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT;
    
    ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
    ALTER TABLE news ENABLE ROW LEVEL SECURITY;
    ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
    
    DO $$ BEGIN
      CREATE POLICY "Allow public read on site_settings" ON site_settings FOR SELECT USING (true);
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    
    DO $$ BEGIN
      CREATE POLICY "Allow public read on news" ON news FOR SELECT USING (true);
    EXCEPTION WHEN duplicate_object THEN null; END $$;
    
    DO $$ BEGIN
      CREATE POLICY "Allow public read on gallery" ON gallery FOR SELECT USING (true);
    EXCEPTION WHEN duplicate_object THEN null; END $$;
  `);
  console.log("Schema updated");

  // 2. Insert auth.users
  const users = JSON.parse(fs.readFileSync('/workspace/app-cvv0uos78av5/supabase/migrations/dump_users.json', 'utf8'));
  for (const u of users) {
    try {
      await client.query(`
        INSERT INTO auth.users (id, email, encrypted_password, raw_user_meta_data, created_at, updated_at, aud, role)
        VALUES ($1, $2, $3, $4, $5, $6, 'authenticated', 'authenticated')
        ON CONFLICT (id) DO UPDATE SET 
          encrypted_password = EXCLUDED.encrypted_password,
          raw_user_meta_data = EXCLUDED.raw_user_meta_data
      `, [u.id, u.email, u.encrypted_password, u.raw_user_meta_data, u.created_at, u.created_at]);
    } catch (e) {
      console.log("Error inserting user", u.email, e.message);
    }
  }
  console.log(`Inserted ${users.length} auth.users`);

  // 3. Insert other tables
  for (const table of tables) {
    if (!fs.existsSync(`/workspace/app-cvv0uos78av5/supabase/migrations/dump_${table}.json`)) {
        continue;
    }
    const data = JSON.parse(fs.readFileSync(`/workspace/app-cvv0uos78av5/supabase/migrations/dump_${table}.json`, 'utf8'));
    if (data.length === 0) continue;
    
    const keys = Object.keys(data[0]);
    
    for (const row of data) {
      const values = keys.map(k => row[k]);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(',');
      const setClause = keys.map(k => `"${k}" = EXCLUDED."${k}"`).join(',');
      
      const pk = table === 'site_settings' ? 'key' : 'id';
      
      try {
        await client.query(`
          INSERT INTO public."${table}" (${keys.map(k=>`"${k}"`).join(',')})
          VALUES (${placeholders})
          ON CONFLICT ("${pk}") DO UPDATE SET ${setClause}
        `, values);
      } catch (e) {
        console.log(`Error inserting into ${table}:`, e.message);
      }
    }
    console.log(`Inserted ${data.length} rows into ${table}`);
  }

  console.log("Migration complete");
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
