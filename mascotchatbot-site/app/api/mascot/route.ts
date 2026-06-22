// Custom mascot artwork: owners upload their own image; we store it in KV and
// serve it (with CORS) so the embedded widget can show it on any site.
import { kvGet, kvSet, kvReady } from "@/lib/vault";
import { getSessionEmail } from "@/lib/auth";
import { getOrCreateBot, saveBot } from "@/lib/botcfg";

export const runtime = "edge";

function j(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
}

// Owner uploads artwork (data URL). Stored under botimg:<id>; bot.image points here.
export async function POST(req: Request) {
  const email = await getSessionEmail(req);
  if (!email) return j({ ok: false, error: "Please sign in." }, 401);
  if (!kvReady()) return j({ ok: false, error: "Storage not connected." }, 400);

  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const dataUrl = String((body as { dataUrl?: string }).dataUrl || "");
  const m = dataUrl.match(/^data:(image\/(?:png|jpeg|jpg|webp|gif));base64,([A-Za-z0-9+/=]+)$/i);
  if (!m) return j({ ok: false, error: "Please upload a PNG, JPG, WEBP or GIF image." }, 400);
  if (m[2].length > 1_400_000) return j({ ok: false, error: "Image is too large — keep it under ~1MB." }, 400);

  const bot = await getOrCreateBot(email);
  await kvSet("botimg:" + bot.id, dataUrl);
  const url = "/api/mascot?bot=" + bot.id + "&v=" + Date.now();
  bot.image = url;
  await saveBot(bot);
  return j({ ok: true, image: url });
}

// Public: serve the stored image bytes (widget loads this cross-origin).
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("bot") || "";
  const dataUrl = id ? await kvGet("botimg:" + id) : null;
  const m = dataUrl ? dataUrl.match(/^data:(image\/[a-z+]+);base64,([A-Za-z0-9+/=]+)$/i) : null;
  if (!m) return new Response(null, { status: 404 });
  const bin = atob(m[2]);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Response(bytes, {
    headers: { "Content-Type": m[1], "Cache-Control": "public, max-age=300", "Access-Control-Allow-Origin": "*" },
  });
}
