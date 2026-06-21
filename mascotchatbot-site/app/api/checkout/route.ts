import { getSecret } from "@/lib/vault";

export const runtime = "edge";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

type Item = { name?: string; monthly?: number; oneTime?: number };

export async function POST(req: Request) {
  try {
    const b = await req.json();
    const items: Item[] = Array.isArray(b && b.items) ? b.items : [];
    const email = String((b && b.email) || "");
    const origin = new URL(req.url).origin;

    const key = await getSecret("STRIPE_SECRET_KEY");
    if (!key) return json({ ok: false, stripe: false }); // caller falls back to invoice flow

    let monthly = 0;
    for (let i = 0; i < items.length; i++) monthly += Number(items[i].oneTime ? 0 : 0) + (Number(items[i].monthly) || 0);

    const params = new URLSearchParams();
    params.set("mode", "payment");
    params.set("success_url", origin + "/checkout?paid=1");
    params.set("cancel_url", origin + "/checkout?canceled=1");
    if (email) params.set("customer_email", email);
    params.set("metadata[monthly_total]", String(monthly));
    params.set("metadata[email]", email);

    let li = 0;
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
    // If nothing one-time (e.g. 3-year prepay, setup waived), charge the first month today.
    if (li === 0 && monthly > 0) {
      params.set("line_items[0][price_data][currency]", "usd");
      params.set("line_items[0][price_data][product_data][name]", "First month");
      params.set("line_items[0][price_data][unit_amount]", String(Math.round(monthly * 100)));
      params.set("line_items[0][quantity]", "1");
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
