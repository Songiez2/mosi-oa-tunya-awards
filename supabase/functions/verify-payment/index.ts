import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { adminClient, userClient } from "../_shared/supabase.ts";

function lipilaBaseUrl() {
  return (Deno.env.get("LIPILA_API_BASE_URL") || "https://api.lipila.io").replace(/\/$/, "");
}

async function approveIfNeeded(admin: ReturnType<typeof adminClient>, payment: {
  id: string;
  status: string;
  amount: number;
  transaction_ref: string;
  votes_count?: number | null;
}, lipilaStatus: string, providerRef?: string) {
  const normalized = lipilaStatus.toLowerCase();
  if (normalized === "successful" || normalized === "success") {
    await admin
      .from("payments")
      .update({
        provider: "lipila",
        provider_ref: providerRef || undefined,
        provider_status: "successful",
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    if (payment.status !== "approved") {
      const { error } = await admin.rpc("approve_payment", { payment_id_param: payment.id });
      if (error) throw new Error(error.message);
    }
    return "approved";
  }

  await admin
    .from("payments")
    .update({
      provider_status: normalized,
      updated_at: new Date().toISOString(),
    })
    .eq("id", payment.id);

  return normalized;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return jsonResponse({ error: "Unauthorized" }, 401);

    const { reference, payment_id } = await req.json();
    if (!reference && !payment_id) {
      return jsonResponse({ error: "reference or payment_id is required" }, 400);
    }

    const apiKey = Deno.env.get("LIPILA_API_KEY");
    if (!apiKey) return jsonResponse({ error: "Lipila is not configured" }, 500);

    const userSb = userClient(authHeader);
    const { data: authData, error: authError } = await userSb.auth.getUser();
    if (authError || !authData.user) return jsonResponse({ error: "Unauthorized" }, 401);

    const admin = adminClient();
    let query = admin.from("payments").select("*");
    if (payment_id) query = query.eq("id", payment_id);
    else query = query.or(`provider_ref.eq.${reference},transaction_ref.eq.${reference}`);

    const { data: payment, error: payError } = await query.maybeSingle();
    if (payError || !payment) return jsonResponse({ error: "Payment not found" }, 404);
    if (payment.user_id !== authData.user.id) return jsonResponse({ error: "Forbidden" }, 403);

    if (payment.status === "approved") {
      return jsonResponse({
        status: "approved",
        payment_id: payment.id,
        transaction_ref: payment.transaction_ref,
        votes_count: payment.votes_count,
      });
    }

    const ref = payment.transaction_ref;
    const verifyRes = await fetch(
      `${lipilaBaseUrl()}/api/v1/collections/check-status?referenceId=${encodeURIComponent(ref)}`,
      {
        headers: {
          accept: "application/json",
          "x-api-key": apiKey,
        },
      },
    );
    const verifyBody = await verifyRes.json().catch(() => ({}));

    if (!verifyRes.ok) {
      return jsonResponse({
        status: payment.provider_status || "pending",
        payment_id: payment.id,
        transaction_ref: payment.transaction_ref,
        error: verifyBody?.message || "Unable to verify payment yet",
      });
    }

    const lipilaStatus = String(verifyBody.status || "Pending");
    const finalStatus = await approveIfNeeded(
      admin,
      payment,
      lipilaStatus,
      verifyBody.identifier || verifyBody.referenceId,
    );

    return jsonResponse({
      status: finalStatus,
      payment_id: payment.id,
      transaction_ref: payment.transaction_ref,
      votes_count: payment.votes_count,
      message: verifyBody.message,
    });
  } catch (err) {
    console.error("verify-payment error", err);
    return jsonResponse({ error: err instanceof Error ? err.message : "Internal server error" }, 500);
  }
});
