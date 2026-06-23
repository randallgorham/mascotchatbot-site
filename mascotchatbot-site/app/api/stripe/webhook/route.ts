// Stripe webhook: on a completed checkout we auto-provision the buyer —
// create their account record (if new) and their bot, then send a welcome email.
// Signature is verified against STRIPE_WEBHOOK_SECRET using Web Crypto (Edge-safe).
import { getSecret, kvSet } from "@/lib/vault";
import { getUser, saveUser } from "@/lib/auth";
import { getOrCreateBot } from "@/lib/botcfg";

export const runtime = "edge";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
}

const E = new TextEncoder();

// Constant-time hex string compare.
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function verify(payload: string, sigHeader: string, secret: string): Promise<boolean> {
  // Header format: t=timestamp,v1=signature[,v1=...]
  const parts = sigHeader.split(",").map((p) => p.trim());
  let t = "";
  const v1: string[] = [];
  for (let i = 0; i < parts.length; i++) {
    const [k, v] = parts[i].split("=");
    if (k === "t") t = v;
    else if (k === "v1" && v) v1.push(v);
  }
  if (!t || v1.length === 0) return false;
  const key = await crypto.subtle.importKey("raw", E.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, E.encode(t + "." + payload));
  const bytes = new Uint8Array(sig);
  let expected = "";
  for (let i = 0; i < bytes.length; i++) expected += bytes[i].toString(16).padStart(2, "0");
  return v1.some((s) => timingSafeEqual(s, expected));
}

async function sendWelcome(toEmail: string, origin: string): Promise<void> {
  try {
    const key = await getSecret("RESEND_API_KEY");
    if (!key || !toEmail) return;
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "MascotChatbot <onboarding@resend.dev>",
        to: [toEmail],
        subject: "Welcome to MascotChatbot — your mascot is ready to set up 🎉",
        html:
          `<div style="font-family:system-ui,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a">` +
          `<h2 style="margin:0 0 10px">You're in! 🎉</h2>` +
          `<p style="margin:0 0 12px">Thanks for your purchase. Your account and mascot have been created.</p>` +
          `<p style="margin:0 0 12px">Sign in to finish onboarding — name your business, pick your mascot, and grab your embed code:</p>` +
          `<p style="margin:0 0 16px"><a href="${origin}/account" style="display:inline-block;background:#0A0A0A;color:#fff;text-decoration:none;padding:11px 20px;border-radius:10px;font-weight:600">Set up my mascot →</a></p>` +
          `<p style="margin:0;color:#888;font-size:12px">Use this same email to sign in (Google or password). — MascotChatbot</p></div>`,
      }),
    });
  } catch {
    /* best effort */
  }
}

export async function POST(req: Request) {
  const secret = await getSecret("STRIPE_WEBHOOK_SECRET");
  const sig = req.headers.get("stripe-signature") || "";
  const body = await req.text();

  if (!secret) return json({ ok: false, error: "Webhook secret not configured." }, 400);
  if (!sig || !(await verify(body, sig, secret))) return json({ ok: false, error: "Invalid signature." }, 400);

  let event: { type?: string; data?: { object?: Record<string, unknown> } };
  try { event = JSON.parse(body); } catch { return json({ ok: false, error: "Bad payload." }, 400); }

  if (event.type === "checkout.session.completed") {
    const s = (event.data && event.data.object) || {};
    const details = (s.customer_details as { email?: string } | undefined) || undefined;
    const meta = (s.metadata as { email?: string } | undefined) || undefined;
    const email = String((details && details.email) || s.customer_email || (meta && meta.email) || "").toLowerCase();
    if (email) {
      const origin = new URL(req.url).origin;
      // Provision account record if new (so login + dashboard work).
      const existing = await getUser(email);
      if (!existing) {
        await saveUser({ email, name: email.split("@")[0], createdAt: new Date().toISOString() });
      }
      // Provision their bot.
      await getOrCreateBot(email);
      // Record the paid order for the admin.
      const orderId = String(s.id || Date.now().toString(36));
      await kvSet("order:" + orderId, JSON.stringify({
        id: orderId, email, status: "paid",
        amount: Number(s.amount_total || 0) / 100,
        createdAt: new Date().toISOString(),
      }));
      await sendWelcome(email, origin);
    }
  }

  return json({ ok: true, received: true });
}
