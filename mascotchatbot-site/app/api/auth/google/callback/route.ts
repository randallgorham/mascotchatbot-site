import { googleCreds, getUser, saveUser, makeSessionToken, sessionCookie } from "@/lib/auth";

export const runtime = "edge";

function redirectTo(origin: string, path: string, cookies: string[] = []) {
  const res = new Response(null, { status: 302, headers: { Location: origin + path } });
  for (let i = 0; i < cookies.length; i++) res.headers.append("Set-Cookie", cookies[i]);
  return res;
}

export async function GET(req: Request) {
  const u = new URL(req.url);
  const origin = u.origin;
  const code = u.searchParams.get("code");
  const state = u.searchParams.get("state");
  const cookie = req.headers.get("cookie") || "";
  const cm = cookie.match(/mcb_oauth_state=([^;]+)/);

  if (!code || !state || !cm || cm[1] !== state) return redirectTo(origin, "/account?error=oauth");

  const { id, secret } = await googleCreds();
  if (!id || !secret) return redirectTo(origin, "/account?error=google_not_configured");

  const redirect = origin + "/api/auth/google/callback";
  const tok = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ code, client_id: id, client_secret: secret, redirect_uri: redirect, grant_type: "authorization_code" }),
  })
    .then((r) => r.json())
    .catch(() => null);
  if (!tok || !tok.access_token) return redirectTo(origin, "/account?error=token");

  const info = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: "Bearer " + tok.access_token },
  })
    .then((r) => r.json())
    .catch(() => null);
  if (!info || !info.email) return redirectTo(origin, "/account?error=userinfo");

  const email = String(info.email).toLowerCase();
  let user = await getUser(email);
  if (!user) {
    user = { email, name: String(info.name || email.split("@")[0]), google: true, createdAt: new Date().toISOString() };
    await saveUser(user);
  }
  const sess = sessionCookie(await makeSessionToken(email));
  const clearState = "mcb_oauth_state=; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=0";
  return redirectTo(origin, "/account", [sess, clearState]);
}
