const fs = require('fs');

const sql1 = fs.readFileSync('/workspace/app-cvv0uos78av5/supabase/migrations/00001_initial_schema.sql', 'utf8');
const sql2 = fs.readFileSync('/workspace/app-cvv0uos78av5/supabase/migrations/00002_fix_handle_new_user_search_path.sql', 'utf8');
const sql3 = fs.readFileSync('/workspace/app-cvv0uos78av5/supabase/migrations/00003_add_is_winner_and_settings.sql', 'utf8');
const sql4 = `
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS province TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT;
`;

const users = fs.readFileSync('/workspace/app-cvv0uos78av5/supabase/migrations/dump_users.json', 'utf8');

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

let tableData = {};
for (const table of tables) {
  if (fs.existsSync(`/workspace/app-cvv0uos78av5/supabase/migrations/dump_${table}.json`)) {
    tableData[table] = JSON.parse(fs.readFileSync(`/workspace/app-cvv0uos78av5/supabase/migrations/dump_${table}.json`, 'utf8'));
  }
}

let tpl = fs.readFileSync('/workspace/app-cvv0uos78av5/supabase/functions/migrate-db/index.ts.tpl', 'utf8');
tpl = tpl.replace('__SQL_SCHEMA__', JSON.stringify(sql1 + "\n" + sql2 + "\n" + sql3 + "\n" + sql4));
tpl = tpl.replace('__USERS_DATA__', users);
tpl = tpl.replace('__TABLE_DATA__', JSON.stringify(tableData));

fs.writeFileSync('/workspace/app-cvv0uos78av5/supabase/functions/migrate-db/index.ts', tpl);
