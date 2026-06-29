import { kvIncr, kvIncrBy } from "@/lib/vault";

export const runtime = "edge";

// Lightweight session telemetry for time-on-mascot. The widget POSTs a "start"
// when a visitor opens the mascot, then a "beat" every few seconds while it's
// open. Average session length = dwellsum / sessions.
const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...CORS },
  });
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function POST(req: Request) {
  try {
    const b = await req.json();
    const sid = typeof (b && b.sid) === "string" ? String(b.sid).replace(/[^a-z0-9_-]/gi, "").slice(0, 40) : "";
    if (!sid) return json({ ok: false });
    const ev = b && b.ev;
    const day = new Date().toISOString().slice(0, 10);
    if (ev === "start") {
      await kvIncr("stat:" + sid + ":sessions");
      await kvIncr("stat:" + sid + ":sessions:" + day);
    } else if (ev === "beat") {
      const secs = Math.max(1, Math.min(120, Math.round(Number(b && b.secs) || 10)));
      await kvIncrBy("stat:" + sid + ":dwellsum", secs);
    }
    return json({ ok: true });
  } catch {
    return json({ ok: false });
  }
}
