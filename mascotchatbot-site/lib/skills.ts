// Bot skill system. Skills are modular capabilities that shape the mascot's brain.
// Two base skills are always on; the rest are selectable, capped by the bot's pricing
// tier (Starter 2 / Pro 5 / Premium unlimited) — so the higher the package, the smarter
// the bot. Each skill carries a system-prompt fragment that teaches the bot the behavior.

export interface Skill {
  id: string;
  label: string;
  blurb: string; // short customer-facing description
  prompt: string; // instruction injected into the bot's system prompt when enabled
  minTier?: "starter" | "pro" | "premium"; // optional hard gate (e.g. voice = pro+)
}

// Always active for every bot, regardless of tier — the foundation.
export const BASE_SKILLS: Skill[] = [
  { id: "faq", label: "FAQ answering", blurb: "Answers questions about the business 24/7.", prompt: "Answer the visitor's questions about the business clearly and helpfully." },
  { id: "leadcapture", label: "Lead capture", blurb: "Collects name, email and phone from interested visitors.", prompt: "When a visitor shows interest, naturally collect their name and best email or phone so the team can follow up." },
];

// Selectable catalog (counts against the tier allowance).
export const SKILL_CATALOG: Skill[] = [
  { id: "booking", label: "Appointment booking", blurb: "Books appointments and offers time slots.", prompt: "Help the visitor book an appointment: ask for their preferred day and time, confirm details, and guide them to the booking link or form." },
  { id: "voice", label: "Voice (talk + listen)", blurb: "Speaks out loud and listens so visitors can talk hands-free.", prompt: "You can speak out loud and listen; keep replies natural and conversational for spoken delivery.", minTier: "pro" },
  { id: "multilingual", label: "Multilingual", blurb: "Detects and replies in the visitor's language.", prompt: "Detect the language the visitor writes in and reply fluently in that same language." },
  { id: "webknowledge", label: "Website knowledge", blurb: "Answers from the business's own website content.", prompt: "Use the business's website knowledge provided to you to answer accurately; never invent details that aren't supported." },
  { id: "docknowledge", label: "Document knowledge", blurb: "Answers from uploaded menus, price lists and PDFs.", prompt: "Use the uploaded business documents (menus, price lists, policies) to answer specific questions precisely." },
  { id: "recommend", label: "Product recommendations", blurb: "Suggests the best-fit product or service and upsells.", prompt: "Recommend the most relevant product or service for the visitor's need, and where appropriate suggest a complementary upgrade." },
  { id: "quote", label: "Instant quotes", blurb: "Gives ballpark pricing and captures details for a precise quote.", prompt: "When asked about price, give helpful ballpark guidance if known, then collect the details needed for an accurate quote." },
  { id: "handoff", label: "Human handoff", blurb: "Connects visitors to a real person when needed.", prompt: "If the visitor asks for a human or you cannot help, offer to connect them with the team and collect their contact and best time to reach them." },
  { id: "afterhours", label: "After-hours messages", blurb: "Takes detailed messages outside business hours.", prompt: "If it is outside business hours, take a detailed message and reassure the visitor the team will follow up the next business day." },
  { id: "escalation", label: "Smart escalation", blurb: "Detects frustration or urgency and fast-tracks a human.", prompt: "Watch for signs of frustration, complaints, or urgency; if detected, apologize, prioritize a fast human follow-up, and capture contact details." },
  { id: "crm", label: "CRM / SMS routing", blurb: "Routes captured leads into your CRM and SMS.", prompt: "Treat every captured lead as high priority for routing to the business's CRM and SMS follow-up.", minTier: "pro" },
  { id: "calendar", label: "Live calendar availability", blurb: "Offers real open time slots from the calendar.", prompt: "When booking, offer concrete available time slots and confirm the chosen one.", minTier: "premium" },
];

export const TIER_ALLOWANCE: Record<string, number> = {
  starter: 2,
  pro: 5,
  premium: Infinity,
};

export function normTier(tier?: string): "starter" | "pro" | "premium" {
  const t = (tier || "").toLowerCase();
  if (t === "pro") return "pro";
  if (t === "premium") return "premium";
  return "starter";
}

export function tierAllowance(tier?: string): number {
  return TIER_ALLOWANCE[normTier(tier)];
}

const TIER_RANK: Record<string, number> = { starter: 1, pro: 2, premium: 3 };

// Which catalog skills are even eligible for this tier (respects per-skill minTier).
export function eligibleSkills(tier?: string): Skill[] {
  const rank = TIER_RANK[normTier(tier)];
  return SKILL_CATALOG.filter((s) => !s.minTier || TIER_RANK[s.minTier] <= rank);
}

// The skill ids actually active: base skills + selected (filtered to eligible, capped by allowance).
export function effectiveSkillIds(tier: string | undefined, selected: string[] | undefined): string[] {
  const elig = new Set(eligibleSkills(tier).map((s) => s.id));
  const picked = (selected || []).filter((id) => elig.has(id));
  const capped = picked.slice(0, tierAllowance(tier));
  return [...BASE_SKILLS.map((s) => s.id), ...capped];
}

export function skillById(id: string): Skill | undefined {
  return [...BASE_SKILLS, ...SKILL_CATALOG].find((s) => s.id === id);
}

// System-prompt fragment for the enabled skills — this is what makes higher tiers smarter.
export function skillsSystemPrompt(tier: string | undefined, selected: string[] | undefined): string {
  const ids = effectiveSkillIds(tier, selected);
  const lines = ids.map((id) => skillById(id)?.prompt).filter(Boolean);
  if (!lines.length) return "";
  return "Your enabled abilities: " + lines.join(" ");
}
