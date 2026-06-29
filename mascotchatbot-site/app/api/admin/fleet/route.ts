// Admin Fleet: full telemetry directory of every deployed mascot + a roll-up with
// "needs attention" flags, plus a per-mascot analytics drill-down.
import { kvList, kvGet, kvReady } from "@/lib/vault";
import { getSessionEmail, getRole, canManage } from "@/lib/auth";
import { getBot } from "@/lib/botcfg";
import { listLeads } from "@/lib/leads";

export const runtime = "edge";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
}

function dayKeys(n: number): string[] {
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) out.push(new Date(Date.now() - i * 86400000).toISOString().slice(0, 10));
  return out;
}

async function guard(req: Request): Promise<string | null> {
  const email = await getSessionEmail(req);
  const role = await getRole(email);
  if (!role || !canManage(role)) return null;
  return email;
}

const N = (v: unknown) => Number(v || 0);
function avg(sum: number, count: number) { return count > 0 ? Math.round(sum / count) : 0; }

// Pull the standard telemetry counters for one telemetry id (bot id / "brand" / "demo").
async function readStats(sid: string, days: string[]) {
  const [msgs, convos, rtsum, rtcount, ttftsum, ttftcount, ttssum, ttscount, ttsfb, errs, voice, text, sessions, dwell] =
    await Promise.all([
      kvGet("stat:" + sid + ":msgs"), kvGet("stat:" + sid + ":convos"),
      kvGet("stat:" + sid + ":rtsum"), kvGet("stat:" + sid + ":rtcount"),
      kvGet("stat:" + sid + ":ttftsum"), kvGet("stat:" + sid + ":ttftcount"),
      kvGet("stat:" + sid + ":ttssum"), kvGet("stat:" + sid + ":ttscount"),
      kvGet("stat:" + sid + ":ttsfallback"), kvGet("stat:" + sid + ":errs"),
      kvGet("stat:" + sid + ":voice"), kvGet("stat:" + sid + ":text"),
      kvGet("stat:" + sid + ":sessions"), kvGet("stat:" + sid + ":dwellsum"),
    ]);
  const dailyMsgs = await Promise.all(days.map((d) => kvGet("stat:" + sid + ":msgs:" + d)));
  const dailyConvos = await Promise.all(days.map((d) => kvGet("stat:" + sid + ":convos:" + d)));
  // last-active = most recent day bucket with any message
  let lastActive = "";
  for (let i = days.length - 1; i >= 0; i--) { if (N(dailyMsgs[i]) > 0) { lastActive = days[i]; break; } }
  const m = N(msgs), c = N(convos), s = N(sessions);
  return {
    msgs: m, convos: c,
    avgRtMs: avg(N(rtsum), N(rtcount)),
    avgTtftMs: avg(N(ttftsum), N(ttftcount)),
    avgTtsMs: avg(N(ttssum), N(ttscount)),
    ttsFallback: N(ttsfb),
    errs: N(errs),
    voice: N(voice), text: N(text),
    sessions: s,
    avgDwellSec: avg(N(dwell), s),
    msgsPerConvo: c > 0 ? Math.round((m / c) * 10) / 10 : 0,
    errRate: m > 0 ? Math.round((N(errs) / m) * 1000) / 10 : 0, // %
    lastActive,
    dailyMsgs: dailyMsgs.map(N),
    dailyConvos: dailyConvos.map(N),
  };
}

export async function GET(req: Request) {
  if (!(await guard(req))) return json({ ok: false, error: "Forbidden" }, 403);
  if (!kvReady()) return json({ ok: false, error: "Database not connected." }, 400);

  const days = dayKeys(14);
  const botKeys = await kvList("bot:");

  const directory: Array<Record<string, unknown>> = [];
  let totalMsgs = 0, totalConvos = 0, totalLeads = 0, totalSessions = 0;
  let rtWeightedSum = 0, rtWeightedCount = 0, totalErrs = 0;
  let installedCount = 0, voiceTotal = 0, textTotal = 0;

  for (let i = 0; i < botKeys.length; i++) {
    const v = await kvGet(botKeys[i]);
    if (!v) continue;
    let bot: Record<string, unknown>;
    try { bot = JSON.parse(v); } catch { continue; }
    const id = String(bot.id || botKeys[i].replace(/^bot:/, ""));
    const st = await readStats(id, days);
    const leadKeys = await kvList("lead:" + id + ":");
    const leads = leadKeys.length;

    totalMsgs += st.msgs; totalConvos += st.convos; totalLeads += leads; totalSessions += st.sessions;
    rtWeightedSum += st.avgRtMs * Math.max(1, st.msgs); rtWeightedCount += Math.max(1, st.msgs);
    totalErrs += st.errs; voiceTotal += st.voice; textTotal += st.text;
    if (bot.installed) installedCount++;

    // needs-attention flags
    const flags: string[] = [];
    if (!bot.installed) flags.push("not-installed");
    if (st.errRate >= 5 && st.msgs >= 10) flags.push("high-errors");
    if (st.avgRtMs >= 6000 && st.msgs >= 5) flags.push("slow");
    if (bot.plan === "trial" && bot.trialEnds && new Date(String(bot.trialEnds)).getTime() < Date.now() + 3 * 86400000) flags.push("trial-ending");
    if (st.msgs > 0 && leads === 0) flags.push("no-leads");
    if (st.lastActive && (Date.now() - new Date(st.lastActive).getTime()) > 7 * 86400000) flags.push("quiet");

    directory.push({
      kind: "customer",
      id, business: String(bot.business || ""), owner: String(bot.owner || ""),
      industry: String(bot.industry || ""), plan: String(bot.plan || "starter"),
      setup: String(bot.setup || ""), voiceId: String(bot.voice || ""),
      hasMascot: !!String(bot.image || ""),
      siteUrl: String(bot.siteUrl || ""), installed: !!bot.installed,
      goLive: String(bot.installedAt || bot.updatedAt || ""),
      updatedAt: String(bot.updatedAt || ""),
      leads, leadRate: st.convos > 0 ? Math.round((leads / st.convos) * 1000) / 10 : 0,
      flags,
      ...st,
    });
  }

  // First-party deployments: the homepage Robo ("brand") + the Mr Amp demo ("demo").
  for (const fp of [
    { id: "brand", business: "Robo — site mascot (mascotchatbot.com)", industry: "First-party" },
    { id: "demo", business: "Mr Amp — homepage demo", industry: "First-party" },
  ]) {
    const st = await readStats(fp.id, days);
    totalMsgs += st.msgs; totalConvos += st.convos; totalSessions += st.sessions;
    rtWeightedSum += st.avgRtMs * Math.max(1, st.msgs); rtWeightedCount += Math.max(1, st.msgs);
    totalErrs += st.errs; voiceTotal += st.voice; textTotal += st.text;
    const flags: string[] = [];
    if (st.errRate >= 5 && st.msgs >= 10) flags.push("high-errors");
    if (st.avgRtMs >= 6000 && st.msgs >= 5) flags.push("slow");
    directory.push({
      kind: "first-party", id: fp.id, business: fp.business, owner: "—",
      industry: fp.industry, plan: "—", setup: "", voiceId: "", hasMascot: true,
      siteUrl: fp.id === "brand" ? "https://www.mascotchatbot.com" : "https://www.mascotchatbot.com",
      installed: true, goLive: "", updatedAt: "", leads: 0, leadRate: 0,
      flags, ...st,
    });
  }

  directory.sort((a, b) => (N(b.msgs) - N(a.msgs)));

  const rollup = {
    deployments: botKeys.length,
    firstParty: 2,
    installed: installedCount,
    notInstalled: botKeys.length - installedCount,
    totalMsgs, totalConvos, totalLeads, totalSessions,
    avgRtMs: avg(rtWeightedSum, rtWeightedCount),
    totalErrs,
    errRate: totalMsgs > 0 ? Math.round((totalErrs / totalMsgs) * 1000) / 10 : 0,
    voiceShare: voiceTotal + textTotal > 0 ? Math.round((voiceTotal / (voiceTotal + textTotal)) * 1000) / 10 : 0,
    leadConversion: totalConvos > 0 ? Math.round((totalLeads / totalConvos) * 1000) / 10 : 0,
  };

  const attention = directory.filter((r) => Array.isArray(r.flags) && (r.flags as string[]).length > 0);

  return json({ ok: true, rollup, directory, attention, days });
}

export async function POST(req: Request) {
  if (!(await guard(req))) return json({ ok: false, error: "Forbidden" }, 403);
  if (!kvReady()) return json({ ok: false, error: "Database not connected." }, 400);
  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const action = String(body.action || "");
  const sid = String(body.id || "").replace(/[^a-z0-9_-]/gi, "").slice(0, 40);

  if (action === "mascot" && sid) {
    const days = dayKeys(14);
    const st = await readStats(sid, days);
    const isBot = sid !== "brand" && sid !== "demo";
    const bot = isBot ? await getBot(sid) : null;

    // busiest hours (UTC histogram 0..23)
    const hourRaw = await Promise.all(Array.from({ length: 24 }, (_, h) => kvGet("stat:" + sid + ":hr:" + h)));
    const hours = hourRaw.map((v) => N(v));

    // top questions from the rolling qlog
    const qraw = await kvGet("qlog:" + sid);
    let qarr: { q: string; at: number }[] = [];
    if (qraw) { try { const p = JSON.parse(qraw); if (Array.isArray(p)) qarr = p; } catch { /* */ } }
    const counts: Record<string, { q: string; n: number; last: number }> = {};
    for (const item of qarr) {
      const key = (item.q || "").toLowerCase().trim();
      if (!key) continue;
      if (!counts[key]) counts[key] = { q: item.q, n: 0, last: 0 };
      counts[key].n++; counts[key].last = Math.max(counts[key].last, item.at || 0);
    }
    const topQuestions = Object.values(counts).sort((a, b) => b.n - a.n).slice(0, 15);
    const recentQuestions = qarr.slice(-20).reverse();

    const leads = bot ? await listLeads(bot.id, 50) : [];

    return json({
      ok: true, id: sid, isBot, bot,
      stats: st, hours, topQuestions, recentQuestions,
      leads, days,
    });
  }

  return json({ ok: false, error: "Unknown action." }, 400);
}
