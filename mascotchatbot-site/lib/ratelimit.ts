// Lightweight per-key rate limiter backed by the KV REST API (INCR + EXPIRE).
// Fails open (allows the request) when KV isn't configured so the product still works.
const KV_URL = process.env.KV_REST_API_URL || "";
const KV_TOKEN = process.env.KV_REST_API_TOKEN || "";

async function cmd(c: (string | number)[]): Promise<unknown> {
  if (!(KV_URL && KV_TOKEN)) return null;
  try {
    const r = await fetch(KV_URL, {
      method: "POST",
      headers: { Authorization: "Bearer " + KV_TOKEN, "Content-Type": "application/json" },
      body: JSON.stringify(c),
      cache: "no-store",
    });
    if (!r.ok) return null;
    const j = await r.json();
    return j && "result" in j ? j.result : null;
  } catch {
    return null;
  }
}

export async function rateLimit(key: string, limit: number, windowSec: number): Promise<{ ok: boolean; remaining: number }> {
  if (!(KV_URL && KV_TOKEN)) return { ok: true, remaining: limit };
  const k = "rl:" + key;
  const n = await cmd(["INCR", k]);
  const count = typeof n === "number" ? n : 1;
  if (count === 1) await cmd(["EXPIRE", k, windowSec]);
  return { ok: count <= limit, remaining: Math.max(0, limit - count) };
}

// Best-effort client IP from common edge headers.
export function clientIp(req: Request): string {
  const h = req.headers;
  return (
    (h.get("x-forwarded-for") || "").split(",")[0].trim() ||
    h.get("x-real-ip") ||
    h.get("cf-connecting-ip") ||
    "anon"
  );
}
