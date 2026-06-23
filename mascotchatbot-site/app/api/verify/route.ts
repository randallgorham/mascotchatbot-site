// Install verification: fetch the owner's site and confirm the widget snippet is present.
export const runtime = "edge";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    let url = String((body && body.url) || "").trim();
    const botId = String((body && body.botId) || "").trim();
    if (!url) return json({ ok: false, error: "Enter the URL where you installed the widget." }, 400);
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;
    let parsed: URL;
    try { parsed = new URL(url); } catch { return json({ ok: false, error: "That doesn't look like a valid URL." }, 400); }

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 12000);
    let html = "";
    try {
      const r = await fetch(parsed.toString(), { headers: { "User-Agent": "MascotChatbot-Verify/1.0" }, signal: ctrl.signal });
      if (!r.ok) return json({ ok: false, error: `Couldn't reach that page (status ${r.status}).` }, 400);
      html = await r.text();
    } catch {
      return json({ ok: false, error: "Couldn't load that page — check the URL and try again." }, 400);
    } finally {
      clearTimeout(timer);
    }

    const hasScript = /widget\.js/i.test(html);
    const botMatch = botId ? new RegExp('data-bot=["\']?' + botId.replace(/[^a-z0-9]/gi, ""), "i").test(html.replace(/[^\x20-\x7e]/g, "")) : false;
    const installed = hasScript && (!botId || botMatch);
    return json({
      ok: true,
      installed,
      hasScript,
      botMatch,
      message: installed
        ? "Your mascot is installed and live on that page! 🎉"
        : hasScript
        ? "Found a MascotChatbot script, but it points to a different bot. Make sure the data-bot value matches your code above."
        : "We couldn't find the widget on that page yet. Double-check you pasted the code before </body> and published the page.",
    });
  } catch {
    return json({ ok: false, error: "Something went wrong checking that page." }, 500);
  }
}
