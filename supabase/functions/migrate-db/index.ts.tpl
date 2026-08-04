import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

const sqlSchema = __SQL_SCHEMA__;
const usersData = __USERS_DATA__;
const tableData = __TABLE_DATA__;

serve(async (req) => {
  const client = new Client("postgres://postgres:0978627981ps@db.jxsmbturssyhhilycspo.supabase.co:5432/postgres");
  try {
    await client.connect();

    // 0. Clean auth.users
    await client.queryArray(`DELETE FROM auth.users;`);

    // 1. Drop public schema
    await client.queryArray(`
      DROP SCHEMA public CASCADE;
      CREATE SCHEMA public;
      GRANT ALL ON SCHEMA public TO postgres;
      GRANT ALL ON SCHEMA public TO public;
    `);

    // 2. Execute full schema
    const stmts = sqlSchema.split(';');
    for(const stmt of stmts) {
      if(stmt.trim()) {
        try {
          await client.queryArray(stmt);
        } catch(e) {
          console.log(e.message);
        }
      }
    }

    // 2.5 Clean pre-inserted data
    await client.queryArray(`DELETE FROM categories;`);
    await client.queryArray(`DELETE FROM site_settings;`);

    let logs = [];

    // 3. Insert users
    for (const u of usersData) {
      try {
        await client.queryObject(`
          INSERT INTO auth.users (id, email, encrypted_password, raw_user_meta_data, created_at, updated_at, aud, role)
          VALUES ($1, $2, $3, $4, $5, $6, 'authenticated', 'authenticated')
          ON CONFLICT (id) DO UPDATE SET 
            encrypted_password = EXCLUDED.encrypted_password,
            raw_user_meta_data = EXCLUDED.raw_user_meta_data
        `, [u.id, u.email, u.encrypted_password, u.raw_user_meta_data, u.created_at, u.created_at]);
      } catch (e) {
        logs.push(`Error user ${u.email}: ${e.message}`);
      }
    }

    // 4. Insert tables
    const tableOrder = ['site_settings', 'profiles', 'categories', 'nominees', 'sponsors', 'partners', 'payments', 'votes', 'news', 'gallery'];
    for (const table of tableOrder) {
      const rows = tableData[table];
      if (!rows || rows.length === 0) continue;
      const keys = Object.keys(rows[0]);
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(',');
      const setClause = keys.map(k => `"${k}" = EXCLUDED."${k}"`).join(',');
      const pk = table === 'site_settings' ? 'key' : 'id';
      
      let inserted = 0;
      for (const row of rows) {
        let values = keys.map(k => {
          let val = row[k];
          if (table === 'site_settings' && k === 'value') {
            return JSON.stringify(val);
          }
          if (val && typeof val === 'object') {
            return JSON.stringify(val);
          }
          return val;
        });
        
        try {
          await client.queryObject(`
            INSERT INTO public."${table}" (${keys.map(k=>`"${k}"`).join(',')})
            VALUES (${placeholders})
            ON CONFLICT ("${pk}") DO UPDATE SET ${setClause}
          `, values);
          inserted++;
        } catch (e) {
          logs.push(`Error ${table}: ${e.message}`);
        }
      }
      logs.push(`Inserted ${inserted} into ${table}`);
    }

    await client.end();
    return new Response(JSON.stringify({ success: true, logs }), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
});
