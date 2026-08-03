/* THNK lead relay - forwards widget submissions server-side to the central THNK lead handler (email + CSV + ECHO client codes). Browser posts here because Bluehost blocks cross-site requests. */
export async function POST(req) {
  try {
    const fd = await req.formData();
    const body = new FormData();
    for (const [k, v] of fd.entries()) body.append(k, String(v));
    const r = await fetch('https://peakpools.com/thnk-lead.php', { method: 'POST', body });
    const j = await r.json().catch(() => ({ ok: false }));
    return Response.json(j, { status: r.ok ? 200 : r.status });
  } catch (e) {
    return Response.json({ ok: false }, { status: 502 });
  }
}

