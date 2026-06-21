import { isAuthed, secretStatus, getSetting, kvReady } from "@/lib/vault";

export const runtime = "edge";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export async function GET(req: Request) {
  if (!(await isAuthed(req))) return json({ auth: false });
  const [openai, anthropic, eleven, ghl] = await Promise.all([
    secretStatus("OPENAI_API_KEY"),
    secretStatus("ANTHROPIC_API_KEY"),
    secretStatus("ELEVENLABS_API_KEY"),
    secretStatus("GHL_WEBHOOK_URL"),
  ]);
  const [brain, voice, openaiVoice, elevenVoiceId] = await Promise.all([
    getSetting("brain", "openai"),
    getSetting("voice", "openai"),
    getSetting("openai_voice", "onyx"),
    getSetting("eleven_voice_id", ""),
  ]);
  return json({
    auth: true,
    kv: kvReady(),
    integrations: { openai, anthropic, eleven, ghl },
    settings: { brain, voice, openaiVoice, elevenVoiceId },
  });
}
