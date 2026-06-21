import { kvSet, kvReady, getSecret } from "@/lib/vault";

export const runtime = "edge";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export async function POST(req: Request) {
  try {
    const b = await req.json();
    const items = Array.isArray(b && b.items) ? b.items : [];
    const email = String((b && b.email) || "").slice(0, 200).trim();
    const business = String((b && b.business) || "").slice(0, 200).trim();
    if (!email || items.length === 0) return json({ ok: false, error: "Please add a plan and your email." }, 400);

    const id = "ord_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    const order = {
      id,
      createdAt: new Date().toISOString(),
      status: "new",
      business,
      email,
      website: String((b && b.website) || "").slice(0, 300).trim(),
      notes: String((b && b.notes) || "").slice(0, 2000).trim(),
      items,
      monthly: Number(b && b.monthly) || 0,
      oneTime: Number(b && b.oneTime) || 0,
    };

    if (kvReady()) await kvSet("order:" + id, JSON.stringify(order));

    const hook = await getSecret("GHL_WEBHOOK_URL");
    if (hook) {
      try {
        await fetch(hook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source: "mascotchatbot.com/checkout",
            email,
            business,
            website: order.website,
            plan: (items[0] && items[0].name) || "",
            monthly: order.monthly,
            setup: order.oneTime,
            notes: order.notes,
          }),
        });
      } catch {
        /* ignore webhook errors */
      }
    }

    return json({ ok: true, id });
  } catch {
    return json({ ok: false, error: "Something went wrong — please try again." }, 500);
  }
}
