import { createClient } from '@supabase/supabase-js';

const oldKey = process.env.OLD_SUPABASE_KEY;
const newKey = process.env.NEW_SUPABASE_KEY;;

const oldClient = createClient(oldUrl, oldKey, { auth: { autoRefreshToken: false, persistSession: false } });
const newClient = createClient(newUrl, newKey, { auth: { autoRefreshToken: false, persistSession: false } });

async function migrate() {
  console.log('Starting migration...');
  
  // 1. Migrate auth users
  console.log('Fetching users...');
  let { data: { users }, error: usersErr } = await oldClient.auth.admin.listUsers();
  if (usersErr) {
    console.error('Error fetching users:', usersErr);
    return;
  }
  
  console.log(`Found ${users.length} users. Migrating...`);
  const userIdMap = {}; // old_id -> new_id
  for (const u of users) {
    // try to create user
    const { data: newUser, error: createErr } = await newClient.auth.admin.createUser({
      email: u.email,
      phone: u.phone,
      password: 'Password@2026', // dummy password, users must reset
      email_confirm: true,
      phone_confirm: !!u.phone,
      user_metadata: u.user_metadata
    });
    if (createErr) {
      if (createErr.message.includes('already been registered')) {
        // fetch existing user
        const { data: existing } = await newClient.auth.admin.listUsers();
        const eu = existing.users.find(x => x.email === u.email);
        if (eu) userIdMap[u.id] = eu.id;
      } else {
        console.error('Failed to create user', u.email, createErr);
      }
    } else {
      userIdMap[u.id] = newUser.user.id;
    }
  }
  console.log('Users migrated.');

  // Migrate Tables in order
  const tables = [
    'site_settings',
    'categories',
    'profiles',
    'nominees',
    'sponsors',
    'partners',
    'votes',
    'payments',
    'news',
    'gallery',
    'contact_messages',
    'announcements',
    'audit_logs'
  ];

  for (const table of tables) {
    console.log(`Migrating table: ${table}...`);
    let { data, error } = await oldClient.from(table).select('*');
    if (error) {
      console.log(`Skipping ${table}: ${error.message}`);
      continue;
    }
    if (!data || data.length === 0) {
      console.log(`${table} is empty.`);
      continue;
    }
    
    // For profiles, we need to map the ID if it changed
    if (table === 'profiles') {
      data = data.map(d => ({ ...d, id: userIdMap[d.id] || d.id }));
    }
    if (table === 'votes' || table === 'payments') {
      data = data.map(d => ({ ...d, user_id: userIdMap[d.user_id] || d.user_id }));
    }
    if (table === 'nominees') {
      data = data.map(d => ({ ...d, user_id: d.user_id ? (userIdMap[d.user_id] || d.user_id) : null }));
    }

    const { error: insertErr } = await newClient.from(table).upsert(data);
    if (insertErr) {
      console.error(`Error inserting ${table}:`, insertErr);
    } else {
      console.log(`Migrated ${data.length} rows in ${table}.`);
    }
  }
  
  console.log('Migration complete!');
}

migrate().catch(console.error);
