import { googleCreds } from "@/lib/auth";

export const runtime = "edge";

export async function GET(req: Request) {
  const origin = new URL(req.url).origin;
  const { id } = await googleCreds();
  if (!id) return new Response(null, { status: 302, headers: { Location: origin + "/account?error=google_not_configured" } });

  const redirect = origin + "/api/auth/google/callback";
  const state = crypto.randomUUID();
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", id);
  url.searchParams.set("redirect_uri", redirect);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("access_type", "online");
  url.searchParams.set("prompt", "select_account");

  const res = new Response(null, { status: 302, headers: { Location: url.toString() } });
  res.headers.append("Set-Cookie", "mcb_oauth_state=" + state + "; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=600");
  return res;
}
