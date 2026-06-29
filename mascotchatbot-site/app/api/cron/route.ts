// Scheduled jobs (hit daily by Vercel Cron): needs-attention alerts, a weekly
// fleet digest, and trial-lifecycle email sequences. Safe to call manually as an
// admin. Each notification is de-duplicated in KV so it won't spam.
import { kvList, kvGet, kvSet, getSecret } from "@/lib/vault";
import { getSessionEmail, getRole, canManage } from "@/lib/auth";
import { sendEmail, sendSlack, alertEmail, wrap } from "@/lib/notify";

export const runtime = "edge";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
}

const N = (v: unknown) => Number(v || 0);
const DAY = 86400000;

async function authed(req: Request): Promise<boolean> {
  const url = new URL(req.url);
  const key = url.searchParams.get("key") || "";
  const bearer = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const secret = await getSecret("CRON_SECRET");
  if (secret && (key === secret || bearer === secret)) return true;
  // Allow a signed-in admin to trigger it manually.
  const email = await getSessionEmail(req);
  const role = await getRole(email);
  return !!(role && canManage(role));
}

async function sum7(id: string, days: string[]): Promise<number> {
  const vals = await Promise.all(days.map((d) => kvGet("stat:" + id + ":msgs:" + d)));
  return vals.reduce((s, v) => s + N(v), 0);
}

export async function GET(req: Request) {
  if (!(await authed(req))) return json({ ok: false, error: "Forbidden" }, 403);

  const url = new URL(req.url);
  const force = url.searchParams.get("mode") || "";
  const now = Date.now();
  const days7: string[] = [];
  for (let i = 6; i >= 0; i--) days7.push(new Date(now - i * DAY).toISOString().slice(0, 10));

  const to = await alertEmail();
  const botKeys = await kvList("bot:");

  // ---- 1) Needs-attention alerts (deduped: re-alert at most every 6 days per flag) ----
  const fresh: string[] = [];
  let totalMsgs7 = 0, totalLeads = 0, deployments = 0, installed = 0;
  const movers: { name: string; msgs: number }[] = [];

  for (let i = 0; i < botKeys.length; i++) {
    const v = await kvGet(botKeys[i]);
    if (!v) continue;
    let bot: Record<string, unknown>;
    try { bot = JSON.parse(v); } catch { continue; }
    const id = String(bot.id || botKeys[i].replace(/^bot:/, ""));
    deployments++;
    if (bot.installed) installed++;
    const name = String(bot.business || id);

    const [msgsTot, errs, leadKeys] = await Promise.all([
      kvGet("stat:" + id + ":msgs"), kvGet("stat:" + id + ":errs"), kvList("lead:" + id + ":"),
    ]);
    const m = N(msgsTot), leads = leadKeys.length, errRate = m > 0 ? (N(errs) / m) * 100 : 0;
    const m7 = await sum7(id, days7);
    totalMsgs7 += m7; totalLeads += leads;
    movers.push({ name, msgs: m7 });

    const flags: string[] = [];
    if (!bot.installed) flags.push("not installed");
    if (errRate >= 5 && m >= 10) flags.push("high error rate (" + errRate.toFixed(0) + "%)");
    if (bot.plan === "trial" && bot.trialEnds && new Date(String(bot.trialEnds)).getTime() < now + 3 * DAY) flags.push("trial ending soon");
    if (m > 0 && leads === 0) flags.push("no leads yet");

    for (const f of flags) {
      const slug = f.replace(/[^a-z]/gi, "").slice(0, 24);
      const k = "alert:" + id + ":" + slug;
      const last = N(await kvGet(k));
      if (now - last > 6 * DAY) {
        fresh.push("• " + name + " — " + f);
        await kvSet(k, String(now));
      }
    }
  }

  let alertsSent = false;
  if (fresh.length && to) {
    const html = wrap("⚠️ " + fresh.length + " mascot" + (fresh.length === 1 ? "" : "s") + " need attention", "<p>" + fresh.join("<br>") + "</p>");
    alertsSent = await sendEmail(to, "MascotChatbot — " + fresh.length + " need attention", html);
    await sendSlack("⚠️ MascotChatbot fleet: " + fresh.length + " need attention\n" + fresh.join("\n"));
  }

  // ---- 2) Weekly digest (Mondays UTC, or mode=digest) ----
  let digestSent = false;
  const isMonday = new Date(now).getUTCDay() === 1;
  if ((isMonday || force === "digest") && to) {
    movers.sort((a, b) => b.msgs - a.msgs);
    const top = movers.slice(0, 5).filter((x) => x.msgs > 0);
    const topHtml = top.length ? top.map((t) => "• " + t.name + " — " + t.msgs + " messages").join("<br>") : "No activity in the last 7 days.";
    const html = wrap("📊 Your weekly fleet digest", (
      "<p><b>" + deployments + "</b> deployments · <b>" + installed + "</b> installed<br>" +
      "<b>" + totalMsgs7 + "</b> messages this week · <b>" + totalLeads + "</b> total leads</p>" +
      "<p style=\"font-weight:600;margin:14px 0 4px\">Top movers</p><p>" + topHtml + "</p>"
    ));
    digestSent = await sendEmail(to, "MascotChatbot — your weekly digest", html);
  }

  // ---- 3) Trial-lifecycle email sequences (deduped per user) ----
  let seqSent = 0;
  for (let i = 0; i < botKeys.length; i++) {
    const v = await kvGet(botKeys[i]);
    if (!v) continue;
    let bot: Record<string, unknown>;
    try { bot = JSON.parse(v); } catch { continue; }
    if (bot.plan !== "trial" || !bot.trialEnds) continue;
    const owner = String(bot.owner || "");
    if (!owner) continue;
    const ends = new Date(String(bot.trialEnds)).getTime();
    const left = ends - now;
    const acct = "https://www.mascotchatbot.com/account";
    if (left > 0 && left <= 2 * DAY) {
      const k = "seq:" + owner + ":expiring";
      if (!(await kvGet(k))) {
        const ok = await sendEmail(owner, "Your MascotChatbot trial ends soon", wrap("Your trial ends in under 2 days", "<p>Keep your mascot live and capturing leads — upgrade anytime from your dashboard.</p><p><a href=\"" + acct + "\" style=\"display:inline-block;background:#0A0A0A;color:#fff;text-decoration:none;padding:11px 20px;border-radius:10px;font-weight:600\">Keep my mascot live →</a></p>"));
        if (ok) { await kvSet(k, String(now)); seqSent++; }
      }
    } else if (left <= 0) {
      const k = "seq:" + owner + ":expired";
      if (!(await kvGet(k))) {
        const ok = await sendEmail(owner, "Your MascotChatbot trial has ended", wrap("Your free trial has ended", "<p>Reactivate to bring your mascot back online and keep converting visitors into booked leads.</p><p><a href=\"" + acct + "\" style=\"display:inline-block;background:#0A0A0A;color:#fff;text-decoration:none;padding:11px 20px;border-radius:10px;font-weight:600\">Reactivate →</a></p>"));
        if (ok) { await kvSet(k, String(now)); seqSent++; }
      }
    }
  }

  return json({ ok: true, alertsSent, digestSent, freshAlerts: fresh.length, seqSent, hasRecipient: !!to });
}
