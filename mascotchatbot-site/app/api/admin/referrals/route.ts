// Admin-only: affiliate payouts — who is owed how much in referral commission.
import { kvReady } from "@/lib/vault";
import { getSessionEmail, getRole, canManage } from "@/lib/auth";
import { payouts } from "@/lib/referrals";

export const runtime = "edge";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
}

export async function GET(req: Request) {
  const email = await getSessionEmail(req);
  const role = await getRole(email);
  if (!role || !canManage(role)) return json({ ok: false, error: "Forbidden" }, 403);
  if (!kvReady()) return json({ ok: false, error: "Database not connected." }, 400);
  const p = await payouts();
  return json({ ok: true, ...p });
}
