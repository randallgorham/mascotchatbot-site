"use client";

import { useEffect, useRef, useState } from "react";
import { BOTS, VOICES, defaultVoiceFor } from "@/lib/bots";

type Stat = { set: boolean; last4: string; source: string };
type UsageRow = { id: string; business: string; owner: string; industry: string; plan: string; messages: number; convos: number; leads: number; updatedAt: string };
type Usage = { ok: boolean; customers: UsageRow[]; totals: { messages: number; convos: number; leads: number }; count: number; error?: string };
type Member = { email: string; role: string; addedAt?: string };
type Settings = { brain: string; voice: string; openaiVoice: string; elevenVoiceId: string; botVoices: Record<string, string>; ghlCalendarUrl: string };
type Status = {
  auth: boolean;
  signedIn?: boolean;
  email?: string | null;
  role?: string;
  manage?: boolean;
  team?: Member[];
  kv?: boolean;
  integrations?: Record<string, Stat>;
  settings?: Settings;
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
      { id: "resend", name: "Resend API Key", ph: "re_…", link: "https://resend.com/api-keys", note: "Order confirmations + login emails (recommended)" },
      { id: "mailgun", name: "Mailgun API Key", ph: "Mailgun sending key", link: "https://app.mailgun.com/", note: "Alternative email sender" },
      { id: "ghl", name: "GoHighLevel Webhook", ph: "https://services.leadconnectorhq.com/hooks/…", link: "", note: "Leads + order routing" },
    ],
  },
];

const MANAGER_TABS: [string, string][] = [
  ["integrations", "Integrations"],
  ["mascot", "Mascot"],
  ["voices", "Voices"],
  ["orders", "Orders"],
  ["customers", "Customers"],
  ["usage", "Usage"],
  ["onboarding", "Onboarding"],
  ["team", "Team"],
];
const STAFF_TABS: [string, string][] = [
  ["orders", "Orders"],
  ["customers", "Customers"],
  ["onboarding", "Onboarding"],
];

export default function Admin() {
  const [status, setStatus] = useState<Status | null>(null);
  const [tab, setTab] = useState<string>("integrations");
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [settings, setSettings] = useState<Settings>({ brain: "openai", voice: "openai", openaiVoice: "ash", elevenVoiceId: "", botVoices: {}, ghlCalendarUrl: "" });
  const [teamForm, setTeamForm] = useState({ email: "", role: "staff" });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [previewing, setPreviewing] = useState("");
  const [usage, setUsage] = useState<Usage | null>(null);
  const [usageBusy, setUsageBusy] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // owner sign-in
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [cred, setCred] = useState({ name: "", email: "", password: "" });
  const [authErr, setAuthErr] = useState("");

  async function load() {
    const r = await fetch("/api/admin/status", { cache: "no-store" });
    const d: Status = await r.json();
    setStatus(d);
    if (d.settings) setSettings({ ...d.settings, botVoices: d.settings.botVoices || {} });
    if (d.auth && !d.manage) setTab("orders"); // staff land on Orders
  }
  useEffect(() => { load(); }, []);

  async function loadUsage() {
    setUsageBusy(true);
    try {
      const r = await fetch("/api/admin/customers", { cache: "no-store" });
      const d: Usage = await r.json();
      setUsage(d);
    } catch {
      setUsage({ ok: false, customers: [], totals: { messages: 0, convos: 0, leads: 0 }, count: 0, error: "Couldn't load usage." });
    }
    setUsageBusy(false);
  }
  useEffect(() => { if (tab === "usage" && status?.manage && !usage) loadUsage(); }, [tab, status?.manage]); // eslint-disable-line react-hooks/exhaustive-deps

  async function addMember(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg("");
    const r = await fetch("/api/admin/team", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "add", email: teamForm.email, role: teamForm.role }) });
    const d = await r.json(); setBusy(false);
    if (d.ok) { setTeamForm({ email: "", role: "staff" }); setMsg("Team updated ✓"); load(); } else setMsg(d.error || "Couldn't add member.");
  }
  async function removeMember(email: string) {
    setBusy(true); setMsg("");
    const r = await fetch("/api/admin/team", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "remove", email }) });
    const d = await r.json(); setBusy(false);
    if (d.ok) { setMsg("Team updated ✓"); load(); } else setMsg(d.error || "Couldn't remove member.");
  }

  async function signIn(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setAuthErr("");
    const r = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: mode, ...cred }) });
    const d = await r.json(); setBusy(false);
    if (d.ok) { setCred({ name: "", email: "", password: "" }); load(); }
    else setAuthErr(d.error || "Sign in failed.");
  }
  async function signOut() {
    await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "logout" }) });
    load();
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
  async function deleteCustomer(email: string) {
    if (!email || !confirm("Remove " + email + " from customers? This can't be undone.")) return;
    setBusy(true); setMsg("");
    const r = await fetch("/api/admin/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: "deleteCustomer", email }) });
    const d = await r.json(); setBusy(false);
    if (d.ok) { setMsg("Customer removed ✓"); load(); } else setMsg(d.error || "Couldn't remove.");
  }
  function setBotVoice(id: string, v: string) {
    setSettings((s) => ({ ...s, botVoices: { ...(s.botVoices || {}), [id]: v } }));
  }
  async function previewVoice(botId: string, voiceId: string, name: string, industry: string) {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setPreviewing(botId);
    try {
      const line = `Hi there! I'm ${name}, your friendly ${industry} helper. I can answer questions and book your appointment right now — want me to get you scheduled?`;
      const r = await fetch("/api/tts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: line, provider: "openai", openaiVoice: voiceId }) });
      if (!r.ok) { setPreviewing(""); setMsg("Preview needs an OpenAI key connected."); return; }
      const url = URL.createObjectURL(await r.blob());
      const a = new Audio(url);
      audioRef.current = a;
      a.onended = () => { setPreviewing(""); URL.revokeObjectURL(url); };
      await a.play();
    } catch { setPreviewing(""); }
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
          <div className="mx-auto max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold">Owner sign in</h2>
            {status.signedIn ? (
              <div className="mt-2">
                <p className="text-sm text-amber-700">You&apos;re signed in as <b>{status.email}</b>, but that isn&apos;t an owner account.</p>
                <button onClick={signOut} className="mt-3 rounded-xl border-2 border-neutral-200 px-4 py-2 text-sm font-semibold hover:bg-neutral-900 hover:text-white">Sign out</button>
              </div>
            ) : (
              <>
                <p className="mt-1 text-sm text-neutral-500">{mode === "login" ? "Sign in with your owner account." : "Create your owner account."}</p>
                <a href="/api/auth/google" className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-neutral-900 px-5 py-3 font-semibold transition hover:bg-neutral-900 hover:text-white">
                  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.3-.4-3.5z" /><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 5.1 29.6 3 24 3 16 3 9.1 7.6 6.3 14.7z" /><path fill="#4CAF50" d="M24 45c5.2 0 10-2 13.6-5.2l-6.3-5.2C29.2 36 26.7 37 24 37c-5.3 0-9.7-2.6-11.3-7l-6.5 5C9.1 42.3 16 45 24 45z" /><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4-4 5.4l6.3 5.2C39.9 36 44 31 44 24c0-1.2-.1-2.3-.4-3.5z" /></svg>
                  Continue with Google
                </a>
                <div className="my-4 flex items-center gap-3 text-xs text-neutral-400"><span className="h-px flex-1 bg-neutral-200" />or<span className="h-px flex-1 bg-neutral-200" /></div>
                <form onSubmit={signIn} className="space-y-3">
                  {mode === "signup" && <input value={cred.name} onChange={(e) => setCred({ ...cred, name: e.target.value })} placeholder="Your name" className="w-full rounded-xl border-2 border-neutral-200 px-4 py-2.5 outline-none focus:border-neutral-900" />}
                  <input type="email" required value={cred.email} onChange={(e) => setCred({ ...cred, email: e.target.value })} placeholder="Owner email" className="w-full rounded-xl border-2 border-neutral-200 px-4 py-2.5 outline-none focus:border-neutral-900" />
                  <input type="password" required value={cred.password} onChange={(e) => setCred({ ...cred, password: e.target.value })} placeholder="Password" className="w-full rounded-xl border-2 border-neutral-200 px-4 py-2.5 outline-none focus:border-neutral-900" />
                  <button disabled={busy} className="w-full rounded-xl bg-neutral-900 px-5 py-2.5 font-semibold text-white transition hover:opacity-90 disabled:opacity-60">{busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create owner account"}</button>
                </form>
                {authErr && <p className="mt-3 text-sm text-red-600">{authErr}</p>}
                <p className="mt-4 text-center text-sm text-neutral-500">
                  {mode === "login" ? "First time? " : "Already set up? "}
                  <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setAuthErr(""); }} className="font-semibold text-neutral-900 underline">{mode === "login" ? "Create owner account" : "Sign in"}</button>
                </p>
                <p className="mt-2 text-center text-xs text-neutral-400">Use your owner email (set via OWNER_EMAILS in Vercel).</p>
              </>
            )}
          </div>
        )}

        {authed && (
          <>
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm text-neutral-500">Signed in as <b>{status?.email}</b></p>
              <button onClick={signOut} className="text-sm font-medium text-neutral-500 underline hover:text-neutral-900">Sign out</button>
            </div>

            {!status?.kv && (
              <div className="mb-5 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
                <b>Database not connected.</b> Create a free Vercel KV store so saved keys, orders, and customers persist.
              </div>
            )}

            <div className="mb-6 flex flex-wrap gap-2">
              {(status?.manage ? MANAGER_TABS : STAFF_TABS).map(([id, label]) => (
                <button key={id} onClick={() => setTab(id)}
                  className={"rounded-full px-4 py-2 text-sm font-semibold transition " + (tab === id ? "bg-neutral-900 text-white" : "border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-100")}>
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
                              <div><div className="font-bold">{it.name}</div><div className="text-xs text-neutral-500">{it.note}</div></div>
                              {s?.set
                                ? <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Connected ••••{s.last4}</span>
                                : <span className="shrink-0 rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-500">Not set</span>}
                            </div>
                            <div className="mt-3 flex gap-2">
                              <input type="password" value={drafts[it.id] || ""} onChange={(e) => setDrafts((x) => ({ ...x, [it.id]: e.target.value }))} placeholder={it.ph}
                                className="flex-1 rounded-xl border-2 border-neutral-200 px-4 py-2.5 text-sm outline-none focus:border-neutral-900" />
                              <button onClick={() => saveSecret(it.id)} disabled={busy || !drafts[it.id]} className="rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40">Save</button>
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
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm"><span className="mb-1 block font-semibold">Brain</span>
                    <select value={settings.brain} onChange={(e) => setSettings({ ...settings, brain: e.target.value })} className="w-full rounded-xl border-2 border-neutral-200 px-3 py-2.5 outline-none focus:border-neutral-900"><option value="openai">OpenAI (GPT)</option><option value="anthropic">Anthropic (Claude)</option></select>
                  </label>
                  <label className="block text-sm"><span className="mb-1 block font-semibold">Voice</span>
                    <select value={settings.voice} onChange={(e) => setSettings({ ...settings, voice: e.target.value })} className="w-full rounded-xl border-2 border-neutral-200 px-3 py-2.5 outline-none focus:border-neutral-900"><option value="openai">OpenAI TTS</option><option value="eleven">ElevenLabs</option></select>
                  </label>
                  <label className="block text-sm"><span className="mb-1 block font-semibold">OpenAI voice (Mr Amp)</span>
                    <select value={settings.openaiVoice} onChange={(e) => setSettings({ ...settings, openaiVoice: e.target.value })} className="w-full rounded-xl border-2 border-neutral-200 px-3 py-2.5 outline-none focus:border-neutral-900">
                      <optgroup label="Male voices">{VOICES.filter((v) => v.gender === "male").map((v) => <option key={v.id} value={v.id}>{v.label} — {v.note}</option>)}</optgroup>
                      <optgroup label="Female voices">{VOICES.filter((v) => v.gender === "female").map((v) => <option key={v.id} value={v.id}>{v.label} — {v.note}</option>)}</optgroup>
                    </select>
                  </label>
                  <label className="block text-sm"><span className="mb-1 block font-semibold">ElevenLabs voice ID</span>
                    <input value={settings.elevenVoiceId} onChange={(e) => setSettings({ ...settings, elevenVoiceId: e.target.value })} placeholder="e.g. pNInz6obpgDQGcFmaJgB" className="w-full rounded-xl border-2 border-neutral-200 px-3 py-2.5 outline-none focus:border-neutral-900" />
                  </label>
                  <label className="block text-sm sm:col-span-2"><span className="mb-1 block font-semibold">Booking calendar link (GoHighLevel)</span>
                    <input value={settings.ghlCalendarUrl} onChange={(e) => setSettings({ ...settings, ghlCalendarUrl: e.target.value })} placeholder="https://api.leadconnectorhq.com/widget/booking/XXXXXXXX" className="w-full rounded-xl border-2 border-neutral-200 px-3 py-2.5 outline-none focus:border-neutral-900" />
                    <span className="mt-1 block text-xs text-neutral-500">GHL → Calendars → your calendar → Share/Embed → copy the <b>booking widget URL</b>. This powers the &ldquo;Book a demo&rdquo; button and the /book page.</span>
                  </label>
                </div>
                <button onClick={saveSettings} disabled={busy} className="mt-4 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">Save settings</button>
                {msg && <p className="mt-3 text-sm font-medium text-neutral-700">{msg}</p>}
              </div>
            )}

            {tab === "voices" && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                  <h2 className="text-lg font-bold">Voice casting</h2>
                  <p className="mt-0.5 text-sm text-neutral-500">Pick a voice for each of our {BOTS.length} demo bots. Tap <b>▶ Preview</b> to hear it, then <b>Save casting</b>. Mr Amp&apos;s pick is what visitors hear live on the homepage.</p>
                </div>
                <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                  {BOTS.map((bot, i) => {
                    const sel = settings.botVoices?.[bot.id] || defaultVoiceFor(bot.gender);
                    return (
                      <div key={bot.id} className={"flex flex-col gap-3 p-4 sm:flex-row sm:items-center " + (i > 0 ? "border-t border-neutral-100 " : "")}>
                        <div className="sm:w-56">
                          <div className="font-bold">{bot.name}{bot.id === "amp" && <span className="ml-2 rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] font-semibold text-white align-middle">LIVE</span>}</div>
                          <div className="text-xs text-neutral-500">{bot.industry}</div>
                        </div>
                        <select value={sel} onChange={(e) => setBotVoice(bot.id, e.target.value)} className="flex-1 rounded-xl border-2 border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-900">
                          <optgroup label="Male voices">{VOICES.filter((v) => v.gender === "male").map((v) => <option key={v.id} value={v.id}>{v.label} — {v.note}</option>)}</optgroup>
                          <optgroup label="Female voices">{VOICES.filter((v) => v.gender === "female").map((v) => <option key={v.id} value={v.id}>{v.label} — {v.note}</option>)}</optgroup>
                        </select>
                        <button onClick={() => previewVoice(bot.id, sel, bot.name, bot.industry)} disabled={previewing === bot.id}
                          className="shrink-0 rounded-xl border-2 border-neutral-900 px-4 py-2.5 text-sm font-semibold transition hover:bg-neutral-900 hover:text-white disabled:opacity-50">
                          {previewing === bot.id ? "Playing…" : "▶ Preview"}
                        </button>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={saveSettings} disabled={busy} className="rounded-xl bg-neutral-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">Save casting</button>
                  {msg && <span className="text-sm font-medium text-neutral-700">{msg}</span>}
                </div>
              </div>
            )}

            {(tab === "orders" || tab === "customers" || tab === "onboarding") && (
              <DataList rows={(status?.data as any)?.[tab] || []} kind={tab} onDelete={tab === "customers" && status?.manage ? deleteCustomer : undefined} />
            )}

            {tab === "usage" && status?.manage && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold">Live chatbot usage</h2>
                    <p className="mt-0.5 text-sm text-neutral-500">Conversations, messages &amp; captured leads across every customer&apos;s bot.</p>
                  </div>
                  <button onClick={loadUsage} disabled={usageBusy} className="rounded-xl border-2 border-neutral-200 px-4 py-2 text-sm font-semibold transition hover:border-neutral-900 disabled:opacity-50">{usageBusy ? "Refreshing…" : "Refresh"}</button>
                </div>

                {usage && usage.ok && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {([["Bots", usage.count], ["Conversations", usage.totals.convos], ["Messages", usage.totals.messages], ["Leads", usage.totals.leads]] as [string, number][]).map(([k, v]) => (
                      <div key={k} className="rounded-2xl border border-neutral-200 bg-white p-4 text-center shadow-sm">
                        <div className="text-2xl font-extrabold tabular-nums">{v.toLocaleString()}</div>
                        <div className="mt-0.5 text-xs font-medium uppercase tracking-wide text-neutral-500">{k}</div>
                      </div>
                    ))}
                  </div>
                )}

                {usageBusy && !usage && <p className="text-sm text-neutral-500">Loading usage…</p>}
                {usage && !usage.ok && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{usage.error || "Couldn't load usage."}</p>}
                {usage && usage.ok && usage.customers.length === 0 && (
                  <p className="rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-500 shadow-sm">No customer bots yet. They&apos;ll appear here as customers finish onboarding.</p>
                )}

                {usage && usage.ok && usage.customers.length > 0 && (
                  <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                    <table className="w-full text-sm">
                      <thead className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
                        <tr>
                          <th className="px-4 py-3 font-semibold">Business</th>
                          <th className="px-4 py-3 font-semibold">Owner</th>
                          <th className="px-4 py-3 font-semibold">Industry</th>
                          <th className="px-4 py-3 text-right font-semibold">Convos</th>
                          <th className="px-4 py-3 text-right font-semibold">Messages</th>
                          <th className="px-4 py-3 text-right font-semibold">Leads</th>
                        </tr>
                      </thead>
                      <tbody>
                        {usage.customers.map((c) => (
                          <tr key={c.id} className="border-t border-neutral-100">
                            <td className="px-4 py-3 font-medium">{c.business || <span className="text-neutral-400">{c.id}</span>}</td>
                            <td className="px-4 py-3 text-neutral-600">{c.owner || "—"}</td>
                            <td className="px-4 py-3 text-neutral-600">{c.industry || "—"}</td>
                            <td className="px-4 py-3 text-right tabular-nums">{c.convos.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right tabular-nums">{c.messages.toLocaleString()}</td>
                            <td className="px-4 py-3 text-right font-semibold tabular-nums">{c.leads.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {tab === "team" && status?.manage && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <h2 className="text-lg font-bold">Invite a team member</h2>
                  <p className="mt-0.5 text-sm text-neutral-500">They sign in with this email (password or Google). <b>Staff</b> see Orders, Customers &amp; Onboarding only. <b>Admins</b> get full access except removing the owner.</p>
                  <form onSubmit={addMember} className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <input type="email" required value={teamForm.email} onChange={(e) => setTeamForm({ ...teamForm, email: e.target.value })} placeholder="teammate@email.com" className="flex-1 rounded-xl border-2 border-neutral-200 px-4 py-2.5 text-sm outline-none focus:border-neutral-900" />
                    <select value={teamForm.role} onChange={(e) => setTeamForm({ ...teamForm, role: e.target.value })} className="rounded-xl border-2 border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-neutral-900"><option value="staff">Staff (fulfillment/support)</option><option value="admin">Admin (full access)</option></select>
                    <button disabled={busy} className="rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50">Add</button>
                  </form>
                </div>
                <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                  <h2 className="mb-2 text-lg font-bold">Team</h2>
                  <div className="flex items-center justify-between border-b border-neutral-100 py-2.5 text-sm">
                    <div><b>{status?.email}</b> <span className="text-neutral-400">(you)</span></div>
                    <span className="rounded-full bg-neutral-900 px-2.5 py-0.5 text-xs font-semibold text-white">owner</span>
                  </div>
                  {(status?.team || []).length === 0 ? (
                    <p className="mt-3 text-sm text-neutral-500">No team members yet — invite your first hire above.</p>
                  ) : (
                    (status?.team || []).map((m) => (
                      <div key={m.email} className="flex items-center justify-between border-b border-neutral-100 py-2.5 text-sm">
                        <div>{m.email}</div>
                        <div className="flex items-center gap-3">
                          <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold text-neutral-600">{m.role}</span>
                          <button onClick={() => removeMember(m.email)} className="text-xs font-medium text-red-600 underline">remove</button>
                        </div>
                      </div>
                    ))
                  )}
                  {msg && <p className="mt-3 text-sm font-medium text-neutral-700">{msg}</p>}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function DataList({ rows, kind, onDelete }: { rows: any[]; kind: string; onDelete?: (email: string) => void }) {
  if (!rows || rows.length === 0) {
    const empty: Record<string, string> = {
      orders: "No orders yet. They'll appear here once checkout is live.",
      customers: "No customers yet. They'll appear here once accounts are live.",
      onboarding: "No onboarding submissions yet.",
    };
    return <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-10 text-center text-sm text-neutral-500">{empty[kind]}</div>;
  }
  return (
    <div className="space-y-3">
      {rows.map((r, i) => (
        <div key={i} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="font-bold">{r.business || r.name || r.email || r.id || "Record " + (i + 1)}</div>
            <div className="flex items-center gap-3">
              {r.status && <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600">{r.status}</span>}
              {onDelete && r.email && <button onClick={() => onDelete(r.email)} className="text-xs font-medium text-red-600 underline">remove</button>}
            </div>
          </div>
          {(r.email || r.plan || r.website || r.createdAt) && (
            <div className="mt-1 text-sm text-neutral-500">{[r.email, r.plan, r.website, r.createdAt].filter(Boolean).join(" · ")}</div>
          )}
        </div>
      ))}
    </div>
  );
}
