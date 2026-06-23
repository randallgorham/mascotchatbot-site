"use client";

import { useEffect, useState } from "react";

type Cfg = { business?: string; image?: string; accent?: string } | null;

const MASCOTS: [string, string][] = [
  ["dr-volt-1.png", "Dr. Volt (electrical)"],
  ["hvac.png", "Reggie (HVAC)"],
  ["06-plumber-home-services-male.svg", "Max (plumbing)"],
  ["vet.png", "Bella (vet)"],
  ["chef.png", "Theo (restaurant)"],
  ["hair.png", "Gigi (salon)"],
  ["nail.png", "Priya (nails)"],
  ["landscaper.png", "Diego (landscaping)"],
  ["04-dentist-male.jpg", "Dr. Bright (dental)"],
  ["01-realtor-female-classic.jpg", "Ava (real estate)"],
  ["20-attorney-male.jpg", "Vance (law)"],
  ["18-gym-instructor-female-blonde.jpg", "Brooke (gym)"],
  ["15-medspa-female.jpg", "Skye (med-spa)"],
  ["massage.png", "Willow (massage)"],
];

function loadWidget(botId: string) {
  if (document.querySelector(`script[data-bot="${botId}"]`)) return;
  const s = document.createElement("script");
  s.src = "/widget.js";
  s.setAttribute("data-bot", botId);
  s.async = true;
  document.body.appendChild(s);
}

export default function Demo() {
  const [bot, setBot] = useState<string | null>(null);
  const [cfg, setCfg] = useState<Cfg>(null);
  const [loading, setLoading] = useState(true);

  const [authed, setAuthed] = useState<boolean | null>(null);
  const [form, setForm] = useState({ business: "", url: "", industry: "", mascot: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [result, setResult] = useState<{ id: string; link: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const b = new URLSearchParams(window.location.search).get("b");
    setBot(b);
    if (b) {
      fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "config", botId: b }) })
        .then((r) => r.json())
        .then((d) => { setCfg(d && d.config ? d.config : null); setLoading(false); loadWidget(b); })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
      fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "me" }) })
        .then((r) => r.json()).then((d) => setAuthed(!!(d && d.user))).catch(() => setAuthed(false));
    }
  }, []);

  async function generate(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr(""); setResult(null);
    try {
      const r = await fetch("/api/prospect", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const d = await r.json();
      if (d.ok) setResult({ id: d.id, link: d.link }); else setErr(d.error || "Couldn't generate the demo.");
    } catch { setErr("Something went wrong."); }
    setBusy(false);
  }
  function copy() { if (result) navigator.clipboard.writeText(result.link).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); }); }

  const field = "w-full rounded-xl border-2 border-ink/15 px-4 py-2.5 outline-none focus:border-ink text-sm";

  if (bot) {
    return (
      <main className="flex min-h-screen flex-col bg-paper text-ink" style={{ fontFamily: "ui-sans-serif,system-ui,Arial,sans-serif" }}>
        <header className="border-b border-ink/10">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
            <a href="/" className="text-lg font-bold tracking-tight">Mascot<span className="text-smoke">Chatbot</span></a>
            <a href="/#book" className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-paper">Book a call →</a>
          </div>
        </header>
        <section className="mx-auto grid w-full max-w-5xl flex-1 items-center gap-10 px-5 py-16 md:grid-cols-2">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-ink/15 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest">
              <span className="h-2 w-2 rounded-full" style={{ background: "#22c55e" }} /> A live demo, just for you
            </p>
            <h1 className="text-4xl font-bold leading-[1.05] tracking-tightest md:text-5xl">
              {loading ? "Loading…" : <>We built {cfg?.business || "your business"} a mascot.</>}
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-smoke">
              It already knows your business and is ready to greet visitors, answer questions, and book jobs — 24/7. Go ahead, ask it anything in the chat.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="/#book" className="rounded-full bg-ink px-7 py-3.5 font-semibold text-paper">Get this on your site →</a>
              <a href="/#pricing" className="rounded-full border-2 border-ink px-7 py-3.5 font-semibold transition hover:bg-ink hover:text-paper">See pricing</a>
            </div>
            <p className="mt-4 text-xs text-smoke">This demo was made just for you — yours would be custom to your brand and voice.</p>
          </div>
          <div className="flex justify-center">
            <div className="relative w-full max-w-[360px]">
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: "rgba(43,196,230,0.14)", filter: "blur(40px)" }} />
              {cfg?.image && <img src={cfg.image} alt={`${cfg.business || "Your business"} mascot`} className="relative mx-auto w-full max-w-[320px] drop-shadow-[0_22px_34px_rgba(10,10,10,0.18)]" style={{ mixBlendMode: "multiply" }} />}
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-paper text-ink" style={{ fontFamily: "ui-sans-serif,system-ui,Arial,sans-serif" }}>
      <header className="border-b-2 border-ink">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <a href="/" className="text-lg font-bold tracking-tight">Mascot<span className="text-smoke">Chatbot</span></a>
          <a href="/account" className="text-sm font-medium text-smoke hover:text-ink">Account →</a>
        </div>
      </header>
      <div className="mx-auto w-full max-w-2xl flex-1 px-5 py-12">
        <h1 className="text-3xl font-bold tracking-tightest">Prospect demo generator</h1>
        <p className="mt-2 text-smoke">Make a live, personalized mascot demo for any local business in seconds — then send them the link. Perfect for outreach: &ldquo;I built your shop a mascot — try it.&rdquo;</p>

        {authed === false ? (
          <div className="mt-8 rounded-2xl border-2 border-ink p-6">
            <p className="text-sm">Sign in to generate demos.</p>
            <a href="/account" className="mt-3 inline-block rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper">Sign in</a>
          </div>
        ) : (
          <form onSubmit={generate} className="mt-8 space-y-4 rounded-3xl border-2 border-ink p-6">
            <label className="block text-sm"><span className="mb-1 block font-semibold">Business name</span>
              <input className={field} value={form.business} onChange={(e) => setForm({ ...form, business: e.target.value })} placeholder="Joe's Plumbing" required /></label>
            <label className="block text-sm"><span className="mb-1 block font-semibold">Their website (optional — we&apos;ll read it)</span>
              <input className={field} value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="joesplumbing.com" /></label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm"><span className="mb-1 block font-semibold">Industry</span>
                <input className={field} value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} placeholder="Plumbing" /></label>
              <label className="block text-sm"><span className="mb-1 block font-semibold">Mascot</span>
                <select className={field} value={form.mascot} onChange={(e) => setForm({ ...form, mascot: e.target.value })}>
                  <option value="">Auto-pick by industry</option>
                  {MASCOTS.map(([f, n]) => <option key={f} value={`/mascots/${f}`}>{n}</option>)}
                </select></label>
            </div>
            <button disabled={busy} className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper transition hover:opacity-90 disabled:opacity-50">{busy ? "Building the demo…" : "Generate demo link →"}</button>
            {err && <p className="text-sm font-medium text-red-600">{err}</p>}
          </form>
        )}

        {result && (
          <div className="mt-6 rounded-3xl border-2 border-ink bg-ink p-6 text-paper">
            <h2 className="text-lg font-bold">Demo ready 🎉</h2>
            <p className="mt-1 text-sm text-smoke">Share this link — the mascot is already trained on their business.</p>
            <div className="mt-3 flex items-stretch gap-2">
              <code className="flex-1 overflow-auto rounded-xl bg-paper px-4 py-3 text-xs text-ink">{result.link}</code>
              <button onClick={copy} className="shrink-0 rounded-xl border-2 border-paper px-4 text-sm font-semibold">{copied ? "Copied ✓" : "Copy"}</button>
            </div>
            <a href={result.link} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block rounded-full bg-paper px-5 py-2.5 text-sm font-semibold text-ink">Open the demo →</a>
          </div>
        )}
      </div>
    </main>
  );
}
