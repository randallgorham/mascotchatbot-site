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
  const email = await getSessionEmail(req);
  const role = await getRole(email);
  if (!role) return json({ auth: false, signedIn: !!email, email: email || null });

  const manage = canManage(role);

  // Sensitive integration keys + team list only for owner/admin (not staff).
  const integrations: Record<string, { set: boolean; last4: string; source: string }> = {};
  let settings = { brain: "openai", voice: "openai", openaiVoice: "onyx", elevenVoiceId: "" };
  let team: unknown[] = [];
  if (manage) {
    const ids = Object.keys(INTEGRATION_ENV);
    for (let i = 0; i < ids.length; i++) integrations[ids[i]] = await secretStatus(INTEGRATION_ENV[ids[i]]);
    const [brain, voice, openaiVoice, elevenVoiceId] = await Promise.all([
      getSetting("brain", "openai"),
      getSetting("voice", "openai"),
      getSetting("openai_voice", "onyx"),
      getSetting("eleven_voice_id", ""),
    ]);
    settings = { brain, voice, openaiVoice, elevenVoiceId };
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
