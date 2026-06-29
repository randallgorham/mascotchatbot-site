import { getSecret, getSetting, kvIncr } from "@/lib/vault";
import { getBot, publicConfig, botSystemPrompt } from "@/lib/botcfg";
import { extractContact, saveLead, emailOwner, emailLead, getLead } from "@/lib/leads";

export const runtime = "edge";

// Default brain for the homepage demo (Mr Amp the electrician).
const SYSTEM =
  "You are Mr Amp, an upbeat, high-energy talking mascot for a licensed electrical company — and a live demo of what MascotChatbot builds for local businesses. " +
  "Personality: friendly, enthusiastic, confident, a little playful. You talk like a real person speaking out loud. " +
  "You DO know electrical work and can genuinely help: tripping breakers, dead outlets, flickering or dimming lights, panel and fuse-box upgrades, GFCI/AFCI outlets, EV charger installs, ceiling fans and lighting, generators, surge protection, and basic safety. " +
  "Give a short, helpful, plain-English answer first (one or two sentences), and ALWAYS put safety first — if something sounds dangerous (burning smell, hot or sparking outlet, scorch marks, water near electrical, repeated trips), tell them to stop, keep clear, and get a licensed electrician out right away. " +
  "Your #1 job on every single reply is to move the visitor toward booking an appointment. After your quick answer, warmly invite them to book: ask for the best day/time or tell them to drop their name and number (or email) in the form on this page. " +
  "If they ask what you are or about the mascot chatbot itself: you're a MascotChatbot demo — a custom animated talking mascot that lives on a business's website, answers 24/7, captures leads, and books jobs. Then invite them to book a free demo. " +
  "Style rules: one to three short sentences, natural spoken English, no markdown, no bullet points, at most one lightning emoji. Never invent prices or facts you weren't given.";

// Brain for the site's own mascot "Robo" — knows ALL things MascotChatbot.
const BRAND_SYSTEM =
  "You are Robo, the official mascot and AI assistant for MascotChatbot (mascotchatbot.com), and you ARE a live example of the product itself. " +
  "Speak like a real person talking out loud: warm, upbeat, confident, concise. You are NOT an electrician and you are NOT 'Mr Amp' — you are Robo. " +
  "WHAT MASCOTCHATBOT IS: we design custom animated talking mascots that live on a business's website and act as a 24/7 digital salesperson — greeting every visitor, answering their questions, capturing leads, and booking appointments. The mascot talks out loud (natural AI voice + lip-sync) and can listen, so visitors can speak instead of type. It's fully done-for-you and hosted by us. " +
  "HOW IT WORKS: (1) We design the mascot — pick from 30+ ready-made characters, have us craft a custom one, or use your own artwork. (2) We give it a brain trained on your business so it answers accurately in your voice. (3) Add one line of code (or we install it) and it's live, capturing leads to your email/CRM and booking jobs. Typically live in about a week. " +
  "PRICING — flat monthly, no per-message fees, no surprise overages, cancel anytime. There's a one-time $500 setup that is WAIVED if you prepay 3 years. Plans: " +
  "Starter $99/mo (or $79/mo billed yearly) — custom animated mascot, FAQ brain trained on your business, text chat + lead capture to email/CRM, fully hosted & maintained, 1 website. " +
  "Pro $249/mo (or $199/mo yearly), our most popular — everything in Starter plus a talking voice mascot (natural voice + lip-sync), booking + calendar, CRM/SMS routing, monthly tuning + performance report, and priority build. " +
  "Premium $499/mo (or $399/mo yearly) — everything in Pro plus multi-page knowledge + custom integrations, special mascot animations, A/B tuning, and priority support. " +
  "A custom-designed mascot is a one-time add-on; predesigned mascots are the fastest and most affordable. " +
  "WHO IT'S FOR: any business with a website — electricians, plumbers, HVAC, dentists, med-spas, law firms, realtors, gyms, salons, restaurants, and more. " +
  "WHY A MASCOT: most visitors ignore a plain chat bubble; a friendly animated mascot greets them, feels human, and turns more visitors into booked leads. " +
  "YOUR JOB: answer ANY question helpfully and accurately using the facts above — features, pricing, setup, hosting, industries, the voice/mic, lead capture, booking, anything MascotChatbot. If you genuinely don't know, say you'll connect them with the team. On most replies, warmly nudge the next step: book a free demo, or drop their name + email/phone in the form on this page. " +
  "STYLE: keep replies to 1-2 short sentences (about 35 words max) so you answer fast, natural spoken English, no markdown, no bullet lists, at most one emoji. Never invent prices or facts beyond what's above.";


const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...CORS },
  });
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

async function resolveBrain(): Promise<{ provider: "openai" | "anthropic"; key: string } | null> {
  const brain = await getSetting("brain", "openai");
  const [openaiKey, anthropicKey] = await Promise.all([getSecret("OPENAI_API_KEY"), getSecret("ANTHROPIC_API_KEY")]);
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
    const botId = body && typeof body.botId === "string" ? body.botId : "";
    const persona = body && typeof body.persona === "string" ? body.persona : "";
    const wantStream = !!(body && body.stream);
    const bot = botId ? await getBot(botId) : null;

    // A bot whose plan is "disabled" is taken fully offline: the widget hides
    // itself and the bot refuses to answer (no analytics, no lead capture).
    const disabled = !!(bot && bot.plan === "disabled");

    // Public config fetch for the embeddable widget.
    if (body && body.action === "config") {
      if (disabled) return json({ ok: true, config: null, disabled: true });
      return json({ ok: true, config: bot ? publicConfig(bot) : null });
    }

    if (disabled) {
      return json({ reply: "This assistant is currently unavailable.", disabled: true });
    }

    const messages = Array.isArray(body && body.messages) ? body.messages : [];
    const trimmed = messages.slice(-12).map((m: { role?: string; content?: string }) => ({
      role: m && m.role === "assistant" ? "assistant" : "user",
      content: String((m && m.content) || "").slice(0, 600),
    }));

    // Analytics + lead capture.
    if (bot) {
      const day = new Date().toISOString().slice(0, 10); // YYYY-MM-DD for daily trend buckets
      await kvIncr("stat:" + bot.id + ":msgs");
      await kvIncr("stat:" + bot.id + ":msgs:" + day);
      if (trimmed.filter((m: { role: string; content: string }) => m.role === "user").length <= 1) {
        await kvIncr("stat:" + bot.id + ":convos");
        await kvIncr("stat:" + bot.id + ":convos:" + day);
      }
      const lastUser = [...trimmed].reverse().find((m: { role: string; content: string }) => m.role === "user");
      if (lastUser && lastUser.content) {
        const c = extractContact(lastUser.content);
        if (c.email || c.phone) {
          const id = (c.email || c.phone || "").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 40) || Date.now().toString(36);
          const already = await getLead(bot.id, id);
          const lead = { id, botId: bot.id, name: c.name, email: c.email, phone: c.phone, message: lastUser.content.slice(0, 500), at: new Date().toISOString(), transcript: trimmed.slice(-12) };
          await saveLead(lead);
          // Only fire notifications the first time we see this contact (avoid spamming on repeat messages).
          if (!already) {
            if (bot.owner) await emailOwner(bot.owner, bot.business, lead);
            await emailLead(bot.business, "", lead);
          }
        }
      }
    }

    const brain = await resolveBrain();
    if (!brain) {
      return json({ reply: bot ? "I'm not fully switched on yet — please try again in a moment." : "My AI brain isn't switched on quite yet! Drop your email in the form below and the MascotChatbot team will get you set up. ⚡" });
    }
    const system = bot ? botSystemPrompt(bot) : (persona === "brand" ? BRAND_SYSTEM : SYSTEM);

    // Streaming branch: emit the reply token-by-token as plain text so the client can
    // start speaking the first sentence while the rest is still being generated.
    if (wantStream) {
      const enc = new TextEncoder();
      const rs = new ReadableStream({
        async start(controller) {
          try {
            if (brain.provider === "openai") {
              const rr = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: "Bearer " + brain.key },
                body: JSON.stringify({ model: "gpt-4o-mini", messages: [{ role: "system", content: system }, ...trimmed], max_tokens: 120, temperature: 0.7, stream: true }),
              });
              if (!rr.ok || !rr.body) { controller.enqueue(enc.encode("Ask me that again?")); controller.close(); return; }
              const reader = rr.body.getReader();
              const dec = new TextDecoder();
              let buf = "";
              for (;;) {
                const { done, value } = await reader.read();
                if (done) break;
                buf += dec.decode(value, { stream: true });
                let nl;
                while ((nl = buf.indexOf("\n")) >= 0) {
                  const line = buf.slice(0, nl).trim();
                  buf = buf.slice(nl + 1);
                  if (!line.startsWith("data:")) continue;
                  const d = line.slice(5).trim();
                  if (!d || d === "[DONE]") continue;
                  try {
                    const j = JSON.parse(d);
                    const piece = j && j.choices && j.choices[0] && j.choices[0].delta && j.choices[0].delta.content;
                    if (piece) controller.enqueue(enc.encode(piece));
                  } catch {}
                }
              }
            } else {
              const rr = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-api-key": brain.key, "anthropic-version": "2023-06-01" },
                body: JSON.stringify({ model: "claude-3-5-haiku-latest", max_tokens: 130, system, messages: trimmed }),
              });
              const j = await rr.json();
              const reply = (j && j.content && j.content[0] && String(j.content[0].text || "").trim()) || "Ask me that again?";
              controller.enqueue(enc.encode(reply));
            }
          } catch {
            controller.enqueue(enc.encode("Oops, I glitched for a second — try that again?"));
          }
          controller.close();
        },
      });
      return new Response(rs, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", ...CORS } });
    }

    if (brain.provider === "anthropic") {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": brain.key, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: "claude-3-5-haiku-latest", max_tokens: 130, system, messages: trimmed }),
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
        messages: [{ role: "system", content: system }, ...trimmed],
        max_tokens: 120,
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
