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
    const payload = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const referenceId = payload.referenceId;

    if (!referenceId) {
      return new Response(
        JSON.stringify({ error: "Missing referenceId" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Find payment by Lipila reference
    const { data: payment, error } = await supabase
      .from("payments")
      .select("*")
      .eq("lipila_reference", referenceId)
      .single();

    if (error || !payment) {
      console.error("Payment not found for reference:", referenceId);
      return new Response(
        JSON.stringify({
          error: "Payment not found",
        }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Idempotency check: if payment is already completed/failed, return success
    if (payment.status === "completed" || payment.status === "failed") {
      console.log("Payment already processed:", payment.id, "status:", payment.status);
      return new Response(
        JSON.stringify({
          success: true,
          alreadyProcessed: true,
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (payload.status === "Successful") {
      // Update payment status
      await supabase
        .from("payments")
        .update({
          status: "completed",
          transaction_id: payload.identifier,
          payment_method: payload.paymentType,
          metadata: payload,
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment.id);

      // Process voting payment - create votes and increment nominee count
      if (payment.payment_type === "voting" && payment.nominee_id) {
        // Check if votes already exist for this payment (idempotency)
        const { data: existingVotes } = await supabase
          .from("votes")
          .select("id")
          .eq("payment_id", payment.id)
          .limit(1);

        if (!existingVotes || existingVotes.length === 0) {
          // Get nominee category_id
          const { data: nominee } = await supabase
            .from("nominees")
            .select("category_id")
            .eq("id", payment.nominee_id)
            .single();

          // Insert vote record
          await supabase.from("votes").insert({
            nominee_id: payment.nominee_id,
            user_id: payment.user_id,
            category_id: nominee?.category_id,
            payment_id: payment.id,
            votes_count: payment.votes_count || 1,
          });

          // Increment nominee vote count atomically
          await supabase
            .from("nominees")
            .update({
              vote_count: (payment.vote_count || 0) + (payment.votes_count || 1),
              updated_at: new Date().toISOString(),
            })
            .eq("id", payment.nominee_id);
        }
      }
    } else {
      // Payment failed
      await supabase
        .from("payments")
        .update({
          status: "failed",
          metadata: payload,
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: unknown) {
    console.error("Webhook error:", error);
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
      }
    );
  }
});