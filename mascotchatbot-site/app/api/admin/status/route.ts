import { isAuthed, secretStatus, getSetting, kvReady, INTEGRATION_ENV, recentRecords } from "@/lib/vault";

export const runtime = "edge";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export async function GET(req: Request) {
  if (!(await isAuthed(req))) return json({ auth: false });

  const integrations: Record<string, { set: boolean; last4: string; source: string }> = {};
  const ids = Object.keys(INTEGRATION_ENV);
  for (let i = 0; i < ids.length; i++) {
    integrations[ids[i]] = await secretStatus(INTEGRATION_ENV[ids[i]]);
  }

  const [brain, voice, openaiVoice, elevenVoiceId] = await Promise.all([
    getSetting("brain", "openai"),
    getSetting("voice", "openai"),
    getSetting("openai_voice", "onyx"),
    getSetting("eleven_voice_id", ""),
  ]);

  const [orders, customers, onboarding] = await Promise.all([
    recentRecords("order:", 100),
    recentRecords("user:", 100),
    recentRecords("onboarding:", 100),
  ]);

  return json({
    auth: true,
    kv: kvReady(),
    integrations,
    settings: { brain, voice, openaiVoice, elevenVoiceId },
    data: { orders, customers, onboarding },
  });
}
