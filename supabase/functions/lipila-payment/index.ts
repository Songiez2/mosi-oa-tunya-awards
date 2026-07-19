import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { amount, phoneNumber, reference, narration } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: settingsData, error: settingsError } = await supabaseAdmin
      .from('site_settings')
      .select('key, value');

    if (settingsError || !settingsData) {
      throw new Error('Failed to load site settings');
    }

    const settings = Object.fromEntries(settingsData.map(row => [row.key, row.value]));

    const LIPILA_API_KEY = settings.lipila_api_key;
    const isSandbox = settings.lipila_sandbox === true || settings.lipila_sandbox === 'true';

    if (!LIPILA_API_KEY) {
      throw new Error('Lipila API credentials not configured in Admin Settings');
    }

    let formattedPhone = phoneNumber.replace(/[^0-9]/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '26' + formattedPhone;
    } else if (!formattedPhone.startsWith('260') && formattedPhone.length === 9) {
      formattedPhone = '260' + formattedPhone;
    }

    const baseUrl = isSandbox 
      ? 'https://api.lipila.dev/api/v1/collections/mobile-money' 
      : 'https://blz.lipila.io/api/v1/collections/mobile-money';

    // Call Lipila Collections API
    const lipilaResponse = await fetch(baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LIPILA_API_KEY}`,
        'x-api-key': LIPILA_API_KEY,
      },
      body: JSON.stringify({
        accountNumber: formattedPhone,
        amount: Number(amount),
        currency: settings.lipila_currency || 'ZMW',
        referenceId: reference,
        narration: narration || 'Awards Payment',
      }),
    });

    const responseText = await lipilaResponse.text();
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Lipila Error (${lipilaResponse.status}): ${responseText.substring(0, 150)}`);
    }

    if (!lipilaResponse.ok) {
      throw new Error(result.message || 'Payment initiation failed');
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200, // Return 200 so frontend can read the error message
    });
  }
});
