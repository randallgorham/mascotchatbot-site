import { getSessionEmail, getRole, canManage, getTeam, setTeam, isOwner, TeamMember } from "@/lib/auth";
import { kvReady } from "@/lib/vault";

export const runtime = "edge";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export async function POST(req: Request) {
  const email = await getSessionEmail(req);
  const role = await getRole(email);
  if (!canManage(role)) return json({ ok: false, error: "Not authorized." }, 401);
  if (!kvReady()) return json({ ok: false, error: "Connect a Vercel KV store first." }, 400);

  const body = await req.json().catch(() => ({} as Record<string, string>));
  const action = String(body.action || "");
  const target = String(body.email || "").trim().toLowerCase();

  if (action === "add") {
    if (!target || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(target)) return json({ ok: false, error: "Enter a valid email." }, 400);
    if (isOwner(target)) return json({ ok: false, error: "That email is already an owner." }, 400);
    const newRole = body.role === "admin" ? "admin" : "staff";
    const team = await getTeam();
    const next: TeamMember[] = team.filter((m) => m.email.toLowerCase() !== target);
    next.push({ email: target, role: newRole, addedAt: new Date().toISOString() });
    await setTeam(next);
    return json({ ok: true, team: next });
  }

  if (action === "remove") {
    const team = await getTeam();
    const next = team.filter((m) => m.email.toLowerCase() !== target);
    await setTeam(next);
    return json({ ok: true, team: next });
  }

  return json({ ok: false, error: "Unknown action." }, 400);
}
