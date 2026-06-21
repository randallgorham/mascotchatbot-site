// Secure integration vault: Upstash/Vercel KV over REST + AES-GCM encryption.
// Keys are encrypted at rest and never returned to the browser in full.

const KV_URL = process.env.KV_REST_API_URL || "";
const KV_TOKEN = process.env.KV_REST_API_TOKEN || "";

export function kvReady() {
  return !!(KV_URL && KV_TOKEN);
}

async function kvCmd(cmd: (string | number)[]): Promise<unknown> {
  if (!kvReady()) return null;
  try {
    const r = await fetch(KV_URL, {
      method: "POST",
      headers: { Authorization: "Bearer " + KV_TOKEN, "Content-Type": "application/json" },
      body: JSON.stringify(cmd),
      cache: "no-store",
    });
    if (!r.ok) return null;
    const j = await r.json();
    return j && "result" in j ? j.result : null;
  } catch {
    return null;
  }
}

export async function kvGet(key: string): Promise<string | null> {
  const v = await kvCmd(["GET", key]);
  return typeof v === "string" ? v : null;
}
export async function kvSet(key: string, val: string): Promise<boolean> {
  const v = await kvCmd(["SET", key, val]);
  return v === "OK";
}
export async function kvList(prefix: string): Promise<string[]> {
  const r = await kvCmd(["KEYS", prefix + "*"]);
  if (!Array.isArray(r)) return [];
  const out: string[] = [];
  for (let i = 0; i < r.length; i++) out.push(String(r[i]));
  return out;
}
export async function recentRecords(prefix: string, limit: number): Promise<unknown[]> {
  const keys = await kvList(prefix);
  const out: unknown[] = [];
  const slice = keys.slice(0, limit);
  for (let i = 0; i < slice.length; i++) {
    const v = await kvGet(slice[i]);
    if (v) {
      try {
        out.push(JSON.parse(v));
      } catch {
        /* skip */
      }
    }
  }
  return out;
}

// All integrations the owner can connect, mapped to their env-var / vault names.
export const INTEGRATION_ENV: Record<string, string> = {
  openai: "OPENAI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
  eleven: "ELEVENLABS_API_KEY",
  ghl: "GHL_WEBHOOK_URL",
  stripe_secret: "STRIPE_SECRET_KEY",
  stripe_pub: "STRIPE_PUBLISHABLE_KEY",
  stripe_webhook: "STRIPE_WEBHOOK_SECRET",
  google_id: "GOOGLE_CLIENT_ID",
  google_secret: "GOOGLE_CLIENT_SECRET",
  mailgun: "MAILGUN_API_KEY",
  auth_secret: "AUTH_SECRET",
};

// ---- AES-GCM ----
async function aesKey(): Promise<CryptoKey> {
  const secret = process.env.VAULT_SECRET || process.env.ADMIN_PASSWORD || "mcb-dev-secret-change-me";
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  return crypto.subtle.importKey("raw", h, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}
function b64(buf: Uint8Array): string {
  let s = "";
  for (let i = 0; i < buf.length; i++) s += String.fromCharCode(buf[i]);
  return btoa(s);
}
function unb64(s: string): Uint8Array {
  const raw = atob(s);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}
export async function encryptStr(text: string): Promise<string> {
  const k = await aesKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, k, new TextEncoder().encode(text));
  const both = new Uint8Array(iv.length + ct.byteLength);
  both.set(iv);
  both.set(new Uint8Array(ct), iv.length);
  return b64(both);
}
export async function decryptStr(payload: string): Promise<string | null> {
  try {
    const k = await aesKey();
    const raw = unb64(payload);
    const iv = raw.slice(0, 12);
    const ct = raw.slice(12);
    const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, k, ct);
    return new TextDecoder().decode(pt);
  } catch {
    return null;
  }
}

// ---- secrets (API keys) ----
export async function setSecret(name: string, value: string): Promise<boolean> {
  const enc = await encryptStr(value);
  return kvSet("secret:" + name, enc);
}
export async function getSecret(name: string): Promise<string> {
  const enc = await kvGet("secret:" + name);
  if (enc) {
    const d = await decryptStr(enc);
    if (d) return d;
  }
  return process.env[name] || "";
}
export async function secretStatus(name: string): Promise<{ set: boolean; last4: string; source: string }> {
  const enc = await kvGet("secret:" + name);
  if (enc) {
    const d = await decryptStr(enc);
    if (d) return { set: true, last4: d.slice(-4), source: "vault" };
  }
  const env = process.env[name] || "";
  if (env) return { set: true, last4: env.slice(-4), source: "env" };
  return { set: false, last4: "", source: "" };
}

// ---- settings (non-secret choices) ----
export async function setSetting(name: string, value: string): Promise<boolean> {
  return kvSet("setting:" + name, value);
}
export async function getSetting(name: string, def: string): Promise<string> {
  const v = await kvGet("setting:" + name);
  return v || def;
}

// ---- admin auth ----
export async function adminToken(): Promise<string> {
  const secret = process.env.ADMIN_PASSWORD || "";
  const h = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("mcb-admin-v1|" + secret));
  const arr = new Uint8Array(h);
  let hex = "";
  for (let i = 0; i < arr.length; i++) hex += arr[i].toString(16).padStart(2, "0");
  return hex;
}
export async function isAuthed(req: Request): Promise<boolean> {
  if (!process.env.ADMIN_PASSWORD) return false;
  const cookie = req.headers.get("cookie") || "";
  const m = cookie.match(/mcb_admin=([a-f0-9]+)/);
  if (!m) return false;
  return m[1] === (await adminToken());
}
