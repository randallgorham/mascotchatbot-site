// Minimal Google Analytics 4 (Data API) client.
// Auth: a Google service account (client email + private key) is signed into a
// short-lived OAuth token via WebCrypto, so this runs fine on the Edge runtime
// with no external dependencies. Credentials come from env (set in Vercel):
//   GA_SA_CLIENT_EMAIL  — service account email
//   GA_SA_PRIVATE_KEY   — service account private key (PEM; \n-escaped is fine)
//   GA_PROPERTY_ID      — numeric GA4 property id (e.g. 123456789)

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/analytics.readonly";

function b64url(input: ArrayBuffer | string): string {
  let str: string;
  if (typeof input === "string") {
    str = btoa(unescape(encodeURIComponent(input)));
  } else {
    const bytes = new Uint8Array(input);
    let bin = "";
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    str = btoa(bin);
  }
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function pemToDer(pem: string): ArrayBuffer {
  const body = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s+/g, "");
  const bin = atob(body);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}

async function getAccessToken(): Promise<string | null> {
  const email = process.env.GA_SA_CLIENT_EMAIL || "";
  const rawKey = process.env.GA_SA_PRIVATE_KEY || "";
  if (!email || !rawKey) return null;
  const pk = rawKey.replace(/\\n/g, "\n");

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: email,
    scope: SCOPE,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  };
  const signingInput = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(claim))}`;

  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToDer(pk),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(signingInput)
  );
  const jwt = `${signingInput}.${b64url(sig)}`;

  const r = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!r.ok) return null;
  const j = (await r.json()) as { access_token?: string };
  return j.access_token || null;
}

export type GaRow = { dims: string[]; metrics: string[] };
export type GaReport = { rows: GaRow[] };

// Run a batch of report requests in one call. Returns one GaReport per request.
export async function batchRunReports(requests: unknown[]): Promise<GaReport[] | null> {
  const token = await getAccessToken();
  const prop = process.env.GA_PROPERTY_ID || "";
  if (!token || !prop) return null;
  const url = `https://analyticsdata.googleapis.com/v1beta/properties/${prop}:batchRunReports`;
  const r = await fetch(url, {
    method: "POST",
    headers: { Authorization: "Bearer " + token, "Content-Type": "application/json" },
    body: JSON.stringify({ requests }),
  });
  if (!r.ok) return null;
  const j = (await r.json()) as { reports?: Array<{ rows?: Array<{ dimensionValues?: { value: string }[]; metricValues?: { value: string }[] }> }> };
  const reports = j.reports || [];
  return reports.map((rep) => ({
    rows: (rep.rows || []).map((row) => ({
      dims: (row.dimensionValues || []).map((d) => d.value),
      metrics: (row.metricValues || []).map((m) => m.value),
    })),
  }));
}

export function gaConfigured(): boolean {
  return !!(process.env.GA_SA_CLIENT_EMAIL && process.env.GA_SA_PRIVATE_KEY && process.env.GA_PROPERTY_ID);
}
