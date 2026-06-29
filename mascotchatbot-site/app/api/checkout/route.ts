import { getSecret } from "@/lib/vault";

export const runtime = "edge";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

type Item = { name?: string; monthly?: number; oneTime?: number; billing?: string; kind?: string };

export async function POST(req: Request) {
  try {
    const b = await req.json();
    const items: Item[] = Array.isArray(b && b.items) ? b.items : [];
    const email = String((b && b.email) || "");
    const origin = new URL(req.url).origin;

    const key = await getSecret("STRIPE_SECRET_KEY");
    if (!key) return json({ ok: false, stripe: false }); // caller falls back to invoice flow

    // Term-aware totals. The plan item carries its billing term; the recurring
    // portion is prepaid for that term (1 / 12 / 36 months).
    const plan = items.find((it) => (Number(it.monthly) || 0) > 0);
    const term = (plan && plan.billing) || "monthly";
    const months = term === "annual" ? 12 : term === "prepay3" ? 36 : 1;
    let monthly = 0, oneTime = 0;
    for (let i = 0; i < items.length; i++) { monthly += Number(items[i].monthly) || 0; oneTime += Number(items[i].oneTime) || 0; }
    const prepaid = monthly * months;        // recurring portion, paid up front
    const totalDue = prepaid + oneTime;      // full amount on the payment link

    const params = new URLSearchParams();
    params.set("mode", "payment");
    params.set("success_url", origin + "/checkout?paid=1");
    params.set("cancel_url", origin + "/checkout?canceled=1");
    if (email) params.set("customer_email", email);
    params.set("metadata[monthly_total]", String(monthly));
    params.set("metadata[term]", term);
    params.set("metadata[total_due]", String(totalDue));
    params.set("metadata[email]", email);
    // Carry the plan/tier + setup package so the webhook can provision skills correctly.
    const planName = (plan && plan.name) || "";
    const tierGuess = /premium/i.test(planName) ? "premium" : /pro/i.test(planName) ? "pro" : "starter";
    params.set("metadata[plan]", planName);
    params.set("metadata[tier]", tierGuess);
    const setupItem = items.find((it) => (Number(it.oneTime) || 0) > 0 && /setup|mascot|design|animat/i.test(String(it.name || "")));
    if (setupItem) params.set("metadata[setup]", String(setupItem.name || ""));

    let li = 0;
    // One-time fees (setup + add-on services), itemised.
    for (let i = 0; i < items.length; i++) {
      const amt = Math.round((Number(items[i].oneTime) || 0) * 100);
      if (amt > 0) {
        params.set(`line_items[${li}][price_data][currency]`, "usd");
        params.set(`line_items[${li}][price_data][product_data][name]`, (items[i].name || "Item") + " (one-time)");
        params.set(`line_items[${li}][price_data][unit_amount]`, String(amt));
        params.set(`line_items[${li}][quantity]`, "1");
        li++;
      }
    }
    // Recurring portion, prepaid for the chosen term.
    if (prepaid > 0) {
      const planName = (plan && plan.name) || "Plan";
      const label = term === "prepay3"
        ? `${planName} — 3 years prepaid (${months} × $${monthly}/mo)`
        : term === "annual"
        ? `${planName} — 1 year prepaid (12 × $${monthly}/mo)`
        : `${planName} — first month`;
      params.set(`line_items[${li}][price_data][currency]`, "usd");
      params.set(`line_items[${li}][price_data][product_data][name]`, label);
      params.set(`line_items[${li}][price_data][unit_amount]`, String(Math.round(prepaid * 100)));
      params.set(`line_items[${li}][quantity]`, "1");
      li++;
    }
    if (li === 0) return json({ ok: false, stripe: true, error: "Nothing to charge." });

    const r = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { Authorization: "Bearer " + key, "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });
    const s = await r.json();
    if (s && s.url) return json({ ok: true, stripe: true, url: s.url });
    return json({ ok: false, stripe: true, error: (s && s.error && s.error.message) || "Stripe error" });
  } catch {
    return json({ ok: false, error: "Checkout error." }, 500);
  }
}
