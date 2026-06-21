"use client";

import { useEffect, useState } from "react";

type U = { email: string; name: string } | null;

export default function Account() {
  const [user, setUser] = useState<U>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

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

  return (
    <main className="flex min-h-screen flex-col bg-paper text-ink" style={{ fontFamily: "ui-sans-serif,system-ui,Arial,sans-serif" }}>
      <header className="border-b-2 border-ink">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <a href="/" className="text-xl font-bold tracking-tight">Mascot<span className="text-smoke">Chatbot</span></a>
          <a href="/" className="text-sm font-medium text-smoke hover:text-ink">← Back to site</a>
        </div>
      </header>

      <div className="mx-auto w-full max-w-5xl flex-1 px-5 py-12">
        {loading ? (
          <p className="text-smoke">Loading…</p>
        ) : user ? (
          <div>
            <h1 className="text-3xl font-bold tracking-tightest">Welcome back, {user.name} 👋</h1>
            <p className="mt-1 text-smoke">{user.email}</p>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div className="rounded-3xl border-2 border-ink p-6">
                <h2 className="text-lg font-bold">Your mascot</h2>
                <p className="mt-1 text-sm text-smoke">Once your order is built, your install snippet and behavior settings (greeting, wave, wink, voice, and more) will live here.</p>
                <a href="/#pricing" className="mt-4 inline-block rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition hover:opacity-90">Start an order →</a>
              </div>
              <div className="rounded-3xl border border-ink/15 p-6 shadow-sm">
                <h2 className="text-lg font-bold">Orders</h2>
                <p className="mt-1 text-sm text-smoke">Your orders and their status will appear here.</p>
              </div>
            </div>
            <button onClick={logout} className="mt-8 rounded-full border-2 border-ink px-5 py-2.5 text-sm font-semibold transition hover:bg-ink hover:text-paper">Sign out</button>
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
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name"
                  className="w-full rounded-xl border-2 border-ink/15 px-4 py-3 outline-none focus:border-ink" />
              )}
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@business.com"
                className="w-full rounded-xl border-2 border-ink/15 px-4 py-3 outline-none focus:border-ink" />
              <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password"
                className="w-full rounded-xl border-2 border-ink/15 px-4 py-3 outline-none focus:border-ink" />
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
