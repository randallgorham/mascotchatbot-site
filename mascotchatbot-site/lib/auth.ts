// Dependency-free auth: KV-stored users, PBKDF2 password hashing, HMAC-signed
// session cookies, and Google OAuth helpers. All via Web Crypto + fetch.
import { kvGet, kvSet, getSecret } from "@/lib/vault";

export type Role = "owner" | "admin" | "staff";
export type TeamMember = { email: string; role: "admin" | "staff"; addedAt?: string };

const E = new TextEncoder();
const Dec = new TextDecoder();

function bytesToHex(b: Uint8Array) {
  let s = "";
  for (let i = 0; i < b.length; i++) s += b[i].toString(16).padStart(2, "0");
  return s;
}
function hexToBytes(h: string) {
  const out = new Uint8Array(h.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(h.slice(i * 2, i * 2 + 2), 16);
  return out;
}
function b64url(b: Uint8Array) {
  let s = "";
  for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function fromB64url(s: string) {
  let t = s.replace(/-/g, "+").replace(/_/g, "/");
  while (t.length % 4) t += "=";
  const r = atob(t);
  const o = new Uint8Array(r.length);
  for (let i = 0; i < r.length; i++) o[i] = r.charCodeAt(i);
  return o;
}
function secret() {
  return process.env.AUTH_SECRET || process.env.VAULT_SECRET || "mcb-dev-auth-secret-change-me";
}

export async function hashPassword(pw: string, saltHex?: string) {
  const salt = saltHex ? hexToBytes(saltHex) : crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", E.encode(pw), { name: "PBKDF2" }, false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: 100000, hash: "SHA-256" }, key, 256);
  return { salt: bytesToHex(salt), hash: bytesToHex(new Uint8Array(bits)) };
}

export type User = { email: string; name: string; salt?: string; hash?: string; google?: boolean; createdAt: string };

export async function getUser(email: string): Promise<User | null> {
  const v = await kvGet("user:" + email.toLowerCase());
  if (!v) return null;
  try {
    return JSON.parse(v) as User;
  } catch {
    return null;
  }
}
export async function saveUser(u: User) {
  return kvSet("user:" + u.email.toLowerCase(), JSON.stringify(u));
}

async function hmac(data: string) {
  const k = await crypto.subtle.importKey("raw", E.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", k, E.encode(data));
  return b64url(new Uint8Array(sig));
}
export async function makeSessionToken(email: string) {
  const payload = b64url(E.encode(JSON.stringify({ e: email.toLowerCase(), x: Date.now() + 1000 * 60 * 60 * 24 * 30 })));
  return payload + "." + (await hmac(payload));
}
export function sessionCookie(token: string) {
  return "mcb_session=" + token + "; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=" + 60 * 60 * 24 * 30;
}
export const clearSessionCookie = "mcb_session=; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=0";

export async function getSessionEmail(req: Request): Promise<string | null> {
  const c = req.headers.get("cookie") || "";
  const m = c.match(/mcb_session=([^;]+)/);
  if (!m) return null;
  const tok = decodeURIComponent(m[1]);
  const dot = tok.indexOf(".");
  if (dot < 0) return null;
  const payload = tok.slice(0, dot);
  const sig = tok.slice(dot + 1);
  if ((await hmac(payload)) !== sig) return null;
  try {
    const o = JSON.parse(Dec.decode(fromB64url(payload)));
    if (typeof o.x !== "number" || o.x < Date.now()) return null;
    return String(o.e);
  } catch {
    return null;
  }
}

export async function googleCreds() {
  const id = await getSecret("GOOGLE_CLIENT_ID");
  const sec = await getSecret("GOOGLE_CLIENT_SECRET");
  return { id, secret: sec };
}

// Owner accounts get full admin access. Defaults to the founder's email; override
// with the OWNER_EMAILS env var (comma-separated).
export function ownerEmails(): string[] {
  return (process.env.OWNER_EMAILS || "randallgorham@gmail.com")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}
export function isOwner(email: string | null): boolean {
  if (!email) return false;
  return ownerEmails().includes(email.toLowerCase());
}

// Team members the owner invites (stored in KV, managed from the admin Team tab).
export async function getTeam(): Promise<TeamMember[]> {
  const v = await kvGet("team:members");
  if (!v) return [];
  try {
    const list = JSON.parse(v);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}
export async function setTeam(list: TeamMember[]) {
  return kvSet("team:members", JSON.stringify(list));
}
export async function getRole(email: string | null): Promise<Role | null> {
  if (!email) return null;
  if (isOwner(email)) return "owner";
  const team = await getTeam();
  for (let i = 0; i < team.length; i++) {
    if (team[i].email.toLowerCase() === email.toLowerCase()) return team[i].role;
  }
  return null;
}
export function canManage(role: Role | null): boolean {
  return role === "owner" || role === "admin";
}
