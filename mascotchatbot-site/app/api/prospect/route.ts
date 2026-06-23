// Prospect demo generator (team tool): given a local business + URL, scrape the
// site, spin up a live mascot bot pre-trained as that business, and return a
// shareable /demo?b=<id> link for cold outreach. Reuses the chat + scrape infra.
import { kvReady } from "@/lib/vault";
import { getSessionEmail } from "@/lib/auth";
import { saveBot, BotConfig } from "@/lib/botcfg";

export const runtime = "edge";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
}

function rid(): string {
  const chars = "abcdefghijkmnpqrstuvwxyz23456789";
  const a = crypto.getRandomValues(new Uint8Array(12));
  let s = "";
  for (let i = 0; i < a.length; i++) s += chars[a[i] % chars.length];
  return s;
}

// Pick a sensible default mascot for a guessed industry.
const MAP: [RegExp, string][] = [
  [/electric/i, "dr-volt-1.png"],
  [/hvac|heating|cooling|air/i, "hvac.png"],
  [/plumb/i, "06-plumber-home-services-male.jpg"],
  [/dent/i, "04-dentist-male.jpg"],
  [/(real ?estate|realtor|broker)/i, "01-realtor-female-classic.jpg"],
  [/(med ?spa|spa|aesthetic|botox)/i, "15-medspa-female.jpg"],
  [/(law|attorney|legal)/i, "20-attorney-male.jpg"],
  [/(gym|fitness|trainer)/i, "18-gym-instructor-female-blonde.jpg"],
  [/(salon|hair|barber)/i, "hair.png"],
  [/nail/i, "nail.png"],
  [/(vet|animal|pet)/i, "vet.png"],
  [/(landscap|lawn|garden)/i, "landscaper.png"],
  [/(restaurant|cafe|food|chef|catering)/i, "chef.png"],
  [/(tattoo)/i, "tattoo.png"],
  [/(massage)/i, "massage.png"],
  [/(florist|flower)/i, "florist.png"],
  [/(therap|counsel|psych)/i, "therapist.png"],
  [/(contract|build|remodel|roof)/i, "09-contractor-male-cap-vest.jpg"],
  [/(mechanic|auto|car)/i, "19-mechanic-male.jpg"],
];
function defaultMascot(industry: string, business: string): string {
  const hay = (industry + " " + business).toLowerCase();
  for (let i = 0; i < MAP.length; i++) if (MAP[i][0].test(hay)) return "/mascots/" + MAP[i][1];
  return "/mascots/dr-volt-1.png";
}

export async function POST(req: Request) {
  const email = await getSessionEmail(req);
  if (!email) return json({ ok: false, error: "Please sign in to generate demos." }, 401);
  if (!kvReady()) return json({ ok: false, error: "Database not connected." }, 400);

  const body = await req.json().catch(() => ({}));
  const business = String((body && body.business) || "").trim().slice(0, 120);
  const url = String((body && body.url) || "").trim();
  const industry = String((body && body.industry) || "").trim().slice(0, 80);
  const mascot = String((body && body.mascot) || "").trim().slice(0, 200);
  if (!business) return json({ ok: false, error: "Enter the business name." }, 400);

  const origin = new URL(req.url).origin;

  // Best-effort: learn the business from their website via the existing scraper.
  let facts = "";
  if (url) {
    try {
      const r = await fetch(origin + "/api/scrape", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url }) });
      const d = await r.json();
      if (d && d.ok && d.facts) facts = String(d.facts).slice(0, 4000);
    } catch {
      /* scrape is best-effort */
    }
  }

  const id = "demo" + rid();
  const bot: BotConfig = {
    id,
    owner: email,
    business,
    industry,
    about: "",
    facts,
    notes: `This is a free demo mascot built for ${business}. Be warm, helpful, and impressive. If asked who built this or how to get it, explain it's a MascotChatbot demo — a custom talking mascot that answers 24/7 and books jobs — and invite them to book a quick call to get their own.`,
    cta: "book a quick call to get your own mascot",
    ctaUrl: "",
    greet: true,
    wave: true,
    wink: true,
    voice: "ash",
    accent: "#2bc4e6",
    image: mascot || defaultMascot(industry, business),
    plan: "demo",
    badge: true,
    updatedAt: new Date().toISOString(),
  };
  await saveBot(bot);

  return json({ ok: true, id, link: origin + "/demo?b=" + id });
}
