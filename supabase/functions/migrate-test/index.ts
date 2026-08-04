import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

serve(async (req) => {
  const client = new Client("postgres://postgres:0978627981ps@db.jxsmbturssyhhilycspo.supabase.co:5432/postgres");
  try {
    await client.connect();
    const result = await client.queryObject("SELECT current_database();");
    await client.end();
    return new Response(JSON.stringify(result.rows), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
});
