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
}

export async function saveLead(l: Lead): Promise<boolean> {
  return kvSet(`lead:${l.botId}:${l.id}`, JSON.stringify(l));
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

function esc(s: string): string {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c] as string));
}
