import { getSecret } from "@/lib/vault";

export const runtime = "edge";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

// Returns the status of a Checkout Session so the /checkout/complete page can
// confirm payment. Only exposes non-sensitive fields.
export async function GET(req: Request) {
  try {
    const id = new URL(req.url).searchParams.get("session_id") || "";
    if (!/^cs_/.test(id)) return json({ ok: false, error: "Bad session id." }, 400);
    const key = await getSecret("STRIPE_SECRET_KEY");
    if (!key) return json({ ok: false, error: "Stripe not configured." }, 400);
    const r = await fetch("https://api.stripe.com/v1/checkout/sessions/" + encodeURIComponent(id), {
      headers: { Authorization: "Bearer " + key },
    });
    const s = await r.json();
    if (!s || s.error) return json({ ok: false, error: (s && s.error && s.error.message) || "Not found." }, 400);
    const details = (s.customer_details as { email?: string } | undefined) || undefined;
    return json({
      ok: true,
      status: s.status,                    // "complete" | "open" | "expired"
      paymentStatus: s.payment_status,     // "paid" | "unpaid" | "no_payment_required"
      email: (details && details.email) || s.customer_email || "",
      amount: Number(s.amount_total || 0) / 100,
    });
  } catch {
    return json({ ok: false, error: "Status error." }, 500);
  }
}
