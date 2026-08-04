import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  try {
    const signature = req.headers.get('x-lipila-signature');
    const payload = await req.json();

    // In a real integration, verify signature against lipila_webhook_secret from settings

    if (payload.status === 'SUCCESSFUL' || payload.status === 'Successful') {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      const ref = payload.referenceId || payload.reference;
      const { data: payment } = await supabase
        .from('payments')
        .select('*')
        .eq('transaction_ref', ref)
        .single();
        
      if (payment && payment.status !== 'approved') {
        // Approve payment
        await supabase.from('payments').update({ status: 'approved' }).eq('id', payment.id);
        
        // Count votes
        if (payment.payment_type === 'voting' && payment.nominee_id && payment.user_id) {
          await supabase.from('votes').insert({
            user_id: payment.user_id,
            nominee_id: payment.nominee_id,
            category_id: payment.category_id || null,
            votes_count: payment.votes_count || 1,
            payment_id: payment.id
          });
          
          await supabase.rpc('increment_vote_count', {
            nominee_row_id: payment.nominee_id,
            votes_to_add: payment.votes_count || 1
          });
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), { headers: corsHeaders, status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { headers: corsHeaders, status: 400 });
  }
});
