// Per-customer chatbot configuration: stored in KV, drives the embeddable widget
// and the bot's AI brain. Public widget only ever sees publicConfig(...).
import { kvGet, kvSet } from "@/lib/vault";

export interface BotConfig {
  id: string;
  owner: string; // account email
  business: string;
  industry: string;
  about: string; // what they do
  facts: string; // hours, services, FAQ, anything the bot should know
  notes: string; // special instructions / personality / custom mascot notes
  cta: string; // the action to push toward, e.g. "book an appointment"
  ctaUrl: string; // optional link the bot/button points to
  greet: boolean; // auto-greet (open + speak) when the widget loads
  wave: boolean;
  wink: boolean;
  voice: string; // OpenAI voice id
  accent: string; // widget accent color (hex)
  image: string; // mascot image URL (optional; widget shows a default if empty)
  plan: string; // starter | pro | premium
  badge: boolean; // show "Powered by mascotchatbot.com"
  trialEnds?: string; // ISO date the free trial ends (while plan === "trial")
  updatedAt: string;
}

function rid(): string {
  const chars = "abcdefghijkmnpqrstuvwxyz23456789";
  const a = crypto.getRandomValues(new Uint8Array(10));
  let s = "";
  for (let i = 0; i < a.length; i++) s += chars[a[i] % chars.length];
  return s;
}

export async function getBot(id: string): Promise<BotConfig | null> {
  const v = await kvGet("bot:" + id);
  if (!v) return null;
  try {
    return JSON.parse(v) as BotConfig;
  } catch {
    return null;
  }
}

export async function saveBot(cfg: BotConfig): Promise<boolean> {
  cfg.updatedAt = new Date().toISOString();
  return kvSet("bot:" + cfg.id, JSON.stringify(cfg));
}

export async function getOrCreateBot(email: string, name?: string): Promise<BotConfig> {
  const lower = email.toLowerCase();
  const existingId = await kvGet("botowner:" + lower);
  if (existingId) {
    const ex = await getBot(existingId);
    if (ex) return ex;
  }
  const id = rid();
  const cfg: BotConfig = {
    id,
    owner: lower,
    business: name || "Your business",
    industry: "",
    about: "",
    facts: "",
    notes: "",
    cta: "book an appointment",
    ctaUrl: "",
    greet: true,
    wave: true,
    wink: true,
    voice: "ash",
    accent: "#e3342b",
    image: "",
    plan: "trial",
    badge: true,
    trialEnds: new Date(Date.now() + 14 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await kvSet("botowner:" + lower, id);
  await saveBot(cfg);
  return cfg;
}

// Only these fields are exposed to the public widget.
export function publicConfig(c: BotConfig) {
  return {
    id: c.id,
    business: c.business,
    cta: c.cta,
    ctaUrl: c.ctaUrl,
    greet: c.greet,
    wave: c.wave,
    wink: c.wink,
    voice: c.voice,
    accent: c.accent,
    image: c.image,
    badge: c.badge,
  };
}

// The AI brain's system prompt for this specific bot.
export function botSystemPrompt(c: BotConfig): string {
  const parts = [
    "You are the friendly, upbeat talking mascot assistant for " +
      c.business +
      (c.industry ? ", a " + c.industry + " business" : "") +
      ".",
    c.about ? "What we do: " + c.about : "",
    c.facts ? "Key facts you can use: " + c.facts : "",
    c.notes ? "Special instructions from the business owner (follow these): " + c.notes : "",
    "On every reply, help the visitor and naturally guide them to " + (c.cta || "get in touch") + ".",
    "Keep replies short and conversational, like natural speech: one to three sentences, no markdown, no bullet points, no headings. Be warm and helpful. Never invent prices, hours, or facts you were not given — if unsure, offer to connect them with the team.",
  ];
  const out: string[] = [];
  for (let i = 0; i < parts.length; i++) if (parts[i]) out.push(parts[i]);
  return out.join(" ");
}
