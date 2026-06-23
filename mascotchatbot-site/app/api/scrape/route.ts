// Auto-fill: fetch the owner's website, extract readable text, and (if an AI key
// is present) distill it into concise bot facts. Used by the onboarding wizard.
import { getSecret } from "@/lib/vault";

export const runtime = "edge";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
}

function clean(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    let url = String((body && body.url) || "").trim();
    if (!url) return json({ ok: false, error: "Enter your website URL." }, 400);
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;
    let parsed: URL;
    try { parsed = new URL(url); } catch { return json({ ok: false, error: "That doesn't look like a valid URL." }, 400); }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return json({ ok: false, error: "Only http(s) URLs are supported." }, 400);

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12000);
    let html = "";
    try {
      const r = await fetch(parsed.toString(), { headers: { "User-Agent": "MascotChatbot-Setup/1.0" }, signal: ctrl.signal });
      if (!r.ok) return json({ ok: false, error: `Couldn't reach that site (status ${r.status}).` }, 400);
      html = await r.text();
    } catch {
      return json({ ok: false, error: "Couldn't load that site — check the URL and try again." }, 400);
    } finally {
      clearTimeout(timer);
    }

    const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "";
    const text = clean(html).slice(0, 6000);
    if (text.length < 40) return json({ ok: false, error: "That page didn't have enough readable text to learn from." }, 400);

    const key = await getSecret("OPENAI_API_KEY");
    if (key) {
      try {
        const r = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: "Bearer " + key },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: "You turn a business's website text into a concise fact sheet for their chatbot. Output plain text only (no markdown). Use short labeled lines covering, when available: what the business does, services offered, service area, hours, pricing notes, and 2-4 common questions with answers. Keep it under 200 words. Only use facts present in the text; do not invent specifics." },
              { role: "user", content: `Business: ${clean(title)}\n\nWebsite text:\n${text}` },
            ],
            max_tokens: 380,
            temperature: 0.2,
          }),
        });
        const j = await r.json();
        const facts = j && j.choices && j.choices[0] && j.choices[0].message && String(j.choices[0].message.content || "").trim();
        if (facts) return json({ ok: true, facts, source: parsed.toString(), ai: true });
      } catch {
        /* fall through to raw text */
      }
    }
    // No AI key (or AI failed): return cleaned raw text the owner can trim.
    return json({ ok: true, facts: text.slice(0, 1500), source: parsed.toString(), ai: false });
  } catch {
    return json({ ok: false, error: "Something went wrong fetching that site." }, 500);
  }
}
