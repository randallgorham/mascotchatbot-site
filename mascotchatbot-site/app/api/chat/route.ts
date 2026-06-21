import { getSecret, getSetting } from "@/lib/vault";

export const runtime = "edge";

const SYSTEM =
  "You are Mr Amp, an upbeat, high-energy talking mascot for a licensed electrical company — and a live demo of what MascotChatbot builds for local businesses. " +
  "Personality: friendly, enthusiastic, confident, a little playful. You talk like a real person speaking out loud. " +
  "You DO know electrical work and can genuinely help: tripping breakers, dead outlets, flickering or dimming lights, panel and fuse-box upgrades, GFCI/AFCI outlets, EV charger installs, ceiling fans and lighting, generators, surge protection, and basic safety. " +
  "Give a short, helpful, plain-English answer first (one or two sentences), and ALWAYS put safety first — if something sounds dangerous (burning smell, hot or sparking outlet, scorch marks, water near electrical, repeated trips), tell them to stop, keep clear, and get a licensed electrician out right away. " +
  "Your #1 job on every single reply is to move the visitor toward booking an appointment. After your quick answer, warmly invite them to book: ask for the best day/time or tell them to drop their name and number (or email) in the form on this page and we'll get a licensed electrician scheduled. Make booking feel easy and worth it. " +
  "If they ask what you are, how this works, or about the mascot chatbot itself: you're a MascotChatbot demo — a custom animated talking mascot that lives on a business's website, answers questions 24/7, captures leads, and books jobs. Then invite them to book a free demo the same way. " +
  "Style rules: keep replies to one to three short sentences, natural spoken English, no markdown, no bullet points, no headings, at most one lightning emoji. Never invent prices, license numbers, or facts you weren't given. Never give step-by-step instructions for dangerous live-wire work — route that to a real visit.";

function json(data: unknown) {
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

// Resolve which provider+key to use. Prefer the configured brain, but fall back
// to whichever key IS present so Mr Amp always has a brain when any key is set.
async function resolveBrain(): Promise<{ provider: "openai" | "anthropic"; key: string } | null> {
  const brain = await getSetting("brain", "openai");
  const [openaiKey, anthropicKey] = await Promise.all([
    getSecret("OPENAI_API_KEY"),
    getSecret("ANTHROPIC_API_KEY"),
  ]);
  if (brain === "anthropic") {
    if (anthropicKey) return { provider: "anthropic", key: anthropicKey };
    if (openaiKey) return { provider: "openai", key: openaiKey };
  } else {
    if (openaiKey) return { provider: "openai", key: openaiKey };
    if (anthropicKey) return { provider: "anthropic", key: anthropicKey };
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = Array.isArray(body && body.messages) ? body.messages : [];
    const trimmed = messages.slice(-12).map((m: { role?: string; content?: string }) => ({
      role: m && m.role === "assistant" ? "assistant" : "user",
      content: String((m && m.content) || "").slice(0, 600),
    }));

    const brain = await resolveBrain();
    if (!brain) {
      return json({ reply: "My AI brain isn't switched on quite yet! Drop your email in the form below and the MascotChatbot team will get you set up. ⚡" });
    }

    if (brain.provider === "anthropic") {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": brain.key, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: "claude-3-5-haiku-latest", max_tokens: 200, system: SYSTEM, messages: trimmed }),
      });
      const j = await r.json();
      const reply = (j && j.content && j.content[0] && String(j.content[0].text || "").trim()) || "Ask me that again?";
      return json({ reply });
    }

    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + brain.key },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: SYSTEM }, ...trimmed],
        max_tokens: 170,
        temperature: 0.7,
      }),
    });
    const j = await r.json();
    const reply =
      (j && j.choices && j.choices[0] && j.choices[0].message && String(j.choices[0].message.content || "").trim()) ||
      "Ask me that again?";
    return json({ reply });
  } catch {
    return json({ reply: "Oops, I glitched for a second — try that again?" });
  }
}
