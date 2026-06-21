import { getUser, saveUser, hashPassword, makeSessionToken, sessionCookie, clearSessionCookie, getSessionEmail } from "@/lib/auth";
import { kvReady } from "@/lib/vault";

export const runtime = "edge";

function json(data: unknown, status = 200, cookie?: string) {
  const res = new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
  if (cookie) res.headers.append("Set-Cookie", cookie);
  return res;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as Record<string, string>));
  const action = String(body.action || "");

  if (action === "logout") return json({ ok: true }, 200, clearSessionCookie);

  if (action === "me") {
    const email = await getSessionEmail(req);
    if (!email) return json({ user: null });
    const u = await getUser(email);
    return json({ user: u ? { email: u.email, name: u.name } : { email, name: email.split("@")[0] } });
  }

  if (!kvReady()) return json({ ok: false, error: "Accounts aren't enabled yet — the database isn't connected." }, 400);

  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (action === "signup") {
    if (!email || !password || password.length < 6) return json({ ok: false, error: "Enter an email and a password of 6+ characters." }, 400);
    if (await getUser(email)) return json({ ok: false, error: "An account with that email already exists — try logging in." }, 400);
    const { salt, hash } = await hashPassword(password);
    const name = String(body.name || "").trim() || email.split("@")[0];
    await saveUser({ email, name, salt, hash, createdAt: new Date().toISOString() });
    return json({ ok: true, user: { email, name } }, 200, sessionCookie(await makeSessionToken(email)));
  }

  if (action === "login") {
    const u = await getUser(email);
    if (!u || !u.salt || !u.hash) return json({ ok: false, error: "No account found for that email, or it was created with Google sign-in." }, 400);
    const { hash } = await hashPassword(password, u.salt);
    if (hash !== u.hash) return json({ ok: false, error: "Incorrect email or password." }, 401);
    return json({ ok: true, user: { email: u.email, name: u.name } }, 200, sessionCookie(await makeSessionToken(email)));
  }

  return json({ ok: false, error: "Unknown action." }, 400);
}
