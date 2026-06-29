// Per-customer chatbot configuration: stored in KV, drives the embeddable widget
// and the bot's AI brain. Public widget only ever sees publicConfig(...).
import { kvGet, kvSet } from "@/lib/vault";
import { skillsSystemPrompt, effectiveSkillIds } from "@/lib/skills";

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
  siteUrl?: string; // where the widget is installed (set on verify)
  installed?: boolean; // widget confirmed live on the site
  installedAt?: string; // ISO go-live (first successful verify)
  setup?: string; // setup package: ours | animate | scratch
  tier?: string; // pricing package: starter | pro | premium (drives skill allowance)
  skills?: string[]; // selected skill ids (capped by tier allowance)
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
    tier: "starter",
    skills: ["booking", "webknowledge"],
    updatedAt: new Date().toISOString(),
  };
  await kvSet("botowner:" + lower, id);
  await saveBot(cfg);
  await registerBot(lower, id);
  return cfg;
}

// ---- Agency multi-client support -------------------------------------------
// An account (agency) can own many client bots. We track them in a list keyed
// by the owner's email; the "primary" bot (botowner:<email>) is always included.

async function botIds(email: string): Promise<string[]> {
  const v = await kvGet("botlist:" + email.toLowerCase());
  if (!v) return [];
  try {
    const a = JSON.parse(v);
    return Array.isArray(a) ? (a as string[]) : [];
  } catch {
    return [];
  }
}

export async function registerBot(email: string, id: string): Promise<void> {
  const lower = email.toLowerCase();
  const ids = await botIds(lower);
  if (!ids.includes(id)) {
    ids.push(id);
    await kvSet("botlist:" + lower, JSON.stringify(ids));
  }
}

// Does this account own this bot? (Either it's the bot's owner, or it's listed.)
export async function ownsBot(email: string, id: string): Promise<boolean> {
  const lower = email.toLowerCase();
  const b = await getBot(id);
  if (b && b.owner === lower) return true;
  const ids = await botIds(lower);
  return ids.includes(id);
}

// All bots this account manages (primary first), de-duplicated.
export async function listBotsFor(email: string): Promise<BotConfig[]> {
  const lower = email.toLowerCase();
  const primary = await getOrCreateBot(lower);
  const ids = await botIds(lower);
  const order: string[] = [primary.id];
  for (let i = 0; i < ids.length; i++) if (!order.includes(ids[i])) order.push(ids[i]);
  const out: BotConfig[] = [];
  for (let i = 0; i < order.length; i++) {
    const b = await getBot(order[i]);
    if (b) out.push(b);
  }
  return out;
}

// Create a new client bot under this account.
export async function createBotFor(email: string, business: string, industry?: string): Promise<BotConfig> {
  const lower = email.toLowerCase();
  const id = rid();
  const cfg: BotConfig = {
    id,
    owner: lower,
    business: (business || "New client").slice(0, 120),
    industry: (industry || "").slice(0, 80),
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
    plan: "active",
    badge: true,
    tier: "starter",
    skills: ["booking", "webknowledge"],
    updatedAt: new Date().toISOString(),
  };
  await saveBot(cfg);
  await registerBot(lower, id);
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
    skills: effectiveSkillIds(c.tier, c.skills),
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
    skillsSystemPrompt(c.tier, c.skills),
    "On every reply, help the visitor and naturally guide them to " + (c.cta || "get in touch") + ".",
    "Keep replies short and conversational, like natural speech: one to three sentences, no markdown, no bullet points, no headings. Be warm and helpful. Never invent prices, hours, or facts you were not given — if unsure, offer to connect them with the team.",
  ];
  const out: string[] = [];
  for (let i = 0; i < parts.length; i++) if (parts[i]) out.push(parts[i]);
  return out.join(" ");
}
