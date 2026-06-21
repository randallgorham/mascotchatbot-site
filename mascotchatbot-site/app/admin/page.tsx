"use client";

import { useEffect, useState } from "react";

type Stat = { set: boolean; last4: string; source: string };
type Status = {
  auth: boolean;
  kv?: boolean;
  integrations?: Record<string, Stat>;
  settings?: { brain: string; voice: string; openaiVoice: string; elevenVoiceId: string };
  data?: { orders: any[]; customers: any[]; onboarding: any[] };
};

const GROUPS: { title: string; items: { id: string; name: string; ph: string; link: string; note: string }[] }[] = [
  {
    title: "AI & Voice",
    items: [
      { id: "openai", name: "OpenAI", ph: "sk-...", link: "https://platform.openai.com/api-keys", note: "Mr Amp's brain (GPT) + natural voice (TTS)" },
      { id: "anthropic", name: "Anthropic (Claude)", ph: "sk-ant-...", link: "https://console.anthropic.com/settings/keys", note: "Alternative AI brain" },
      { id: "eleven", name: "ElevenLabs", ph: "ElevenLabs API key", link: "https://elevenlabs.io/app/settings/api-keys", note: "Premium, most lifelike voice" },
    ],
  },
  {
    title: "Payments — Stripe",
    items: [
      { id: "stripe_secret", name: "Stripe Secret Key", ph: "sk_live_… or sk_test_…", link: "https://dashboard.stripe.com/apikeys", note: "Server key that creates charges" },
      { id: "stripe_pub", name: "Stripe Publishable Key", ph: "pk_live_… or pk_test_…", link: "https://dashboard.stripe.com/apikeys", note: "Browser checkout key" },
      { id: "stripe_webhook", name: "Stripe Webhook Secret", ph: "whsec_…", link: "https://dashboard.stripe.com/webhooks", note: "Confirms paid orders" },
    ],
  },
  {
    title: "Customer Login",
    items: [
      { id: "google_id", name: "Google Client ID", ph: "…apps.googleusercontent.com", link: "https://console.cloud.google.com/apis/credentials", note: "Google sign-in" },
      { id: "google_secret", name: "Google Client Secret", ph: "GOCSPX-…", link: "https://console.cloud.google.com/apis/credentials", note: "Google sign-in" },
      { id: "auth_secret", name: "Auth Secret", ph: "any long random string", link: "", note: "Encrypts customer sessions" },
    ],
  },
  {
    title: "Email & CRM",
    items: [
      { id: "mailgun", name: "Mailgun API Key", ph: "Mailgun sending key", link: "https://app.mailgun.com/", note: "Login links + order emails" },
      { id: "ghl", name: "GoHighLevel Webhook", ph: "https://services.leadconnectorhq.com/hooks/…", link: "", note: "Leads + order routing" },
    ],
  },
];

const TABS = [
  ["integrations", "Integrations"],
  ["mascot", "Mascot"],
  ["orders", "Orders"],
  ["customers", "Customers"],
  ["onboarding", "Onboarding"],
] as const;

export default function Admin() {
  const [status, setStatus] = useState<Status | null>(null);
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<string>("integrations");
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
    if (d.ok) { setDrafts((x) => ({ ...x, [id]: "" })); setMsg("Saved ✓"); load(); } else setMsg(d.error || "Save failed.");
  }
  async function saveSettings() {
    setBusy(true); setMsg("");
    const r = await fetch("/api/admin/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "settings", ...settings }) });
    const d = await r.json(); setBusy(false);
    setMsg(d.ok ? "Settings saved ✓" : d.error || "Save failed.");
  }

  const authed = status && status.auth;
  const connectedCount = status?.integrations ? Object.values(status.integrations).filter((s) => s.set).length : 0;

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900" style={{ fontFamily: "ui-sans-serif,system-ui,Arial,sans-serif" }}>
      <div className="mx-auto max-w-4xl px-5 py-12">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-900 font-bold text-white">M</div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">MascotChatbot — Owner Admin</h1>
            <p className="text-sm text-neutral-500">Integrations, orders & customers</p>
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
          <>
            {!status?.kv && (
              <div className="mb-5 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
                <b>Database not connected.</b> Create a free Vercel KV store (Storage tab in your Vercel project) so saved keys, orders, and customers persist. Until then, the site uses keys set as Vercel environment variables.
              </div>
            )}

            <div className="mb-6 flex flex-wrap gap-2">
              {TABS.map(([id, label]) => (
                <button key={id} onClick={() => setTab(id)}
                  className={"rounded-full px-4 py-2 text-sm font-semibold transition " + (tab === id ? "bg-neutral-900 text-white" : "bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200")}>
                  {label}
                  {id === "orders" && status?.data ? " (" + status.data.orders.length + ")" : ""}
                  {id === "customers" && status?.data ? " (" + status.data.customers.length + ")" : ""}
                  {id === "onboarding" && status?.data ? " (" + status.data.onboarding.length + ")" : ""}
                </button>
              ))}
            </div>

            {tab === "integrations" && (
              <div className="space-y-6">
                <p className="text-sm text-neutral-500">{connectedCount} connected. Keys are encrypted and shown only as ••••last4.</p>
                {GROUPS.map((g) => (
                  <div key={g.title}>
                    <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-neutral-500">{g.title}</h2>
                    <div className="space-y-3">
                      {g.items.map((it) => {
                        const s = status?.integrations?.[it.id];
                        return (
                          <div key={it.id} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="font-bold">{it.name}</div>
                                <div className="text-xs text-neutral-500">{it.note}</div>
                              </div>
                              {s?.set
                                ? <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Connected ••••{s.last4}</span>
                                : <span className="shrink-0 rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-500">Not set</span>}
                            </div>
                            <div className="mt-3 flex gap-2">
                              <input type="password" value={drafts[it.id] || ""} onChange={(e) => setDrafts((x) => ({ ...x, [it.id]: e.target.value }))}
                                placeholder={it.ph}
                                className="flex-1 rounded-xl border-2 border-neutral-200 px-4 py-2.5 text-sm outline-none focus:border-neutral-900" />
                              <button onClick={() => saveSecret(it.id)} disabled={busy || !drafts[it.id]}
                                className="rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40">Save</button>
                            </div>
                            {it.link && <a href={it.link} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-xs font-medium text-neutral-500 underline hover:text-neutral-900">Get this key →</a>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {msg && <p className="text-sm font-medium text-neutral-700">{msg}</p>}
              </div>
            )}

            {tab === "mascot" && (
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold">Mr Amp settings</h2>
                <p className="mt-0.5 text-sm text-neutral-500">Choose which connected services power the mascot.</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm"><span className="mb-1 block font-semibold">Brain</span>
                    <select value={settings.brain} onChange={(e) => setSettings({ ...settings, brain: e.target.value })} className="w-full rounded-xl border-2 border-neutral-200 px-3 py-2.5 outline-none focus:border-neutral-900">
                      <option value="openai">OpenAI (GPT)</option><option value="anthropic">Anthropic (Claude)</option>
                    </select>
                  </label>
                  <label className="block text-sm"><span className="mb-1 block font-semibold">Voice</span>
                    <select value={settings.voice} onChange={(e) => setSettings({ ...settings, voice: e.target.value })} className="w-full rounded-xl border-2 border-neutral-200 px-3 py-2.5 outline-none focus:border-neutral-900">
                      <option value="openai">OpenAI TTS</option><option value="eleven">ElevenLabs</option>
                    </select>
                  </label>
                  <label className="block text-sm"><span className="mb-1 block font-semibold">OpenAI voice</span>
                    <select value={settings.openaiVoice} onChange={(e) => setSettings({ ...settings, openaiVoice: e.target.value })} className="w-full rounded-xl border-2 border-neutral-200 px-3 py-2.5 outline-none focus:border-neutral-900">
                      {["onyx", "echo", "alloy", "fable", "nova", "shimmer"].map((v) => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </label>
                  <label className="block text-sm"><span className="mb-1 block font-semibold">ElevenLabs voice ID</span>
                    <input value={settings.elevenVoiceId} onChange={(e) => setSettings({ ...settings, elevenVoiceId: e.target.value })} placeholder="e.g. pNInz6obpgDQGcFmaJgB"
                      className="w-full rounded-xl border-2 border-neutral-200 px-3 py-2.5 outline-none focus:border-neutral-900" />
                  </label>
                </div>
                <button onClick={saveSettings} disabled={busy} className="mt-4 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">Save settings</button>
                {msg && <p className="mt-3 text-sm font-medium text-neutral-700">{msg}</p>}
              </div>
            )}

            {(tab === "orders" || tab === "customers" || tab === "onboarding") && (
              <DataList rows={(status?.data as any)?.[tab] || []} kind={tab} />
            )}
          </>
        )}
      </div>
    </main>
  );
}

function DataList({ rows, kind }: { rows: any[]; kind: string }) {
  if (!rows || rows.length === 0) {
    const empty: Record<string, string> = {
      orders: "No orders yet. They'll appear here once checkout is live.",
      customers: "No customers yet. They'll appear here once accounts are live.",
      onboarding: "No onboarding submissions yet. They'll appear once the intake form is live.",
    };
    return (
      <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center text-sm text-neutral-500">
        {empty[kind]}
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {rows.map((r, i) => (
        <div key={i} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="font-bold">{r.business || r.name || r.email || r.id || "Record " + (i + 1)}</div>
            {r.status && <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">{r.status}</span>}
          </div>
          {(r.email || r.plan || r.website || r.createdAt) && (
            <div className="mt-1 text-sm text-neutral-500">
              {[r.email, r.plan, r.website, r.createdAt].filter(Boolean).join(" · ")}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
