const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const oldUrl = 'https://effdsgjfqxupyitqbzjg.supabase.co';
const oldKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmZmRzZ2pmcXh1cHlpdHFiempnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzUzNjcyMCwiZXhwIjoyMDk5MTEyNzIwfQ.a4CdUCgyRlgS2-0Fx1dAV0IgiqZ09tctNvq-BJQeDeE';
const oldSupabase = createClient(oldUrl, oldKey);

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

async function dump() {
  for (const table of tables) {
    const { data, error } = await oldSupabase.from(table).select('*');
    if (error) {
      console.log(`Error reading ${table}: ${error.message}`);
    } else {
      fs.writeFileSync(`/workspace/app-cvv0uos78av5/supabase/migrations/dump_${table}.json`, JSON.stringify(data, null, 2));
      console.log(`Dumped ${data.length} rows for ${table}`);
    }
  }
}
dump();
