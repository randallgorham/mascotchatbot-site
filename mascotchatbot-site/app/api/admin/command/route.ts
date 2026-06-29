// Owner/admin command center: one aggregate GET for the whole business, and a
// POST for operational controls (plan changes, trials, payouts, resend, drill-down).
import { kvList, kvGet, kvReady, getSecret } from "@/lib/vault";
import { getSessionEmail, getRole, canManage, getUser } from "@/lib/auth";
import { getBot, saveBot } from "@/lib/botcfg";
import { effectiveSkillIds, BASE_SKILLS, normTier } from "@/lib/skills";
import { listLeads } from "@/lib/leads";
import { payouts, markPayoutSettled } from "@/lib/referrals";

export const runtime = "edge";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
}

function dayKeys(n: number): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) out.push(new Date(Date.now() - i * 86400000).toISOString().slice(0, 10));
  return out;
}

type Order = { id?: string; email?: string; amount?: number; status?: string; createdAt?: string };

async function guard(req: Request): Promise<string | null> {
  const email = await getSessionEmail(req);
  const role = await getRole(email);
  if (!role || !canManage(role)) return null;
  return email;
}

export async function GET(req: Request) {
  if (!(await guard(req))) return json({ ok: false, error: "Forbidden" }, 403);
  if (!kvReady()) return json({ ok: false, error: "Database not connected." }, 400);

  const days = dayKeys(14);
  const idx: Record<string, number> = {};
  days.forEach((d, i) => (idx[d] = i));

  // ---- Orders → revenue (total, per-customer, daily series) ----
  const orderKeys = await kvList("order:");
  const revenueByOwner: Record<string, number> = {};
  const revSeries = new Array(14).fill(0);
  let revenue = 0;
  let paidOrders = 0;
  for (let i = 0; i < orderKeys.length; i++) {
    const v = await kvGet(orderKeys[i]);
    if (!v) continue;
    let o: Order;
    try { o = JSON.parse(v) as Order; } catch { continue; }
    const amt = Number(o.amount || 0);
    if (o.status === "paid" || amt > 0) {
      revenue += amt;
      paidOrders++;
      const ow = String(o.email || "").toLowerCase();
      if (ow) revenueByOwner[ow] = (revenueByOwner[ow] || 0) + amt;
      const d = String(o.createdAt || "").slice(0, 10);
      if (d in idx) revSeries[idx[d]] += amt;
    }
  }

  // ---- Users → signups (total + daily series) ----
  const userKeys = await kvList("user:");
  const signupSeries = new Array(14).fill(0);
  for (let i = 0; i < userKeys.length; i++) {
    const v = await kvGet(userKeys[i]);
    if (!v) continue;
    try {
      const u = JSON.parse(v) as { createdAt?: string };
      const d = String(u.createdAt || "").slice(0, 10);
      if (d in idx) signupSeries[idx[d]] += 1;
    } catch { /* skip */ }
  }

  // ---- Bots → customers, plan split, usage, leads (+ daily convo/lead series) ----
  const botKeys = await kvList("bot:");
  const convoSeries = new Array(14).fill(0);
  const leadSeries = new Array(14).fill(0);
  const planCount: Record<string, number> = {};
  let totalLeads = 0, totalConvos = 0, totalMessages = 0;
  const customers: Array<Record<string, unknown>> = [];

  for (let i = 0; i < botKeys.length; i++) {
    const v = await kvGet(botKeys[i]);
    if (!v) continue;
    let bot: { id?: string; business?: string; owner?: string; industry?: string; plan?: string; trialEnds?: string; updatedAt?: string };
    try { bot = JSON.parse(v); } catch { continue; }
    const id = bot.id || botKeys[i].replace(/^bot:/, "");
    const owner = String(bot.owner || "").toLowerCase();
    const plan = bot.plan || "starter";
    planCount[plan] = (planCount[plan] || 0) + 1;

    const [msgs, convos, leadKeys, dailyConvos] = await Promise.all([
      kvGet("stat:" + id + ":msgs"),
      kvGet("stat:" + id + ":convos"),
      kvList("lead:" + id + ":"),
      Promise.all(days.map((d) => kvGet("stat:" + id + ":convos:" + d))),
    ]);
    const m = Number(msgs || 0), c = Number(convos || 0), l = leadKeys.length;
    totalMessages += m; totalConvos += c; totalLeads += l;
    dailyConvos.forEach((cv, di) => (convoSeries[di] += Number(cv || 0)));

    // bucket leads by day (read each — small scale)
    for (let k = 0; k < leadKeys.length; k++) {
      const lv = await kvGet(leadKeys[k]);
      if (!lv) continue;
      try {
        const ld = JSON.parse(lv) as { at?: string };
        const d = String(ld.at || "").slice(0, 10);
        if (d in idx) leadSeries[idx[d]] += 1;
      } catch { /* skip */ }
    }

    const referrerRaw = owner ? await kvGet("referral:" + owner) : null;
    let referrer = "";
    if (referrerRaw) { try { referrer = String((JSON.parse(referrerRaw) as { referrer?: string }).referrer || ""); } catch { /* */ } }

    customers.push({
      id, business: bot.business || "", owner, industry: bot.industry || "",
      plan, trialEnds: bot.trialEnds || "", messages: m, convos: c, leads: l,
      revenue: Math.round((revenueByOwner[owner] || 0) * 100) / 100,
      referrer, updatedAt: bot.updatedAt || "",
    });
  }
  customers.sort((a, b) => (String(a.updatedAt) < String(b.updatedAt) ? 1 : -1));

  const pay = await payouts();

  // A/B: pricing billing-default experiment counters.
  const [mv, mc, av, ac] = await Promise.all([
    kvGet("stat:ab:billing:monthly:views"),
    kvGet("stat:ab:billing:monthly:carts"),
    kvGet("stat:ab:billing:annual:views"),
    kvGet("stat:ab:billing:annual:carts"),
  ]);
  const ab = {
    monthly: { views: Number(mv || 0), carts: Number(mc || 0) },
    annual: { views: Number(av || 0), carts: Number(ac || 0) },
  };

  const kpis = {
    customers: customers.length,
    active: planCount["active"] || 0,
    trial: planCount["trial"] || 0,
    demo: planCount["demo"] || 0,
    disabled: planCount["disabled"] || 0,
    signups: userKeys.length,
    leads: totalLeads,
    convos: totalConvos,
    messages: totalMessages,
    revenue: Math.round(revenue * 100) / 100,
    orders: paidOrders,
    affiliateOwed: pay.totalOwed,
    affiliateConversions: pay.totalConversions,
  };

  const series = days.map((d, i) => ({ day: d, signups: signupSeries[i], revenue: Math.round(revSeries[i] * 100) / 100, convos: convoSeries[i], leads: leadSeries[i] }));

  const funnel = {
    signups: userKeys.length,
    demos: planCount["demo"] || 0,
    trials: planCount["trial"] || 0,
    paid: (planCount["active"] || 0),
  };

  return json({ ok: true, kpis, series, funnel, customers, planCount, payouts: pay, ab });
}

export async function POST(req: Request) {
  if (!(await guard(req))) return json({ ok: false, error: "Forbidden" }, 403);
  if (!kvReady()) return json({ ok: false, error: "Database not connected." }, 400);

  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const action = String(body.action || "");
  const botId = String(body.botId || "");
  const email = String(body.email || "").toLowerCase();

  // Drill-down: everything about one customer.
  if (action === "customer") {
    const bot = botId ? await getBot(botId) : null;
    if (!bot) return json({ ok: false, error: "Customer not found." }, 404);
    const owner = String(bot.owner || "").toLowerCase();
    const leads = await listLeads(bot.id, 200);
    const user = owner ? await getUser(owner) : null;
    // orders for this owner
    const orderKeys = await kvList("order:");
    const orders: Order[] = [];
    for (let i = 0; i < orderKeys.length; i++) {
      const v = await kvGet(orderKeys[i]);
      if (!v) continue;
      try { const o = JSON.parse(v) as Order; if (String(o.email || "").toLowerCase() === owner) orders.push(o); } catch { /* */ }
    }
    orders.sort((a, b) => (String(a.createdAt) < String(b.createdAt) ? 1 : -1));
    const refRaw = owner ? await kvGet("referral:" + owner) : null;
    let referral: unknown = null;
    if (refRaw) { try { referral = JSON.parse(refRaw); } catch { /* */ } }
    const revenue = orders.reduce((s, o) => s + Number(o.amount || 0), 0);
    return json({ ok: true, bot, user, leads, orders, referral, revenue: Math.round(revenue * 100) / 100 });
  }

  if (action === "setTier") {
    const bot = await getBot(botId);
    if (!bot) return json({ ok: false, error: "Not found." }, 404);
    bot.tier = normTier(String(body.tier || ""));
    // re-cap existing skill selection to the new tier's allowance
    const baseIds = new Set(BASE_SKILLS.map((s) => s.id));
    bot.skills = effectiveSkillIds(bot.tier, bot.skills || []).filter((id) => !baseIds.has(id));
    await saveBot(bot);
    return json({ ok: true, bot });
  }

  if (action === "setSkills") {
    const bot = await getBot(botId);
    if (!bot) return json({ ok: false, error: "Not found." }, 404);
    const picked = Array.isArray(body.skills) ? (body.skills as unknown[]).filter((x): x is string => typeof x === "string") : [];
    const baseIds = new Set(BASE_SKILLS.map((s) => s.id));
    bot.skills = effectiveSkillIds(bot.tier, picked).filter((id) => !baseIds.has(id));
    await saveBot(bot);
    return json({ ok: true, bot });
  }

  if (action === "setPlan") {
    const bot = await getBot(botId);
    if (!bot) return json({ ok: false, error: "Not found." }, 404);
    const plan = String(body.plan || "").trim();
    if (!plan) return json({ ok: false, error: "Missing plan." }, 400);
    bot.plan = plan;
    if (plan !== "trial") bot.trialEnds = undefined;
    await saveBot(bot);
    return json({ ok: true, bot });
  }

  if (action === "endTrial") {
    const bot = await getBot(botId);
    if (!bot) return json({ ok: false, error: "Not found." }, 404);
    bot.plan = "active";
    bot.trialEnds = undefined;
    await saveBot(bot);
    return json({ ok: true, bot });
  }

  if (action === "extendTrial") {
    const bot = await getBot(botId);
    if (!bot) return json({ ok: false, error: "Not found." }, 404);
    const days = Math.max(1, Math.min(90, Number(body.days || 14)));
    const base = bot.trialEnds && new Date(bot.trialEnds).getTime() > Date.now() ? new Date(bot.trialEnds).getTime() : Date.now();
    bot.plan = "trial";
    bot.trialEnds = new Date(base + days * 86400000).toISOString();
    await saveBot(bot);
    return json({ ok: true, bot });
  }

  if (action === "markPayoutPaid") {
    const ref = String(body.referrer || "").toLowerCase();
    if (!ref) return json({ ok: false, error: "Missing referrer." }, 400);
    const n = await markPayoutSettled(ref);
    return json({ ok: true, settled: n });
  }

  if (action === "resendWelcome") {
    const to = email;
    if (!to) return json({ ok: false, error: "Missing email." }, 400);
    try {
      const key = await getSecret("RESEND_API_KEY");
      if (!key) return json({ ok: false, error: "Email not configured." }, 400);
      const origin = new URL(req.url).origin;
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "MascotChatbot <onboarding@resend.dev>",
          to: [to],
          subject: "Your MascotChatbot account — finish setting up your mascot",
          html:
            `<div style="font-family:system-ui,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a">` +
            `<h2 style="margin:0 0 10px">Let's get your mascot live 🎉</h2>` +
            `<p style="margin:0 0 12px">Sign in to finish onboarding — name your business, pick your mascot, and grab your embed code:</p>` +
            `<p style="margin:0 0 16px"><a href="${origin}/account" style="display:inline-block;background:#0A0A0A;color:#fff;text-decoration:none;padding:11px 20px;border-radius:10px;font-weight:600">Set up my mascot →</a></p>` +
            `<p style="margin:0;color:#888;font-size:12px">— MascotChatbot</p></div>`,
        }),
      });
      return json({ ok: true });
    } catch {
      return json({ ok: false, error: "Send failed." }, 500);
    }
  }

  return json({ ok: false, error: "Unknown action." }, 400);
}
