// Referral / affiliate program: unique codes per account, first-touch attribution
// on signup, and cash commission booked when the referred account first pays.
import { kvGet, kvSet, kvList } from "@/lib/vault";

export const COMMISSION_RATE = 0.2; // 20% of the referred customer's first payment

export interface Referral {
  email: string; // referred user's email
  referrer: string; // referrer's email
  code: string;
  at: string;
  status: "signup" | "paid";
  amount?: number; // first payment amount (USD)
  commission?: number; // owed to referrer (USD)
  paidAt?: string;
}

function rcode(): string {
  const chars = "abcdefghijkmnpqrstuvwxyz23456789";
  const a = crypto.getRandomValues(new Uint8Array(7));
  let s = "";
  for (let i = 0; i < a.length; i++) s += chars[a[i] % chars.length];
  return s;
}

// Stable referral code for an account (generated once, then reused).
export async function getOrCreateRefCode(email: string): Promise<string> {
  const lower = email.toLowerCase();
  const existing = await kvGet("refcodeof:" + lower);
  if (existing) return existing;
  let code = rcode();
  for (let i = 0; i < 5; i++) {
    if (!(await kvGet("refcode:" + code))) break;
    code = rcode();
  }
  await kvSet("refcode:" + code, lower);
  await kvSet("refcodeof:" + lower, code);
  return code;
}

export async function emailForCode(code: string): Promise<string | null> {
  if (!code) return null;
  return (await kvGet("refcode:" + code.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 16))) || null;
}

// First-touch: attribute a new signup to a referrer (ignores self-referral / repeats).
export async function recordReferral(newEmail: string, code: string): Promise<void> {
  const lower = newEmail.toLowerCase();
  if (!code) return;
  if (await kvGet("referral:" + lower)) return; // already attributed
  const referrer = await emailForCode(code);
  if (!referrer || referrer === lower) return;
  const ref: Referral = { email: lower, referrer, code, at: new Date().toISOString(), status: "signup" };
  await kvSet("referral:" + lower, JSON.stringify(ref));
}

// Book commission when the referred account first pays.
export async function markReferralPaid(newEmail: string, amount: number): Promise<void> {
  const lower = newEmail.toLowerCase();
  const v = await kvGet("referral:" + lower);
  if (!v) return;
  let ref: Referral;
  try { ref = JSON.parse(v) as Referral; } catch { return; }
  if (ref.status === "paid") return;
  ref.status = "paid";
  ref.amount = amount;
  ref.commission = Math.round(amount * COMMISSION_RATE * 100) / 100;
  ref.paidAt = new Date().toISOString();
  await kvSet("referral:" + lower, JSON.stringify(ref));
}

async function readAll(): Promise<Referral[]> {
  const keys = await kvList("referral:");
  const out: Referral[] = [];
  for (let i = 0; i < keys.length; i++) {
    const v = await kvGet(keys[i]);
    if (!v) continue;
    try { out.push(JSON.parse(v) as Referral); } catch { /* skip */ }
  }
  return out;
}

export type RefSummary = { code: string; count: number; paid: number; pending: number; earned: number; pendingCommission: number; referrals: Referral[] };

export async function summaryFor(email: string): Promise<RefSummary> {
  const lower = email.toLowerCase();
  const code = await getOrCreateRefCode(lower);
  const mine = (await readAll()).filter((r) => r.referrer === lower).sort((a, b) => (a.at < b.at ? 1 : -1));
  let paid = 0, earned = 0, pendingCommission = 0;
  for (const r of mine) {
    if (r.status === "paid") { paid++; earned += r.commission || 0; } else pendingCommission += 0;
  }
  return {
    code,
    count: mine.length,
    paid,
    pending: mine.length - paid,
    earned: Math.round(earned * 100) / 100,
    pendingCommission,
    referrals: mine,
  };
}

// Admin: total owed per referrer for payouts.
export type Payout = { referrer: string; signups: number; conversions: number; owed: number };
export async function payouts(): Promise<{ rows: Payout[]; totalOwed: number; totalConversions: number }> {
  const all = await readAll();
  const by: Record<string, Payout> = {};
  for (const r of all) {
    const p = (by[r.referrer] = by[r.referrer] || { referrer: r.referrer, signups: 0, conversions: 0, owed: 0 });
    p.signups++;
    if (r.status === "paid") { p.conversions++; p.owed += r.commission || 0; }
  }
  const rows = Object.values(by).map((p) => ({ ...p, owed: Math.round(p.owed * 100) / 100 })).sort((a, b) => b.owed - a.owed);
  return {
    rows,
    totalOwed: Math.round(rows.reduce((s, p) => s + p.owed, 0) * 100) / 100,
    totalConversions: rows.reduce((s, p) => s + p.conversions, 0),
  };
}
