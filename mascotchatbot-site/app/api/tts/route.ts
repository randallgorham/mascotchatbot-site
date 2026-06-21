import { getSecret, getSetting } from "@/lib/vault";

export const runtime = "edge";

// Default upbeat delivery for Mr Amp — steers gpt-4o-mini-tts toward high energy.
const ENERGY_INSTRUCTIONS =
  "Speak in an upbeat, friendly, high-energy and genuinely cheerful tone — like an enthusiastic young tradesman who loves his job and is smiling while he talks. Bright, warm, and confident, with natural lively pacing. Never flat or monotone.";

function mp3(buf: ArrayBuffer) {
  return new Response(buf, { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const text = String((body && (body as { text?: string }).text) || "").slice(0, 600);
    if (!text) return new Response(null, { status: 204 });

    // Optional overrides (used by the admin Voices tab to preview a specific voice).
    const o = body as {
      provider?: string;
      openaiVoice?: string;
      elevenVoiceId?: string;
      speed?: number;
    };
    const provider = o.provider || (await getSetting("voice", "openai"));

    if (provider === "eleven") {
      const key = await getSecret("ELEVENLABS_API_KEY");
      const vid = o.elevenVoiceId || (await getSetting("eleven_voice_id", "pNInz6obpgDQGcFmaJgB"));
      if (key) {
        const r = await fetch("https://api.elevenlabs.io/v1/text-to-speech/" + vid, {
          method: "POST",
          headers: { "xi-api-key": key, "Content-Type": "application/json", Accept: "audio/mpeg" },
          body: JSON.stringify({
            text,
            model_id: "eleven_turbo_v2_5",
            voice_settings: { stability: 0.35, similarity_boost: 0.8, style: 0.65, use_speaker_boost: true },
          }),
        });
        if (r.ok) return mp3(await r.arrayBuffer());
      }
      // fall through to OpenAI if Eleven not available
    }

    const key = await getSecret("OPENAI_API_KEY");
    if (!key) return new Response(null, { status: 204 });
    const voice = o.openaiVoice || (await getSetting("openai_voice", "ash"));
    const speed = typeof o.speed === "number" ? o.speed : Number(await getSetting("openai_speed", "1.1")) || 1.1;

    // Preferred: expressive model that honors tone instructions for real energy.
    const r1 = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + key },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        voice,
        input: text,
        instructions: ENERGY_INSTRUCTIONS,
        response_format: "mp3",
        speed,
      }),
    });
    if (r1.ok) return mp3(await r1.arrayBuffer());

    // Fallback: classic HD model so the voice is never silent.
    const r2 = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + key },
      body: JSON.stringify({ model: "tts-1-hd", voice, input: text, response_format: "mp3", speed }),
    });
    if (r2.ok) return mp3(await r2.arrayBuffer());
    return new Response(null, { status: 204 });
  } catch {
    return new Response(null, { status: 204 });
  }
}
