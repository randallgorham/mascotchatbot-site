import { secretStatus, getSetting, kvReady, INTEGRATION_ENV, recentRecords } from "@/lib/vault";
import { getSessionEmail, getRole, canManage, getTeam } from "@/lib/auth";

export const runtime = "edge";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export async function GET(req: Request) {
  // Headless daily digest: GET /api/admin/status?digest=<token> (token = sha256("mcb-digest|"+AUTH_SECRET)).
  const digest = new URL(req.url).searchParams.get("digest");
  if (digest) {
    const enc = new TextEncoder().encode("mcb-digest|" + (process.env.AUTH_SECRET || ""));
    const hbuf = await crypto.subtle.digest("SHA-256", enc);
    const a = new Uint8Array(hbuf);
    let hex = "";
    for (let i = 0; i < a.length; i++) hex += a[i].toString(16).padStart(2, "0");
    if (!process.env.AUTH_SECRET || digest !== hex) return json({ ok: false }, 401);
    const [orders, customers] = await Promise.all([recentRecords("order:", 300), recentRecords("user:", 300)]);
    const since = Date.now() - 24 * 60 * 60 * 1000;
    const recent = (rows: unknown[]) =>
      rows.filter((r) => {
        const c = (r as { createdAt?: string }).createdAt;
        return c ? Date.parse(c) >= since : false;
      });
    const no = recent(orders) as Array<{ business?: string; email?: string; monthly?: number; oneTime?: number }>;
    const nc = recent(customers) as Array<{ email?: string; name?: string }>;
    return json({
      ok: true,
      window: "24h",
      newOrders: no.map((o) => ({ business: o.business || "", email: o.email || "", monthly: o.monthly || 0, oneTime: o.oneTime || 0 })),
      newSignups: nc.map((c) => ({ email: c.email || "", name: c.name || "" })),
      totals: { orders: orders.length, customers: customers.length },
    });
  }

  const email = await getSessionEmail(req);
  const role = await getRole(email);
  if (!role) return json({ auth: false, signedIn: !!email, email: email || null });

  const manage = canManage(role);

  // Sensitive integration keys + team list only for owner/admin (not staff).
  const integrations: Record<string, { set: boolean; last4: string; source: string }> = {};
  let settings: {
    brain: string;
    voice: string;
    openaiVoice: string;
    elevenVoiceId: string;
    botVoices: Record<string, string>;
    ghlCalendarUrl: string;
    alertEmail: string;
  } = { brain: "openai", voice: "openai", openaiVoice: "ash", elevenVoiceId: "", botVoices: {}, ghlCalendarUrl: "", alertEmail: "" };
  let team: unknown[] = [];
  if (manage) {
    const ids = Object.keys(INTEGRATION_ENV);
    for (let i = 0; i < ids.length; i++) integrations[ids[i]] = await secretStatus(INTEGRATION_ENV[ids[i]]);
    const [brain, voice, openaiVoice, elevenVoiceId, botVoicesRaw, ghlCalendarUrl, alertEmail] = await Promise.all([
      getSetting("brain", "openai"),
      getSetting("voice", "openai"),
      getSetting("openai_voice", "ash"),
      getSetting("eleven_voice_id", ""),
      getSetting("bot_voices", "{}"),
      getSetting("ghl_calendar_url", ""),
      getSetting("alert_email", ""),
    ]);
    let botVoices: Record<string, string> = {};
    try {
      const parsed = JSON.parse(botVoicesRaw);
      if (parsed && typeof parsed === "object") botVoices = parsed as Record<string, string>;
    } catch {
      /* ignore */
    }
    settings = { brain, voice, openaiVoice, elevenVoiceId, botVoices, ghlCalendarUrl, alertEmail };
    team = await getTeam();
  }

  const [orders, customers, onboarding] = await Promise.all([
    recentRecords("order:", 100),
    recentRecords("user:", 100),
    recentRecords("onboarding:", 100),
  ]);

  return json({
    auth: true,
    email,
    role,
    manage,
    kv: kvReady(),
    integrations,
    settings,
    team,
    data: { orders, customers, onboarding },
  });
}
