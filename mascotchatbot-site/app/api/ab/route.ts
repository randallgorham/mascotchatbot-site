// Lightweight A/B counters for the pricing billing-default experiment.
// Visitors are bucketed monthly|annual (cookie set client-side); we count a
// "view" once per new visitor and a "cart" each time they add a plan.
import { kvIncr, kvReady } from "@/lib/vault";

export const runtime = "edge";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  const b = await req.json().catch(() => ({} as Record<string, unknown>));
  const variant = b.variant === "monthly" ? "monthly" : b.variant === "annual" ? "annual" : "";
  const event = b.event === "cart" ? "carts" : b.event === "checkout" ? "checkouts" : b.event === "view" ? "views" : "";
  if (!variant || !event || !kvReady()) return json({ ok: false });
  await kvIncr("stat:ab:billing:" + variant + ":" + event);
  return json({ ok: true });
}
