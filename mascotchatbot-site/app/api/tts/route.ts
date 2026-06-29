import { getSecret, getSetting } from "@/lib/vault";
import { getBot } from "@/lib/botcfg";

export const runtime = "edge";

const ENERGY_INSTRUCTIONS =
  "Speak in an upbeat, friendly, high-energy and genuinely cheerful tone — bright, warm, and confident, with natural lively pacing. Never flat or monotone.";

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function mp3(buf: ArrayBuffer) {
  return new Response(buf, { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store", ...CORS } });
}
function empty() {
  return new Response(null, { status: 204, headers: CORS });
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const text = String((body && (body as { text?: string }).text) || "").slice(0, 600);
    if (!text) return empty();

    const o = body as { provider?: string; openaiVoice?: string; elevenVoiceId?: string; speed?: number; botId?: string };
    const bot = typeof o.botId === "string" && o.botId ? await getBot(o.botId) : null;
    const provider = o.provider || (bot ? "openai" : await getSetting("voice", "openai"));

    // ElevenLabs only for the site default (no per-bot Eleven in MVP).
    if (provider === "eleven" && !bot) {
      const key = await getSecret("ELEVENLABS_API_KEY");
      const vid = o.elevenVoiceId || (await getSetting("eleven_voice_id", "pNInz6obpgDQGcFmaJgB"));
      if (key) {
        const r = await fetch("https://api.elevenlabs.io/v1/text-to-speech/" + vid, {
          method: "POST",
          headers: { "xi-api-key": key, "Content-Type": "application/json", Accept: "audio/mpeg" },
          body: JSON.stringify({ text, model_id: "eleven_turbo_v2_5", voice_settings: { stability: 0.35, similarity_boost: 0.8, style: 0.65, use_speaker_boost: true } }),
        });
        if (r.ok) return mp3(await r.arrayBuffer());
      }
    }

    const key = await getSecret("OPENAI_API_KEY");
    if (!key) return empty();
    const voice = o.openaiVoice || (bot ? bot.voice : await getSetting("openai_voice", "ash")) || "ash";
    const speed = typeof o.speed === "number" ? o.speed : Number(await getSetting("openai_speed", "1.1")) || 1.1;

    const r1 = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + key },
      body: JSON.stringify({ model: "tts-1", voice, input: text, response_format: "mp3", speed }),
    });
    if (r1.ok) return mp3(await r1.arrayBuffer());

    const r2 = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + key },
      body: JSON.stringify({ model: "tts-1-hd", voice, input: text, response_format: "mp3", speed }),
    });
    if (r2.ok) return mp3(await r2.arrayBuffer());
    return empty();
  } catch {
    return empty();
  }
}
