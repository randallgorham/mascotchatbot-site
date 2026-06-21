import { setSecret, setSetting, kvReady, kvDel, INTEGRATION_ENV } from "@/lib/vault";
import { getSessionEmail, getRole, canManage } from "@/lib/auth";

export const runtime = "edge";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export async function POST(req: Request) {
  const email = await getSessionEmail(req);
  const role = await getRole(email);
  if (!canManage(role)) return json({ ok: false, error: "Not authorized." }, 401);
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
    if (typeof body.ghlCalendarUrl === "string") await setSetting("ghl_calendar_url", body.ghlCalendarUrl.trim());
    if (typeof body.openaiSpeed === "string" || typeof body.openaiSpeed === "number")
      await setSetting("openai_speed", String(body.openaiSpeed));
    const bv = (body as { botVoices?: Record<string, string> }).botVoices;
    if (bv && typeof bv === "object") {
      await setSetting("bot_voices", JSON.stringify(bv));
      // Mr Amp is the live demo bot — keep the homepage voice in sync with his row.
      if (typeof bv.amp === "string" && bv.amp) await setSetting("openai_voice", bv.amp);
    }
    return json({ ok: true });
  }

  if (body.type === "deleteCustomer") {
    const email = String((body as { email?: string }).email || "").trim().toLowerCase();
    if (!email) return json({ ok: false, error: "No email provided." }, 400);
    await kvDel("user:" + email);
    return json({ ok: true });
  }

  return json({ ok: false, error: "Unknown request." }, 400);
}
