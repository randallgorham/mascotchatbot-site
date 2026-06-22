"use client";

import { useEffect, useState } from "react";
import { VOICES } from "@/lib/bots";

type U = { email: string; name: string } | null;
type Bot = {
  id: string; business: string; industry: string; about: string; facts: string;
  cta: string; ctaUrl: string; greet: boolean; wave: boolean; wink: boolean;
  voice: string; accent: string; image: string; badge: boolean; plan: string;
};

export default function Account() {
  const [user, setUser] = useState<U>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [bot, setBot] = useState<Bot | null>(null);
  const [saved, setSaved] = useState("");
  const [copied, setCopied] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  async function refresh() {
    const r = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "me" }) });
    const d = await r.json();
    setUser(d.user || null);
    setLoading(false);
  }
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("error");
    if (p === "google_not_configured") setErr("Google sign-in isn't set up yet.");
    else if (p) setErr("Google sign-in didn't complete — please try again.");
    refresh();
  }, []);
  useEffect(() => {
    if (!user) { setBot(null); return; }
    fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "getBot" }) })
      .then((r) => r.json()).then((d) => { if (d.ok) setBot(d.bot); }).catch(() => {});
  }, [user]);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr("");
    const r = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: mode, ...form }) });
    const d = await r.json(); setBusy(false);
    if (d.ok) { setUser(d.user); setForm({ name: "", email: "", password: "" }); }
    else setErr(d.error || "Something went wrong.");
  }
  async function logout() {
    await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "logout" }) });
    setUser(null);
  }
  function setB<K extends keyof Bot>(k: K, v: Bot[K]) { setBot((b) => (b ? { ...b, [k]: v } : b)); }
  async function saveBot() {
    if (!bot) return; setBusy(true); setSaved("");
    const r = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "saveBot", bot }) });
    const d = await r.json(); setBusy(false);
    if (d.ok) { setBot(d.bot); setSaved("Saved ✓"); } else setSaved(d.error || "Couldn't save.");
  }
  const snippet = bot ? `<script src="https://www.mascotchatbot.com/widget.js" data-bot="${bot.id}" async></script>` : "";
  function copy() { if (snippet) navigator.clipboard.writeText(snippet).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); }); }
  function preview() {
    if (!bot || previewing) return;
    const s = document.createElement("script");
    s.src = "/widget.js"; s.setAttribute("data-bot", bot.id); s.async = true;
    document.body.appendChild(s); setPreviewing(true);
  }

  const field = "w-full rounded-xl border-2 border-ink/15 px-4 py-2.5 outline-none focus:border-ink text-sm";

  return (
    <main className="flex min-h-screen flex-col bg-paper text-ink" style={{ fontFamily: "ui-sans-serif,system-ui,Arial,sans-serif" }}>
      <header className="border-b-2 border-ink">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <a href="/" className="text-xl font-bold tracking-tight">Mascot<span className="text-smoke">Chatbot</span></a>
          <a href="/" className="text-sm font-medium text-smoke hover:text-ink">← Back to site</a>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl flex-1 px-5 py-12">
        {loading ? (
          <p className="text-smoke">Loading…</p>
        ) : user ? (
          <div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tightest">Welcome back, {user.name} 👋</h1>
                <p className="mt-1 text-smoke">{user.email}</p>
              </div>
              <button onClick={logout} className="shrink-0 rounded-full border-2 border-ink px-4 py-2 text-sm font-semibold transition hover:bg-ink hover:text-paper">Sign out</button>
            </div>

            {!bot ? (
              <p className="mt-8 text-smoke">Setting up your mascot…</p>
            ) : (
              <div className="mt-8 space-y-6">
                <div className="rounded-3xl border-2 border-ink p-6">
                  <h2 className="text-lg font-bold">Your chatbot</h2>
                  <p className="mt-0.5 text-sm text-smoke">Tell your mascot about your business. It uses this to answer your visitors and guide them to act.</p>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm"><span className="mb-1 block font-semibold">Business name</span>
                      <input className={field} value={bot.business} onChange={(e) => setB("business", e.target.value)} placeholder="Acme Electric" /></label>
                    <label className="block text-sm"><span className="mb-1 block font-semibold">Industry</span>
                      <input className={field} value={bot.industry} onChange={(e) => setB("industry", e.target.value)} placeholder="Electrician / HVAC / Dental…" /></label>
                    <label className="block text-sm sm:col-span-2"><span className="mb-1 block font-semibold">What you do</span>
                      <textarea className={field} rows={2} value={bot.about} onChange={(e) => setB("about", e.target.value)} placeholder="Residential & commercial electrical service across the metro area, 24/7 emergencies." /></label>
                    <label className="block text-sm sm:col-span-2"><span className="mb-1 block font-semibold">Key facts the bot should know</span>
                      <textarea className={field} rows={4} value={bot.facts} onChange={(e) => setB("facts", e.target.value)} placeholder={"Hours: Mon–Fri 7–6\nService area: ...\nServices & typical pricing: ...\nCommon questions: ..."} />
                      <span className="mt-1 block text-xs text-smoke">Hours, service area, services, pricing, FAQs — anything you want it to answer accurately.</span></label>
                    <label className="block text-sm"><span className="mb-1 block font-semibold">Main goal (call to action)</span>
                      <input className={field} value={bot.cta} onChange={(e) => setB("cta", e.target.value)} placeholder="book an appointment" /></label>
                    <label className="block text-sm"><span className="mb-1 block font-semibold">Action link (optional)</span>
                      <input className={field} value={bot.ctaUrl} onChange={(e) => setB("ctaUrl", e.target.value)} placeholder="https://…/book" /></label>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm"><span className="mb-1 block font-semibold">Voice</span>
                      <select className={field} value={bot.voice} onChange={(e) => setB("voice", e.target.value)}>
                        <optgroup label="Male voices">{VOICES.filter((v) => v.gender === "male").map((v) => <option key={v.id} value={v.id}>{v.label} — {v.note}</option>)}</optgroup>
                        <optgroup label="Female voices">{VOICES.filter((v) => v.gender === "female").map((v) => <option key={v.id} value={v.id}>{v.label} — {v.note}</option>)}</optgroup>
                      </select></label>
                    <label className="block text-sm"><span className="mb-1 block font-semibold">Accent color</span>
                      <input type="color" className="h-11 w-full rounded-xl border-2 border-ink/15 bg-white px-2" value={bot.accent} onChange={(e) => setB("accent", e.target.value)} /></label>
                    <label className="block text-sm sm:col-span-2"><span className="mb-1 block font-semibold">Mascot image URL (optional)</span>
                      <input className={field} value={bot.image} onChange={(e) => setB("image", e.target.value)} placeholder="Leave blank to use your delivered mascot" /></label>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-5">
                    {([["greet", "Greet every visitor"], ["wave", "Wave"], ["wink", "Wink"]] as [keyof Bot, string][]).map(([k, label]) => (
                      <label key={k} className="flex items-center gap-2 text-sm font-medium">
                        <input type="checkbox" className="h-4 w-4" checked={!!bot[k]} onChange={(e) => setB(k, e.target.checked as never)} />{label}
                      </label>
                    ))}
                  </div>

                  <div className="mt-6 flex items-center gap-3">
                    <button onClick={saveBot} disabled={busy} className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-paper transition hover:opacity-90 disabled:opacity-50">{busy ? "Saving…" : "Save settings"}</button>
                    <button onClick={preview} disabled={previewing} className="rounded-full border-2 border-ink px-5 py-2.5 text-sm font-semibold transition hover:bg-ink hover:text-paper disabled:opacity-50">{previewing ? "Preview loaded ↘" : "Preview it here"}</button>
                    {saved && <span className="text-sm font-medium text-smoke">{saved}</span>}
                  </div>
                </div>

                <div className="rounded-3xl border border-ink/15 p-6 shadow-sm">
                  <h2 className="text-lg font-bold">Install on your website</h2>
                  <p className="mt-0.5 text-sm text-smoke">Paste this one line into your site (just before <code>&lt;/body&gt;</code>). Works on any site — WordPress, Squarespace, Wix, custom. Update your settings anytime above; the code never changes.</p>
                  <div className="mt-3 flex items-stretch gap-2">
                    <code className="flex-1 overflow-auto rounded-xl bg-ink px-4 py-3 text-xs text-paper">{snippet}</code>
                    <button onClick={copy} className="shrink-0 rounded-xl border-2 border-ink px-4 text-sm font-semibold transition hover:bg-ink hover:text-paper">{copied ? "Copied ✓" : "Copy"}</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mx-auto max-w-sm">
            <h1 className="text-3xl font-bold tracking-tightest">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
            <p className="mt-1 text-smoke">{mode === "login" ? "Sign in to manage your mascot." : "Sign up to order and manage your mascot."}</p>

            <a href="/api/auth/google" className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-ink bg-paper px-5 py-3 font-semibold transition hover:bg-ink hover:text-paper">
              <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 5.1 29.6 3 24 3 16 3 9.1 7.6 6.3 14.7z"/><path fill="#4CAF50" d="M24 45c5.2 0 10-2 13.6-5.2l-6.3-5.2C29.2 36 26.7 37 24 37c-5.3 0-9.7-2.6-11.3-7l-6.5 5C9.1 42.3 16 45 24 45z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4-4 5.4l6.3 5.2C39.9 36 44 31 44 24c0-1.2-.1-2.3-.4-3.5z"/></svg>
              Continue with Google
            </a>

            <div className="my-5 flex items-center gap-3 text-xs text-smoke"><span className="h-px flex-1 bg-ink/10" />or<span className="h-px flex-1 bg-ink/10" /></div>

            <form onSubmit={submit} className="space-y-3">
              {mode === "signup" && (
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" className={field} />
              )}
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@business.com" className={field} />
              <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password" className={field} />
              <button disabled={busy} className="w-full rounded-xl bg-ink px-5 py-3 font-semibold text-paper transition hover:opacity-90 disabled:opacity-60">
                {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
              </button>
            </form>
            {err && <p className="mt-3 text-sm font-medium text-red-600">{err}</p>}
            <p className="mt-5 text-center text-sm text-smoke">
              {mode === "login" ? "New here? " : "Already have an account? "}
              <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setErr(""); }} className="font-semibold text-ink underline">
                {mode === "login" ? "Create an account" : "Sign in"}
              </button>
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
