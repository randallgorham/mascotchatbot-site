// Lead capture: when a visitor shares contact info in chat, we store it per-bot
// and (best-effort) email the business owner.
import { kvGet, kvSet, kvList, getSecret } from "@/lib/vault";

export interface Lead {
  id: string;
  botId: string;
  name?: string;
  email?: string;
  phone?: string;
  message: string;
  at: string;
  transcript?: { role: string; content: string }[];
}

export async function saveLead(l: Lead): Promise<boolean> {
  return kvSet(`lead:${l.botId}:${l.id}`, JSON.stringify(l));
}

// Returns the stored lead if one already exists for this bot+id (used to avoid re-emailing repeat messages).
export async function getLead(botId: string, id: string): Promise<Lead | null> {
  const v = await kvGet(`lead:${botId}:${id}`);
  if (!v) return null;
  try { return JSON.parse(v) as Lead; } catch { return null; }
}

export async function listLeads(botId: string, limit = 100): Promise<Lead[]> {
  const keys = await kvList(`lead:${botId}:`);
  const out: Lead[] = [];
  for (let i = 0; i < keys.length; i++) {
    const v = await kvGet(keys[i]);
    if (v) {
      try { out.push(JSON.parse(v) as Lead); } catch { /* skip */ }
    }
  }
  out.sort((a, b) => (a.at < b.at ? 1 : -1));
  return out.slice(0, limit);
}

// Pull name/email/phone out of a free-text message.
export function extractContact(text: string): { name?: string; email?: string; phone?: string } {
  const email = (text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/) || [])[0];
  const phoneRaw = (text.match(/(\+?\d[\d\s().-]{7,}\d)/) || [])[0];
  const phone = phoneRaw ? phoneRaw.replace(/\s+/g, " ").trim() : undefined;
  let name: string | undefined;
  const nm = text.match(/(?:i['’]?m|i am|my name is|this is|name['’]?s)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
  if (nm) name = nm[1].trim();
  return { name, email, phone };
}

// Best-effort email to the owner via Resend. Silent if no key / fails.
export async function emailOwner(toEmail: string, business: string, lead: Lead): Promise<void> {
  try {
    const key = await getSecret("RESEND_API_KEY");
    if (!key || !toEmail) return;
    const rows = [
      lead.name ? `<b>Name:</b> ${esc(lead.name)}` : "",
      lead.email ? `<b>Email:</b> ${esc(lead.email)}` : "",
      lead.phone ? `<b>Phone:</b> ${esc(lead.phone)}` : "",
      `<b>Said:</b> ${esc(lead.message)}`,
    ].filter(Boolean).join("<br>");
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "MascotChatbot <onboarding@resend.dev>",
        to: [toEmail],
        subject: `New lead from your mascot — ${business}`,
        html: `<div style="font-family:system-ui,Arial,sans-serif;font-size:15px;line-height:1.5"><h2 style="margin:0 0 10px">New lead 🎉</h2><p style="margin:0 0 12px;color:#555">Captured by your mascot on ${business}.</p>${rows}<p style="margin:16px 0 0;color:#888;font-size:12px">via MascotChatbot</p></div>`,
      }),
    });
  } catch {
    /* best effort */
  }
}

// Best-effort friendly auto-reply to the visitor who just left their contact info.
// Reassures them a human will follow up — keeps the lead warm. Silent if no key / no email.
export async function emailLead(business: string, mascotName: string, lead: Lead): Promise<void> {
  try {
    const key = await getSecret("RESEND_API_KEY");
    if (!key || !lead.email) return;
    const who = lead.name ? esc(lead.name.split(" ")[0]) : "there";
    const biz = esc(business || "our team");
    const mascot = esc(mascotName || "your assistant");
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: `${biz} <onboarding@resend.dev>`,
        to: [lead.email],
        subject: `Thanks for reaching out to ${biz}!`,
        html:
          `<div style="font-family:system-ui,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a">` +
          `<p style="margin:0 0 12px">Hi ${who},</p>` +
          `<p style="margin:0 0 12px">Thanks for chatting with ${mascot}! We got your details and a real person from ${biz} will follow up shortly.</p>` +
          `<p style="margin:0 0 12px">If it's urgent, just reply to this email and we'll jump on it.</p>` +
          `<p style="margin:16px 0 0">— The ${biz} team</p>` +
          `<p style="margin:16px 0 0;color:#999;font-size:12px">Powered by MascotChatbot</p></div>`,
      }),
    });
  } catch {
    /* best effort */
  }
}

function esc(s: string): string {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));
}
