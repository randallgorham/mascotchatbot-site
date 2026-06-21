import { getSecret, getSetting } from "@/lib/vault";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const text = String((body && body.text) || "").slice(0, 600);
    if (!text) return new Response(null, { status: 204 });

    const voice = await getSetting("voice", "openai");

    if (voice === "eleven") {
      const key = await getSecret("ELEVENLABS_API_KEY");
      const vid = await getSetting("eleven_voice_id", "pNInz6obpgDQGcFmaJgB");
      if (!key) return new Response(null, { status: 204 });
      const r = await fetch("https://api.elevenlabs.io/v1/text-to-speech/" + vid, {
        method: "POST",
        headers: { "xi-api-key": key, "Content-Type": "application/json", Accept: "audio/mpeg" },
        body: JSON.stringify({ text, model_id: "eleven_turbo_v2_5" }),
      });
      if (!r.ok) return new Response(null, { status: 204 });
      const buf = await r.arrayBuffer();
      return new Response(buf, { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" } });
    }

    const key = await getSecret("OPENAI_API_KEY");
    const ov = await getSetting("openai_voice", "onyx");
    if (!key) return new Response(null, { status: 204 });
    const r = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + key },
      body: JSON.stringify({ model: "tts-1-hd", voice: ov, input: text, response_format: "mp3", speed: 1.05 }),
    });
    if (!r.ok) return new Response(null, { status: 204 });
    const buf = await r.arrayBuffer();
    return new Response(buf, { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" } });
  } catch {
    return new Response(null, { status: 204 });
  }
}
