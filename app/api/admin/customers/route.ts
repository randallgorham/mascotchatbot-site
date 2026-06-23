// Admin-only: list every customer bot with usage + lead counts.
import { kvList, kvGet, kvReady } from "@/lib/vault";
import { getSessionEmail, getRole, canManage } from "@/lib/auth";

export const runtime = "edge";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
}

type Row = { id: string; business: string; owner: string; industry: string; plan: string; messages: number; convos: number; leads: number; updatedAt: string };

export async function GET(req: Request) {
  const email = await getSessionEmail(req);
  const role = await getRole(email);
  if (!role || !canManage(role)) return json({ ok: false, error: "Forbidden" }, 403);
  if (!kvReady()) return json({ ok: false, error: "Database not connected." }, 400);

  const keys = await kvList("bot:");
  const rows: Row[] = [];
  for (let i = 0; i < keys.length; i++) {
    const v = await kvGet(keys[i]);
    if (!v) continue;
    let bot: { id?: string; business?: string; owner?: string; industry?: string; plan?: string; updatedAt?: string };
    try { bot = JSON.parse(v); } catch { continue; }
    const id = bot.id || keys[i].replace(/^bot:/, "");
    const [msgs, convos, leadKeys] = await Promise.all([
      kvGet("stat:" + id + ":msgs"),
      kvGet("stat:" + id + ":convos"),
      kvList("lead:" + id + ":"),
    ]);
    rows.push({
      id,
      business: bot.business || "",
      owner: bot.owner || "",
      industry: bot.industry || "",
      plan: bot.plan || "",
      messages: Number(msgs || 0),
      convos: Number(convos || 0),
      leads: leadKeys.length,
      updatedAt: bot.updatedAt || "",
    });
  }
  rows.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  const totals = rows.reduce(
    (t, r) => ({ messages: t.messages + r.messages, convos: t.convos + r.convos, leads: t.leads + r.leads }),
    { messages: 0, convos: 0, leads: 0 }
  );
  return json({ ok: true, customers: rows, totals, count: rows.length });
}
