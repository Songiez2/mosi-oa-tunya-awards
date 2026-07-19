import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req: Request) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        {
          status: 405,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const {
      phone,
      nominee_id,
      user_id,
      email,
      votes_count,
    } = await req.json();

    if (!phone || !nominee_id) {
      return new Response(
        JSON.stringify({
          error: "phone and nominee_id are required",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Get payment amount from payment_settings table for voting
    const { data: setting, error: settingError } = await supabase
      .from("payment_settings")
      .select("*")
      .eq("payment_type", "vote")
      .single();

    if (settingError || !setting) {
      return new Response(
        JSON.stringify({
          error: "Vote payment settings not found",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Calculate total amount (multiply by votes_count)
    const amount = votes_count ? setting.amount * votes_count : setting.amount;

    // Generate unique reference
    const referenceId = crypto.randomUUID();

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        user_id,
        nominee_id,
        payment_type: "voting",
        amount,
        currency: "ZMW",
        phone,
        lipila_reference: referenceId,
        votes_count: votes_count || 1,
        status: "pending",
      })
      .select()
      .single();

    if (paymentError) {
      throw paymentError;
    }

    // Get Supabase URL for callback
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const callbackUrl = `${supabaseUrl}/functions/v1/lipila-webhook`;

    // Call Lipila API
    const lipilaResponse = await fetch(
      "https://api.lipila.dev/api/v1/collections/mobile-money",
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          "x-api-key": Deno.env.get("LIPILA_API_KEY")!,
        },
        body: JSON.stringify({
          callbackUrl,
          referenceId,
          amount,
          narration: `Mosi-Oa-Tunya Awards Vote (${votes_count || 1} vote${votes_count > 1 ? 's' : ''})`,
          accountNumber: phone,
          currency: "ZMW",
          backUrl: `${supabaseUrl}/payment-failed`,
          redirectUrl: `${supabaseUrl}/payment-success`,
          email,
        }),
      },
    );

    if (!lipilaResponse.ok) {
      const errorText = await lipilaResponse.text();
      throw new Error(`Lipila API error: ${lipilaResponse.status} - ${errorText}`);
    }

    const lipilaData = await lipilaResponse.json();

    // Save Lipila response to payment record
    await supabase
      .from("payments")
      .update({
        transaction_id: lipilaData.identifier ?? null,
        payment_method: lipilaData.paymentType ?? null,
        metadata: lipilaData,
      })
      .eq("id", payment.id);

    return new Response(
      JSON.stringify({
        success: true,
        payment,
        lipila: lipilaData,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error: unknown) {
    console.error("Payment creation error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      },
    );
  }
});