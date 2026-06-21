import { adminToken } from "@/lib/vault";

export const runtime = "edge";

function json(data: unknown, status = 200, cookie?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json", "Cache-Control": "no-store" };
  const res = new Response(JSON.stringify(data), { status, headers });
  if (cookie) res.headers.append("Set-Cookie", cookie);
  return res;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as { password?: string }));
  const pw = (body && body.password) || "";
  if (!process.env.ADMIN_PASSWORD) {
    return json({ ok: false, error: "Admin isn't set up yet — add an ADMIN_PASSWORD in Vercel." }, 400);
  }
  if (!pw || pw !== process.env.ADMIN_PASSWORD) {
    return json({ ok: false, error: "Incorrect password." }, 401);
  }
  const tok = await adminToken();
  const cookie = "mcb_admin=" + tok + "; HttpOnly; Secure; Path=/; SameSite=Lax; Max-Age=86400";
  return json({ ok: true }, 200, cookie);
}
