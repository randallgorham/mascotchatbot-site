// Outbound notifications for the owner/admin: email via Resend, optional Slack webhook.
import { getSecret, getSetting } from "@/lib/vault";

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const key = await getSecret("RESEND_API_KEY");
    if (!key || !to) return false;
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
      body: JSON.stringify({ from: "MascotChatbot <onboarding@resend.dev>", to: [to], subject, html }),
    });
    return r.ok;
  } catch {
    return false;
  }
}

export async function sendSlack(text: string): Promise<boolean> {
  try {
    const url = await getSecret("SLACK_WEBHOOK_URL");
    if (!url) return false;
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) });
    return r.ok;
  } catch {
    return false;
  }
}

// Where owner alerts/digests go. Falls back to the configured admin email setting.
export async function alertEmail(): Promise<string> {
  return (await getSetting("alert_email", "")) || "";
}

export function wrap(title: string, bodyHtml: string): string {
  return (
    `<div style="font-family:system-ui,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a;max-width:600px">` +
    `<h2 style="margin:0 0 12px">${title}</h2>${bodyHtml}` +
    `<p style="margin:18px 0 0;color:#888;font-size:12px">— MascotChatbot · <a href="https://www.mascotchatbot.com/admin/fleet">Open the fleet dashboard →</a></p></div>`
  );
}
