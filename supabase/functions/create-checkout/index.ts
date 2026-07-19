import { corsHeaders, jsonResponse } from "../_shared/cors.ts";
import { adminClient, userClient } from "../_shared/supabase.ts";

function lipilaBaseUrl() {
  return (Deno.env.get("LIPILA_API_BASE_URL") || "https://api.lipila.io").replace(/\/$/, "");
}

function toZambiaMsisdn(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("260")) return digits;
  if (digits.startsWith("0") && digits.length === 10) return `260${digits.slice(1)}`;
  if (digits.length === 9) return `260${digits}`;
  return digits;
}

function splitName(fullName: string | null | undefined) {
  const parts = (fullName || "Tunya Voter").trim().split(/\s+/);
  return {
    firstName: parts[0] || "Tunya",
    lastName: parts.slice(1).join(" ") || "Voter",
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return jsonResponse({ error: "Unauthorized" }, 401);

    const body = await req.json();
    const payment_id = body.payment_id as string | undefined;
    const method = (body.method as string | undefined) || "mobile_money";
    const phone = body.phone as string | undefined;
    const callback_url = body.callback_url as string | undefined;

    if (!payment_id) return jsonResponse({ error: "payment_id is required" }, 400);
    if (!phone) return jsonResponse({ error: "phone is required" }, 400);

    const apiKey = Deno.env.get("LIPILA_API_KEY");
    if (!apiKey) return jsonResponse({ error: "Lipila is not configured" }, 500);

    const userSb = userClient(authHeader);
    const { data: authData, error: authError } = await userSb.auth.getUser();
    if (authError || !authData.user) return jsonResponse({ error: "Unauthorized" }, 401);

    const admin = adminClient();
    const { data: payment, error: payError } = await admin
      .from("payments")
      .select("id, user_id, amount, status, payment_type, transaction_ref, votes_count, nominee_id")
      .eq("id", payment_id)
      .maybeSingle();

    if (payError || !payment) return jsonResponse({ error: "Payment not found" }, 404);
    if (payment.user_id !== authData.user.id) return jsonResponse({ error: "Forbidden" }, 403);
    if (payment.status !== "pending") return jsonResponse({ error: "Payment is not pending" }, 400);
    if (payment.payment_type !== "voting") {
      return jsonResponse({ error: "Only voting payments support automatic checkout" }, 400);
    }

    const amount = Number(payment.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return jsonResponse({ error: "Invalid payment amount" }, 400);
    }

    const msisdn = toZambiaMsisdn(phone);
    if (msisdn.length < 12) {
      return jsonResponse({ error: "Enter a valid Zambian mobile number" }, 400);
    }

    const origin = (callback_url || Deno.env.get("SITE_URL") || "http://localhost:5173").replace(/\/$/, "");
    const returnUrl = `${origin}/payment/callback?payment_id=${payment.id}`;
    const webhookUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/lipila-webhook`;
    const email = authData.user.email || "voter@tunyaawards.com";

    const { data: profile } = await admin
      .from("profiles")
      .select("full_name, phone")
      .eq("id", authData.user.id)
      .maybeSingle();

    const { firstName, lastName } = splitName(profile?.full_name);
    const referenceId = payment.transaction_ref;
    const narration = `Tunya Awards vote (${payment.votes_count || 1})`;

    let lipilaRes: Response;
    if (method === "card") {
      lipilaRes = await fetch(`${lipilaBaseUrl()}/api/v1/collections/card`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          callbackUrl: webhookUrl,
        },
        body: JSON.stringify({
          customerInfo: {
            firstName,
            lastName,
            phoneNumber: msisdn,
            city: "Lusaka",
            country: "ZM",
            address: "Zambia",
            email,
            zip: "10101",
          },
          collectionRequest: {
            referenceId,
            amount,
            narration,
            accountNumber: msisdn,
            currency: "ZMW",
            backUrl: returnUrl,
            referenceData: payment.id,
          },
        }),
      });
    } else {
      lipilaRes = await fetch(`${lipilaBaseUrl()}/api/v1/collections/mobile-money`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          callbackUrl: webhookUrl,
        },
        body: JSON.stringify({
          referenceId,
          amount,
          narration,
          accountNumber: msisdn,
          currency: "ZMW",
          email,
          referenceData: payment.id,
        }),
      });
    }

    const lipilaBody = await lipilaRes.json().catch(() => ({}));
    if (!lipilaRes.ok) {
      const message =
        lipilaBody?.message ||
        lipilaBody?.error ||
        lipilaBody?.title ||
        "Failed to start Lipila payment";
      return jsonResponse({ error: message, details: lipilaBody }, 502);
    }

    const providerRef = lipilaBody.identifier || lipilaBody.referenceId || referenceId;
    const status = lipilaBody.status || "Pending";

    await admin
      .from("payments")
      .update({
        provider: "lipila",
        provider_ref: String(providerRef),
        provider_status: String(status).toLowerCase(),
        notes: method === "card" ? "card" : "mobile_money",
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    if (String(status).toLowerCase() === "failed") {
      return jsonResponse({
        error: lipilaBody.message || "Payment failed to initiate",
        status: "failed",
      }, 400);
    }

    return jsonResponse({
      method,
      payment_id: payment.id,
      reference: referenceId,
      provider_ref: providerRef,
      status: String(status).toLowerCase(),
      authorization_url: lipilaBody.cardRedirectionUrl || null,
      message: lipilaBody.message ||
        (method === "card"
          ? "Redirecting to card checkout"
          : "Approve the Mobile Money prompt on your phone"),
    });
  } catch (err) {
    console.error("create-checkout error", err);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
