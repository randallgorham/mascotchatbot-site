"use client";

import { useEffect, useState } from "react";

type Stat = { set: boolean; last4: string; source: string };
type Status = {
  auth: boolean;
  kv?: boolean;
  integrations?: { openai: Stat; anthropic: Stat; eleven: Stat; ghl: Stat };
  settings?: { brain: string; voice: string; openaiVoice: string; elevenVoiceId: string };
};

const INTEGRATIONS = [
  { id: "openai", name: "OpenAI", desc: "Powers Mr Amp's brain (GPT) and the natural voice (TTS).", ph: "sk-...", link: "https://platform.openai.com/api-keys" },
  { id: "anthropic", name: "Anthropic (Claude)", desc: "Alternative AI brain for Mr Amp.", ph: "sk-ant-...", link: "https://console.anthropic.com/settings/keys" },
  { id: "eleven", name: "ElevenLabs", desc: "Premium, most lifelike voice option.", ph: "Your ElevenLabs API key", link: "https://elevenlabs.io/app/settings/api-keys" },
  { id: "ghl", name: "GoHighLevel", desc: "Lead capture webhook (already wired into the demo form).", ph: "https://services.leadconnectorhq.com/hooks/...", link: "" },
] as const;

export default function Admin() {
  const [status, setStatus] = useState<Status | null>(null);
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [settings, setSettings] = useState({ brain: "openai", voice: "openai", openaiVoice: "onyx", elevenVoiceId: "" });

  async function load() {
    const r = await fetch("/api/admin/status", { cache: "no-store" });
    const d: Status = await r.json();
    setStatus(d);
    if (d.settings) setSettings(d.settings);
  }
  useEffect(() => { load(); }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg("");
    const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) });
    const d = await r.json(); setBusy(false);
    if (d.ok) { setPw(""); load(); } else setMsg(d.error || "Login failed.");
  }
  async function saveSecret(id: string) {
    const value = drafts[id]; if (!value) return;
    setBusy(true); setMsg("");
    const r = await fetch("/api/admin/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "secret", provider: id, value }) });
    const d = await r.json(); setBusy(false);
    if (d.ok) { setDrafts((x) => ({ ...x, [id]: "" })); setMsg("Saved " + id + " ✓"); load(); } else setMsg(d.error || "Save failed.");
  }
  async function saveSettings() {
    setBusy(true); setMsg("");
    const r = await fetch("/api/admin/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "settings", ...settings }) });
    const d = await r.json(); setBusy(false);
    setMsg(d.ok ? "Settings saved ✓" : d.error || "Save failed.");
  }

  const authed = status && status.auth;

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900" style={{ fontFamily: "ui-sans-serif,system-ui,Arial,sans-serif" }}>
      <div className="mx-auto max-w-3xl px-5 py-12">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 text-white font-bold">M</div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">MascotChatbot — Admin</h1>
            <p className="text-sm text-neutral-500">Integrations & API keys</p>
          </div>
        </div>

        {!status && <p className="text-neutral-500">Loading…</p>}

        {status && !authed && (
          <form onSubmit={login} className="max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-neutral-500">Admin password</label>
            <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Enter password"
              className="w-full rounded-xl border-2 border-neutral-200 px-4 py-3 outline-none focus:border-neutral-900" />
            <button disabled={busy} className="mt-3 w-full rounded-xl bg-neutral-900 px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-50">
              {busy ? "Checking…" : "Unlock"}
            </button>
            {msg && <p className="mt-3 text-sm text-red-600">{msg}</p>}
          </form>
        )}

        {authed && (
          <div className="space-y-6">
            {!status?.kv && (
              <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
                <b>Database not connected.</b> Create a free Vercel KV store (Storage tab in your Vercel project) so saved keys persist. Until then, the site uses keys set as Vercel environment variables.
              </div>
            )}

            {INTEGRATIONS.map((it) => {
              const s = status?.integrations?.[it.id as "openai"];
              return (
                <div key={it.id} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-bold">{it.name}</h2>
                      <p className="mt-0.5 text-sm text-neutral-500">{it.desc}</p>
                    </div>
                    {s?.set ? (
                      <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Connected ••••{s.last4}</span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-500">Not connected</span>
                    )}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <input type="password" value={drafts[it.id] || ""} onChange={(e) => setDrafts((x) => ({ ...x, [it.id]: e.target.value }))}
                      placeholder={it.ph}
                      className="flex-1 rounded-xl border-2 border-neutral-200 px-4 py-2.5 text-sm outline-none focus:border-neutral-900" />
                    <button onClick={() => saveSecret(it.id)} disabled={busy || !drafts[it.id]}
                      className="rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40">Save</button>
                  </div>
                  {it.link && <a href={it.link} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs font-medium text-neutral-500 underline hover:text-neutral-900">Get a key →</a>}
                </div>
              );
            })}

            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold">Mr Amp settings</h2>
              <p className="mt-0.5 text-sm text-neutral-500">Choose which connected services power the mascot.</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="mb-1 block font-semibold">Brain</span>
                  <select value={settings.brain} onChange={(e) => setSettings({ ...settings, brain: e.target.value })} className="w-full rounded-xl border-2 border-neutral-200 px-3 py-2.5 outline-none focus:border-neutral-900">
                    <option value="openai">OpenAI (GPT)</option>
                    <option value="anthropic">Anthropic (Claude)</option>
                  </select>
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-semibold">Voice</span>
                  <select value={settings.voice} onChange={(e) => setSettings({ ...settings, voice: e.target.value })} className="w-full rounded-xl border-2 border-neutral-200 px-3 py-2.5 outline-none focus:border-neutral-900">
                    <option value="openai">OpenAI TTS</option>
                    <option value="eleven">ElevenLabs</option>
                  </select>
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-semibold">OpenAI voice</span>
                  <select value={settings.openaiVoice} onChange={(e) => setSettings({ ...settings, openaiVoice: e.target.value })} className="w-full rounded-xl border-2 border-neutral-200 px-3 py-2.5 outline-none focus:border-neutral-900">
                    {["onyx", "echo", "alloy", "fable", "nova", "shimmer"].map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                </label>
                <label className="block text-sm">
                  <span className="mb-1 block font-semibold">ElevenLabs voice ID</span>
                  <input value={settings.elevenVoiceId} onChange={(e) => setSettings({ ...settings, elevenVoiceId: e.target.value })} placeholder="e.g. pNInz6obpgDQGcFmaJgB"
                    className="w-full rounded-xl border-2 border-neutral-200 px-3 py-2.5 outline-none focus:border-neutral-900" />
                </label>
              </div>
              <button onClick={saveSettings} disabled={busy} className="mt-4 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">Save settings</button>
            </div>

            {msg && <p className="text-sm font-medium text-neutral-700">{msg}</p>}
            <p className="text-xs text-neutral-400">Keys are encrypted before storage and never shown in full. This page is private — only someone with the admin password can reach it.</p>
          </div>
        )}
      </div>
    </main>
  );
}
