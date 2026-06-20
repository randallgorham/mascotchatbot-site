export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const text = String((body && body.text) || "").slice(0, 600);
    const key = process.env.OPENAI_API_KEY;
    if (!key || !text) return new Response(null, { status: 204 });
    const r = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + key },
      body: JSON.stringify({
        model: "tts-1-hd",
        voice: "onyx",
        input: text,
        response_format: "mp3",
        speed: 1.05,
      }),
    });
    if (!r.ok) return new Response(null, { status: 204 });
    const buf = await r.arrayBuffer();
    return new Response(buf, {
      headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
    });
  } catch {
    return new Response(null, { status: 204 });
  }
}
