// Daily analytics digest — emails the owner a plain-English snapshot of the
// previous day's traffic pulled from Google Analytics 4 (Data API). Triggered by
// Vercel Cron each morning; also callable manually by an admin or with CRON_SECRET.
import { getSecret, getSetting } from "@/lib/vault";
import { getSessionEmail, getRole, canManage } from "@/lib/auth";
import { sendEmail, wrap } from "@/lib/notify";
import { batchRunReports, gaConfigured, type GaReport } from "@/lib/ga";

export const runtime = "edge";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
}

async function authed(req: Request): Promise<boolean> {
  const url = new URL(req.url);
  const key = url.searchParams.get("key") || "";
  const bearer = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const secret = await getSecret("CRON_SECRET");
  if (secret && (key === secret || bearer === secret)) return true;
  const email = await getSessionEmail(req);
  const role = await getRole(email);
  return !!(role && canManage(role));
}

// ---------- formatting helpers ----------
const esc = (s: string) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c] as string));
const n = (v: string) => Number(v || 0);
const int = (v: string | number) => Math.round(Number(v || 0)).toLocaleString("en-US");

function dur(secs: number): string {
  const s = Math.round(secs);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}m ${r}s` : `${r}s`;
}
function pct(frac: number): string {
  return (frac * 100).toFixed(1) + "%";
}
function delta(cur: number, prev: number): string {
  if (!prev && !cur) return "";
  if (!prev) return ` <span style="color:#16a34a">(new)</span>`;
  const d = ((cur - prev) / prev) * 100;
  const up = d >= 0;
  const col = up ? "#16a34a" : "#dc2626";
  const arrow = up ? "▲" : "▼";
  return ` <span style="color:${col};font-size:12px">${arrow} ${Math.abs(d).toFixed(0)}%</span>`;
}

function table(headers: string[], rows: string[][]): string {
  if (!rows.length) return `<p style="color:#888;margin:4px 0 14px">No data.</p>`;
  const th = headers
    .map((h, i) => `<th style="text-align:${i === 0 ? "left" : "right"};padding:6px 10px;border-bottom:2px solid #eee;font-size:12px;color:#666;text-transform:uppercase;letter-spacing:.03em">${esc(h)}</th>`)
    .join("");
  const tr = rows
    .map(
      (r) =>
        `<tr>` +
        r.map((c, i) => `<td style="text-align:${i === 0 ? "left" : "right"};padding:6px 10px;border-bottom:1px solid #f2f2f2">${c}</td>`).join("") +
        `</tr>`
    )
    .join("");
  return `<table style="border-collapse:collapse;width:100%;margin:2px 0 18px">${`<tr>${th}</tr>`}${tr}</table>`;
}
function section(title: string): string {
  return `<h3 style="margin:22px 0 6px;font-size:15px">${esc(title)}</h3>`;
}

// GA4 report request builders
function reqTotals() {
  return {
    dateRanges: [
      { startDate: "yesterday", endDate: "yesterday", name: "cur" },
      { startDate: "2daysAgo", endDate: "2daysAgo", name: "prev" },
    ],
    metrics: [
      { name: "sessions" },
      { name: "totalUsers" },
      { name: "newUsers" },
      { name: "screenPageViews" },
      { name: "averageSessionDuration" },
      { name: "engagementRate" },
    ],
  };
}
function reqDim(dimension: string, metrics: string[], limit = 10, order = metrics[0]) {
  return {
    dateRanges: [{ startDate: "yesterday", endDate: "yesterday" }],
    dimensions: [{ name: dimension }],
    metrics: metrics.map((m) => ({ name: m })),
    orderBys: [{ metric: { metricName: order }, desc: true }],
    limit,
  };
}
function reqFunnel() {
  return {
    dateRanges: [{ startDate: "yesterday", endDate: "yesterday" }],
    dimensions: [{ name: "pagePath" }],
    metrics: [{ name: "totalUsers" }, { name: "screenPageViews" }],
    dimensionFilter: {
      filter: {
        fieldName: "pagePath",
        inListFilter: { values: ["/", "/pricing", "/checkout", "/cart"], caseSensitive: false },
      },
    },
    limit: 20,
  };
}

function funnelUsers(rep: GaReport | undefined, path: string): number {
  if (!rep) return 0;
  const row = rep.rows.find((r) => (r.dims[0] || "").replace(/\/$/, "") === path.replace(/\/$/, ""));
  return row ? n(row.metrics[0]) : 0;
}

export async function GET(req: Request) {
  if (!(await authed(req))) return json({ ok: false, error: "Forbidden" }, 403);
  if (!gaConfigured()) {
    return json({ ok: false, error: "GA not configured. Set GA_SA_CLIENT_EMAIL, GA_SA_PRIVATE_KEY, GA_PROPERTY_ID." }, 400);
  }

  // Batch 1 (<=5 reports): totals, channels, top pages, landing pages, devices
  const batch1 = await batchRunReports([
    reqTotals(),
    reqDim("sessionDefaultChannelGroup", ["sessions", "totalUsers"], 10),
    reqDim("pagePath", ["screenPageViews", "activeUsers"], 10),
    reqDim("landingPagePlusQueryString", ["sessions", "bounceRate", "averageSessionDuration"], 8, "sessions"),
    reqDim("deviceCategory", ["activeUsers", "sessions"], 5),
  ]);
  // Batch 2: geography, funnel
  const batch2 = await batchRunReports([reqDim("country", ["activeUsers", "sessions"], 8), reqFunnel()]);

  if (!batch1 || !batch2) return json({ ok: false, error: "GA request failed (check property access / credentials)." }, 502);

  const [rTot, rChan, rPages, rLand, rDev] = batch1;
  const [rGeo, rFun] = batch2;

  // ---- headline numbers ----
  const curRow = rTot.rows[0]?.metrics || [];
  const prevRow = rTot.rows[1]?.metrics || [];
  const sessions = n(curRow[0]);
  const users = n(curRow[1]);
  const newUsers = n(curRow[2]);
  const views = n(curRow[3]);
  const avgDur = n(curRow[4]);
  const engRate = n(curRow[5]);
  const pSessions = n(prevRow[0]);
  const pUsers = n(prevRow[1]);

  const headline =
    `<table style="border-collapse:collapse;width:100%;margin:6px 0 6px">` +
    `<tr>` +
    [
      [`${int(users)}${delta(users, pUsers)}`, "Visitors"],
      [`${int(sessions)}${delta(sessions, pSessions)}`, "Sessions"],
      [`${int(newUsers)}`, "New visitors"],
      [`${int(views)}`, "Page views"],
      [`${dur(avgDur)}`, "Avg. time on site"],
      [`${pct(engRate)}`, "Engaged"],
    ]
      .map(
        ([big, label]) =>
          `<td style="width:16.6%;text-align:center;padding:10px 4px;border:1px solid #f0f0f0">` +
          `<div style="font-size:20px;font-weight:700">${big}</div>` +
          `<div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.03em">${label}</div></td>`
      )
      .join("") +
    `</tr></table>`;

  // ---- where they came from ----
  const chanRows = rChan.rows.map((r) => [esc(r.dims[0] || "(unknown)"), int(r.metrics[1]), int(r.metrics[0])]);
  const chanTbl = table(["Source / channel", "Visitors", "Sessions"], chanRows);

  // ---- most popular pages ----
  const pageRows = rPages.rows.map((r) => [esc(r.dims[0] || "/"), int(r.metrics[0]), int(r.metrics[1])]);
  const pageTbl = table(["Page", "Views", "Visitors"], pageRows);

  // ---- landing pages + bounce (immediate leaves) ----
  const landRows = rLand.rows.map((r) => [esc(r.dims[0] || "/"), int(r.metrics[0]), pct(n(r.metrics[1])), dur(n(r.metrics[2]))]);
  const landTbl = table(["Entered on", "Sessions", "Bounced", "Avg. time"], landRows);

  // ---- devices + geo ----
  const devRows = rDev.rows.map((r) => [esc(r.dims[0] || "—"), int(r.metrics[0])]);
  const geoRows = rGeo.rows.map((r) => [esc(r.dims[0] || "—"), int(r.metrics[0])]);
  const devGeo =
    `<table style="width:100%;border-collapse:collapse"><tr style="vertical-align:top">` +
    `<td style="width:50%;padding-right:8px">${section("Devices")}${table(["Device", "Visitors"], devRows)}</td>` +
    `<td style="width:50%;padding-left:8px">${section("Top countries")}${table(["Country", "Visitors"], geoRows)}</td>` +
    `</tr></table>`;

  // ---- funnel: home -> pricing -> checkout ----
  const uHome = funnelUsers(rFun, "/") || users;
  const uPricing = funnelUsers(rFun, "/pricing");
  const uCheckout = funnelUsers(rFun, "/checkout") + funnelUsers(rFun, "/cart");
  const step = (label: string, val: number, base: number) => {
    const share = base ? Math.round((val / base) * 100) : 0;
    return (
      `<tr><td style="padding:6px 10px;border-bottom:1px solid #f2f2f2">${label}</td>` +
      `<td style="text-align:right;padding:6px 10px;border-bottom:1px solid #f2f2f2">${int(val)}</td>` +
      `<td style="text-align:right;padding:6px 10px;border-bottom:1px solid #f2f2f2;color:#888">${share}% of visitors</td></tr>`
    );
  };
  const dropPricing = uHome ? Math.round((1 - uPricing / uHome) * 100) : 0;
  const dropCheckout = uPricing ? Math.round((1 - uCheckout / uPricing) * 100) : 0;
  const funnelTbl =
    `<table style="border-collapse:collapse;width:100%;margin:2px 0 8px">` +
    step("Visited the site", uHome, uHome) +
    step("Reached pricing", uPricing, uHome) +
    step("Reached checkout / cart", uCheckout, uHome) +
    `</table>` +
    `<p style="margin:0 0 6px;color:#555;font-size:13px">` +
    `Biggest leak: <b>${dropPricing}%</b> of visitors never reach pricing; of those who do, <b>${dropCheckout}%</b> drop before checkout.` +
    `</p>` +
    `<p style="margin:0 0 14px;color:#aaa;font-size:12px">Note: page-level funnel. Add click-level checkout events for exact button drop-off.</p>`;

  // date label = yesterday
  const y = new Date(Date.now() - 86400000);
  const dateLabel = y.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

  const body =
    `<p style="margin:0 0 4px;color:#555">Traffic for <b>${dateLabel}</b> (vs. the day before).</p>` +
    headline +
    section("Where visitors came from") +
    chanTbl +
    section("Most popular pages") +
    pageTbl +
    section("Where visitors landed (and who bounced)") +
    landTbl +
    section("Conversion funnel — where we lose them") +
    funnelTbl +
    devGeo;

  const html = wrap("Daily traffic snapshot", body);

  const to = process.env.DIGEST_TO || (await getSetting("digest_email", "")) || (await getSetting("alert_email", "")) || "randallgorham@gmail.com";
  const subject = `📈 MascotChatbot daily — ${int(users)} visitors, ${int(sessions)} sessions`;

  // Send via Resend directly so we can surface the exact error when it fails.
  const debug = new URL(req.url).searchParams.get("debug") === "1";
  const key = (await getSecret("RESEND_API_KEY")) || process.env.RESEND_API_KEY || "";
  const from = process.env.DIGEST_FROM || (await getSetting("digest_from", "")) || "MascotChatbot <onboarding@resend.dev>";
  let sent = false;
  let mailStatus = 0;
  let mailError = "";
  if (!key) {
    mailError = "no RESEND_API_KEY configured";
  } else {
    try {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
        body: JSON.stringify({ from, to: [to], subject, html }),
      });
      mailStatus = r.status;
      sent = r.ok;
      if (!r.ok) mailError = (await r.text()).slice(0, 300);
    } catch (e) {
      mailError = String(e).slice(0, 300);
    }
  }

  const out: Record<string, unknown> = { ok: sent, to, sessions, users, sent };
  if (debug) {
    out.from = from;
    out.mailStatus = mailStatus;
    out.mailError = mailError;
    out.hasKey = !!key;
  }
  return json(out);
}
