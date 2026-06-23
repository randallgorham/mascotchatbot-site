import { getUser, saveUser, hashPassword, makeSessionToken, sessionCookie, clearSessionCookie, getSessionEmail } from "@/lib/auth";
import { kvReady, kvGet } from "@/lib/vault";
import { getOrCreateBot, saveBot, BotConfig, getBot, ownsBot, listBotsFor, createBotFor } from "@/lib/botcfg";
import { listLeads } from "@/lib/leads";
import { recordReferral, summaryFor } from "@/lib/referrals";

// Resolve which bot an action targets: a specific owned bot via body.botId
// (so an agency can manage many client bots), else the account's primary bot.
async function resolveBot(em: string, body: Record<string, unknown>, name?: string): Promise<BotConfig> {
  const id = typeof body.botId === "string" ? body.botId : "";
  if (id && (await ownsBot(em, id))) {
    const b = await getBot(id);
    if (b) return b;
  }
  return getOrCreateBot(em, name);
}

function readCookie(req: Request, name: string): string {
  const raw = req.headers.get("cookie") || "";
  const m = raw.match(new RegExp("(?:^|;\\s*)" + name + "=([^;]+)"));
  return m ? decodeURIComponent(m[1]) : "";
}

export const runtime = "edge";

function json(data: unknown, status = 200, cookie?: string) {
  const res = new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
  if (cookie) res.headers.append("Set-Cookie", cookie);
  return res;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as Record<string, string>));
  const action = String(body.action || "");

  if (action === "logout") return json({ ok: true }, 200, clearSessionCookie);

  if (action === "me") {
    const email = await getSessionEmail(req);
    if (!email) return json({ user: null });
    const u = await getUser(email);
    return json({ user: u ? { email: u.email, name: u.name } : { email, name: email.split("@")[0] } });
  }

  if (action === "getBot") {
    const em = await getSessionEmail(req);
    if (!em) return json({ ok: false, error: "Please sign in." }, 401);
    if (!kvReady()) return json({ ok: false, error: "Database not connected." }, 400);
    const u = await getUser(em);
    const bot = await resolveBot(em, body as Record<string, unknown>, u?.name);
    return json({ ok: true, bot });
  }

  if (action === "listBots") {
    const em = await getSessionEmail(req);
    if (!em) return json({ ok: false, error: "Please sign in." }, 401);
    if (!kvReady()) return json({ ok: false, error: "Database not connected." }, 400);
    const bots = await listBotsFor(em);
    const list = await Promise.all(
      bots.map(async (b) => ({
        id: b.id,
        business: b.business,
        industry: b.industry,
        plan: b.plan,
        badge: b.badge,
        image: b.image,
        leads: (await listLeads(b.id, 1000)).length,
      }))
    );
    return json({ ok: true, bots: list });
  }

  if (action === "createBot") {
    const em = await getSessionEmail(req);
    if (!em) return json({ ok: false, error: "Please sign in." }, 401);
    if (!kvReady()) return json({ ok: false, error: "Database not connected." }, 400);
    const business = String((body as Record<string, unknown>).business || "").trim().slice(0, 120) || "New client";
    const industry = String((body as Record<string, unknown>).industry || "").trim().slice(0, 80);
    const bot = await createBotFor(em, business, industry);
    return json({ ok: true, bot });
  }

  if (action === "leads") {
    const em = await getSessionEmail(req);
    if (!em) return json({ ok: false, error: "Please sign in." }, 401);
    if (!kvReady()) return json({ ok: false, error: "Database not connected." }, 400);
    const u = await getUser(em);
    const bot = await resolveBot(em, body as Record<string, unknown>, u?.name);
    const leads = await listLeads(bot.id, 100);
    return json({ ok: true, leads });
  }

  if (action === "stats") {
    const em = await getSessionEmail(req);
    if (!em) return json({ ok: false, error: "Please sign in." }, 401);
    if (!kvReady()) return json({ ok: false, error: "Database not connected." }, 400);
    const u = await getUser(em);
    const bot = await resolveBot(em, body as Record<string, unknown>, u?.name);
    const [msgs, convos] = await Promise.all([kvGet("stat:" + bot.id + ":msgs"), kvGet("stat:" + bot.id + ":convos")]);
    const leads = await listLeads(bot.id, 1000);
    // 14-day trend: conversations per day (from daily counters) + leads per day (bucketed from lead timestamps).
    const days: string[] = [];
    for (let i = 13; i >= 0; i--) days.push(new Date(Date.now() - i * 86400000).toISOString().slice(0, 10));
    const leadsByDay: Record<string, number> = {};
    for (let i = 0; i < leads.length; i++) {
      const d = String(leads[i].at || "").slice(0, 10);
      if (d) leadsByDay[d] = (leadsByDay[d] || 0) + 1;
    }
    const convoCounts = await Promise.all(days.map((d) => kvGet("stat:" + bot.id + ":convos:" + d)));
    const series = days.map((d, i) => ({ day: d, convos: Number(convoCounts[i] || 0), leads: leadsByDay[d] || 0 }));
    return json({ ok: true, stats: { messages: Number(msgs || 0), convos: Number(convos || 0), leads: leads.length }, series });
  }

  if (action === "referrals") {
    const em = await getSessionEmail(req);
    if (!em) return json({ ok: false, error: "Please sign in." }, 401);
    if (!kvReady()) return json({ ok: false, error: "Database not connected." }, 400);
    const sum = await summaryFor(em);
    return json({ ok: true, ...sum });
  }

  if (action === "saveBot") {
    const em = await getSessionEmail(req);
    if (!em) return json({ ok: false, error: "Please sign in." }, 401);
    if (!kvReady()) return json({ ok: false, error: "Database not connected." }, 400);
    const u = await getUser(em);
    const cur = await resolveBot(em, body as Record<string, unknown>, u?.name);
    const b = ((body as Record<string, unknown>).bot || {}) as Partial<BotConfig>;
    const str = (v: unknown, d: string, n: number) => (typeof v === "string" ? v : d).slice(0, n);
    const bool = (v: unknown, d: boolean) => (typeof v === "boolean" ? v : d);
    const next: BotConfig = {
      ...cur,
      business: str(b.business, cur.business, 120),
      industry: str(b.industry, cur.industry, 80),
      about: str(b.about, cur.about, 1500),
      facts: str(b.facts, cur.facts, 4000),
      notes: str(b.notes, cur.notes, 2000),
      cta: str(b.cta, cur.cta, 120),
      ctaUrl: str(b.ctaUrl, cur.ctaUrl, 300),
      greet: bool(b.greet, cur.greet),
      wave: bool(b.wave, cur.wave),
      wink: bool(b.wink, cur.wink),
      voice: str(b.voice, cur.voice, 40),
      accent: str(b.accent, cur.accent, 16),
      image: str(b.image, cur.image, 500),
    };
    await saveBot(next);
    return json({ ok: true, bot: next });
  }

  if (!kvReady()) return json({ ok: false, error: "Accounts aren't enabled yet — the database isn't connected." }, 400);

  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (action === "signup") {
    if (!email || !password || password.length < 6) return json({ ok: false, error: "Enter an email and a password of 6+ characters." }, 400);
    if (await getUser(email)) return json({ ok: false, error: "An account with that email already exists — try logging in." }, 400);
    const { salt, hash } = await hashPassword(password);
    const name = String(body.name || "").trim() || email.split("@")[0];
    await saveUser({ email, name, salt, hash, createdAt: new Date().toISOString() });
    const ref = readCookie(req, "mcb_ref");
    if (ref) { try { await recordReferral(email, ref); } catch { /* best effort */ } }
    return json({ ok: true, user: { email, name } }, 200, sessionCookie(await makeSessionToken(email)));
  }

  if (action === "login") {
    const u = await getUser(email);
    if (!u || !u.salt || !u.hash) return json({ ok: false, error: "No account found for that email, or it was created with Google sign-in." }, 400);
    const { hash } = await hashPassword(password, u.salt);
    if (hash !== u.hash) return json({ ok: false, error: "Incorrect email or password." }, 401);
    return json({ ok: true, user: { email: u.email, name: u.name } }, 200, sessionCookie(await makeSessionToken(email)));
  }

  return json({ ok: false, error: "Unknown action." }, 400);
}
