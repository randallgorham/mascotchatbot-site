import { isAuthed, setSecret, setSetting, kvReady, INTEGRATION_ENV } from "@/lib/vault";

export const runtime = "edge";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export async function POST(req: Request) {
  if (!(await isAuthed(req))) return json({ ok: false, error: "Not authorized." }, 401);
  if (!kvReady()) return json({ ok: false, error: "No database connected yet. Create a Vercel KV store, then reload." }, 400);
  const body = await req.json().catch(() => ({} as Record<string, string>));

  if (body.type === "secret") {
    const name = INTEGRATION_ENV[String(body.provider || "")];
    const value = String(body.value || "").trim();
    if (!name) return json({ ok: false, error: "Unknown integration." }, 400);
    if (!value) return json({ ok: false, error: "Paste a value first." }, 400);
    const ok = await setSecret(name, value);
    return json({ ok });
  }

  if (body.type === "settings") {
    if (body.brain) await setSetting("brain", String(body.brain));
    if (body.voice) await setSetting("voice", String(body.voice));
    if (body.openaiVoice) await setSetting("openai_voice", String(body.openaiVoice));
    if (typeof body.elevenVoiceId === "string") await setSetting("eleven_voice_id", body.elevenVoiceId.trim());
    return json({ ok: true });
  }

  return json({ ok: false, error: "Unknown request." }, 400);
}
