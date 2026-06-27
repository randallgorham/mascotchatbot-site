"use client";

import SiteHeader from "@/components/SiteHeader";
import { useEffect, useState } from "react";
import { VOICES } from "@/lib/bots";

type U = { email: string; name: string } | null;
type Bot = {
  id: string; business: string; industry: string; about: string; facts: string; notes: string;
  cta: string; ctaUrl: string; greet: boolean; wave: boolean; wink: boolean;
  voice: string; accent: string; image: string; badge: boolean; plan: string; trialEnds?: string;
};
type LeadRow = { id: string; name?: string; email?: string; phone?: string; message: string; at: string; transcript?: { role: string; content: string }[] };
type Day = { day: string; convos: number; leads: number };

const MASCOTS: [string, string][] = [
  ["dr-volt-1", "Dr. Volt"], ["hvac", "Reggie"], ["06-plumber-home-services-male", "Max"],
  ["04-dentist-male", "Dr. Bright"], ["01-realtor-female-classic", "Ava"], ["vet", "Bella"],
  ["hair", "Gigi"], ["nail", "Priya"], ["chef", "Theo"], ["20-attorney-male", "Vance"],
  ["18-gym-instructor-female-blonde", "Brooke"], ["landscaper", "Diego"],
];
const mascotExt = (img: string) => (/^(dr-volt-1|hvac|vet|hair|nail|chef|tattoo|massage|barber|florist|therapist|landscaper)$/.test(img) ? "png" : "jpg");
const mascotUrl = (img: string) => `/mascots/${img}.${mascotExt(img)}`;

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
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [step, setStep] = useState(0);
  const [wizardDone, setWizardDone] = useState(false);
  const [stats, setStats] = useState<{ messages: number; convos: number; leads: number } | null>(null);
  const [series, setSeries] = useState<Day[]>([]);
  const [site, setSite] = useState("");
  const [autoBusy, setAutoBusy] = useState(false);
  const [autoMsg, setAutoMsg] = useState("");
  const [openLead, setOpenLead] = useState("");
  const [verifyUrl, setVerifyUrl] = useState("");
  const [verifyBusy, setVerifyBusy] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [ref, setRef] = useState<{ code: string; count: number; paid: number; earned: number } | null>(null);
  const [refCopied, setRefCopied] = useState(false);

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
    fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "leads" }) })
      .then((r) => r.json()).then((d) => { if (d.ok && Array.isArray(d.leads)) setLeads(d.leads); }).catch(() => {});
    fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "stats" }) })
      .then((r) => r.json()).then((d) => { if (d.ok && d.stats) setStats(d.stats); if (d.ok && Array.isArray(d.series)) setSeries(d.series); }).catch(() => {});
    fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "referrals" }) })
      .then((r) => r.json()).then((d) => { if (d.ok) setRef({ code: d.code, count: d.count, paid: d.paid, earned: d.earned }); }).catch(() => {});
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
  async function resizeToDataUrl(file: File, max = 512): Promise<string> {
    const blob = new Blob([await file.arrayBuffer()], { type: file.type || "image/png" });
    const bmp = await createImageBitmap(blob);
    const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const w = Math.max(1, Math.round(bmp.width * scale)), h = Math.max(1, Math.round(bmp.height * scale));
    const canvas = document.createElement("canvas"); canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d"); if (ctx) ctx.drawImage(bmp, 0, 0, w, h);
    return canvas.toDataURL("image/png");
  }
  async function uploadArt(file?: File | null) {
    if (!file) return; setBusy(true); setSaved("");
    try {
      const dataUrl = await resizeToDataUrl(file, 512);
      const r = await fetch("/api/mascot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ dataUrl }) });
      const d = await r.json();
      if (d.ok) { setB("image", d.image as string); setSaved("Artwork uploaded ✓"); } else setSaved(d.error || "Upload failed.");
    } catch { setSaved("Upload failed — try a smaller image."); }
    setBusy(false);
  }

  async function autofill() {
    if (!site.trim() || autoBusy) return;
    setAutoBusy(true); setAutoMsg("");
    try {
      const r = await fetch("/api/scrape", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: site }) });
      const d = await r.json();
      if (d.ok && d.facts) {
        setB("facts", bot && bot.facts ? bot.facts + "\n\n" + d.facts : d.facts);
        if (!bot?.ctaUrl) setB("ctaUrl", d.source || "");
        setAutoMsg(d.ai ? "Pulled and summarized from your site ✓ — review & edit below." : "Pulled text from your site ✓ — trim it down below.");
      } else setAutoMsg(d.error || "Couldn't read that site.");
    } catch { setAutoMsg("Couldn't reach that site."); }
    setAutoBusy(false);
  }
  async function verifyInstall() {
    if (!bot || verifyBusy) return;
    const u = verifyUrl.trim() || site.trim();
    if (!u) { setVerifyMsg({ ok: false, text: "Enter the URL where you installed the widget." }); return; }
    setVerifyBusy(true); setVerifyMsg(null);
    try {
      const r = await fetch("/api/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: u, botId: bot.id }) });
      const d = await r.json();
      if (d.ok) setVerifyMsg({ ok: !!d.installed, text: d.message });
      else setVerifyMsg({ ok: false, text: d.error || "Couldn't check that page." });
    } catch { setVerifyMsg({ ok: false, text: "Couldn't reach that page." }); }
    setVerifyBusy(false);
  }

  const field = "w-full rounded-xl border-2 border-ink/15 px-4 py-2.5 outline-none focus:border-ink text-sm";
  const needsSetup = !!bot && !bot.industry && !bot.about && !bot.facts && !wizardDone;
  const refLink = ref ? `${typeof window !== "undefined" ? window.location.origin : "https://www.mascotchatbot.com"}/?ref=${ref.code}` : "";
  const trialDays = bot && bot.plan === "trial" && bot.trialEnds ? Math.max(0, Math.ceil((new Date(bot.trialEnds).getTime() - Date.now()) / 86400000)) : null;

  return (
    <main className="flex min-h-screen flex-col bg-paper text-ink" style={{ fontFamily: "ui-sans-serif,system-ui,Arial,sans-serif" }}>
      <SiteHeader />

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
            ) : needsSetup ? (
              <div className="mt-8">
                <div className="rounded-3xl border-2 border-ink p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold">Let&apos;s set up your mascot</h2>
                    <span className="text-xs font-semibold text-smoke">Step {step + 1} of 4</span>
                  </div>
                  <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-ink/10"><div className="h-full rounded-full bg-ink transition-all" style={{ width: `${((step + 1) / 4) * 100}%` }} /></div>

                  {step === 0 && (
                    <div className="space-y-4">
                      <p className="text-sm text-smoke">Tell us the basics so your mascot can introduce your business.</p>
                      <label className="block text-sm"><span className="mb-1 block font-semibold">Business name</span>
                        <input className={field} value={bot.business} onChange={(e) => setB("business", e.target.value)} placeholder="Acme Electric" /></label>
                      <label className="block text-sm"><span className="mb-1 block font-semibold">Industry</span>
                        <input className={field} value={bot.industry} onChange={(e) => setB("industry", e.target.value)} placeholder="Electrician / HVAC / Dental…" /></label>
                    </div>
                  )}
                  {step === 1 && (
                    <div>
                      <p className="mb-4 text-sm text-smoke">Pick your mascot — you can change it anytime.</p>
                      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                        {MASCOTS.map(([img, name]) => { const url = mascotUrl(img); const active = bot.image === url; return (
                          <button key={img} type="button" onClick={() => setB("image", url)} className={"flex flex-col items-center rounded-2xl border-2 p-2 transition " + (active ? "border-ink ring-2 ring-[#e3342b]/30" : "border-ink/15 hover:border-ink/40")}>
                            <img src={url} alt={name} className="h-20 w-full object-contain" />
                            <span className="mt-1 text-[11px] font-semibold">{name}</span>
                          </button> ); })}
                        <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink/30 p-2 text-center transition hover:border-ink/60">
                          <span className="text-2xl leading-none">＋</span>
                          <span className="mt-1 text-[11px] font-semibold">Upload your own</span>
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadArt(e.target.files?.[0])} />
                        </label>
                      </div>
                      {bot.image && bot.image.indexOf("/api/mascot") === 0 && <p className="mt-3 text-xs font-medium text-smoke">Your custom artwork is uploaded ✓</p>}
                    </div>
                  )}
                  {step === 2 && (
                    <div className="space-y-4">
                      <p className="text-sm text-smoke">Choose a voice and your brand color.</p>
                      <label className="block text-sm"><span className="mb-1 block font-semibold">Voice</span>
                        <select className={field} value={bot.voice} onChange={(e) => setB("voice", e.target.value)}>
                          <optgroup label="Male voices">{VOICES.filter((v) => v.gender === "male").map((v) => <option key={v.id} value={v.id}>{v.label} — {v.note}</option>)}</optgroup>
                          <optgroup label="Female voices">{VOICES.filter((v) => v.gender === "female").map((v) => <option key={v.id} value={v.id}>{v.label} — {v.note}</option>)}</optgroup>
                        </select></label>
                      <label className="block text-sm"><span className="mb-1 block font-semibold">Accent color</span>
                        <input type="color" className="h-11 w-full rounded-xl border-2 border-ink/15 bg-white px-2" value={bot.accent} onChange={(e) => setB("accent", e.target.value)} /></label>
                    </div>
                  )}
                  {step === 3 && (
                    <div className="space-y-4">
                      <p className="text-sm text-smoke">Last step — what should it know, and what should it push visitors toward?</p>
                      <div className="rounded-2xl bg-ink/[0.03] p-4">
                        <span className="mb-1 block text-sm font-semibold">⚡ Auto-fill from your website</span>
                        <span className="mb-2 block text-xs text-smoke">Paste your site and we&apos;ll read it to draft your facts for you.</span>
                        <div className="flex gap-2">
                          <input className={field} value={site} onChange={(e) => setSite(e.target.value)} placeholder="yourbusiness.com" />
                          <button type="button" onClick={autofill} disabled={autoBusy || !site.trim()} className="shrink-0 rounded-xl bg-ink px-4 text-sm font-semibold text-paper transition hover:opacity-90 disabled:opacity-50">{autoBusy ? "Reading…" : "Auto-fill"}</button>
                        </div>
                        {autoMsg && <span className="mt-2 block text-xs font-medium text-smoke">{autoMsg}</span>}
                      </div>
                      <label className="block text-sm"><span className="mb-1 block font-semibold">Key facts (hours, services, pricing, FAQs)</span>
                        <textarea className={field} rows={4} value={bot.facts} onChange={(e) => setB("facts", e.target.value)} placeholder={"Hours: Mon–Fri 7–6\nService area: ...\nServices & pricing: ..."} /></label>
                      <label className="block text-sm"><span className="mb-1 block font-semibold">Main goal (call to action)</span>
                        <input className={field} value={bot.cta} onChange={(e) => setB("cta", e.target.value)} placeholder="book an appointment" /></label>
                      <label className="block text-sm"><span className="mb-1 block font-semibold">Special instructions (optional)</span>
                        <textarea className={field} rows={3} value={bot.notes} onChange={(e) => setB("notes", e.target.value)} placeholder="Your mascot's name & personality, tone, things to always or never say…" /></label>
                    </div>
                  )}

                  <div className="mt-6 flex items-center justify-between">
                    <button type="button" onClick={() => (step === 0 ? setWizardDone(true) : setStep(step - 1))} className="rounded-full border-2 border-ink px-5 py-2.5 text-sm font-semibold transition hover:bg-ink hover:text-paper">{step === 0 ? "Skip" : "← Back"}</button>
                    {step < 3 ? (
                      <button type="button" onClick={() => setStep(step + 1)} className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-paper transition hover:opacity-90">Next →</button>
                    ) : (
                      <button type="button" disabled={busy} onClick={async () => { await saveBot(); setWizardDone(true); }} className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-paper transition hover:opacity-90 disabled:opacity-50">{busy ? "Saving…" : "Finish & get my code →"}</button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-8 space-y-6">
                {trialDays !== null && (
                  <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border-2 border-ink bg-paper p-5 sm:flex-row sm:items-center">
                    <div>
                      <span className="font-bold">{trialDays > 0 ? `${trialDays} day${trialDays === 1 ? "" : "s"} left in your free trial` : "Your free trial has ended"}</span>
                      <span className="mt-0.5 block text-sm text-smoke">{trialDays > 0 ? "Your mascot is live. Upgrade anytime to keep it running and unlock everything." : "Upgrade to keep your mascot live and capturing leads."}</span>
                    </div>
                    <a href="/#pricing" className="shrink-0 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-paper transition hover:opacity-90">Upgrade now →</a>
                  </div>
                )}
                <a href="/account/clients" className="flex flex-col items-start justify-between gap-3 rounded-2xl border-2 border-ink bg-ink p-5 text-paper transition hover:opacity-90 sm:flex-row sm:items-center">
                  <div>
                    <span className="font-bold">Managing mascots for clients? 🏢</span>
                    <span className="mt-0.5 block text-sm text-paper/70">Add unlimited client bots, white-label them under your brand, and grab each embed code from one console.</span>
                  </div>
                  <span className="shrink-0 rounded-full bg-paper px-6 py-2.5 text-sm font-semibold text-ink">Open agency console →</span>
                </a>
                <div className="grid grid-cols-3 gap-3">
                  {([["Conversations", stats?.convos], ["Messages", stats?.messages], ["Leads", stats?.leads]] as [string, number | undefined][]).map(([label, val]) => (
                    <div key={label} className="rounded-2xl border-2 border-ink p-4 text-center">
                      <div className="text-3xl font-bold tracking-tightest">{typeof val === "number" ? val.toLocaleString() : "—"}</div>
                      <div className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-smoke">{label}</div>
                    </div>
                  ))}
                </div>
                {series.length > 0 && (() => {
                  const max = Math.max(1, ...series.map((d) => d.convos));
                  const totalC = series.reduce((s, d) => s + d.convos, 0);
                  const totalL = series.reduce((s, d) => s + d.leads, 0);
                  return (
                    <div className="rounded-3xl border-2 border-ink p-6">
                      <div className="flex items-baseline justify-between">
                        <h2 className="text-lg font-bold">Last 14 days</h2>
                        <span className="text-xs font-semibold text-smoke">{totalC} conversations · {totalL} leads</span>
                      </div>
                      <div className="mt-5 flex h-28 items-end gap-1.5">
                        {series.map((d) => (
                          <div key={d.day} className="group relative flex flex-1 flex-col items-center justify-end" title={`${d.day}: ${d.convos} conversations, ${d.leads} leads`}>
                            <div className="w-full rounded-t bg-ink/15" style={{ height: `${(d.convos / max) * 100}%`, minHeight: d.convos ? 4 : 0 }} />
                            {d.leads > 0 && <div className="absolute bottom-0 h-1.5 w-full rounded-t" style={{ background: "#e3342b" }} />}
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 flex justify-between text-[10px] text-smoke"><span>{series[0]?.day.slice(5)}</span><span>today</span></div>
                      <div className="mt-3 flex gap-4 text-xs text-smoke">
                        <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-sm bg-ink/15" />Conversations</span>
                        <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: "#e3342b" }} />Days with leads</span>
                      </div>
                    </div>
                  );
                })()}
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
                    <div className="block text-sm sm:col-span-2 rounded-2xl bg-ink/[0.03] p-4">
                      <span className="mb-1 block font-semibold">⚡ Auto-fill from your website</span>
                      <span className="mb-2 block text-xs text-smoke">Paste your site URL and we&apos;ll read it to draft your facts — then edit below.</span>
                      <div className="flex gap-2">
                        <input className={field} value={site} onChange={(e) => setSite(e.target.value)} placeholder="yourbusiness.com" />
                        <button type="button" onClick={autofill} disabled={autoBusy || !site.trim()} className="shrink-0 rounded-xl bg-ink px-4 text-sm font-semibold text-paper transition hover:opacity-90 disabled:opacity-50">{autoBusy ? "Reading…" : "Auto-fill"}</button>
                      </div>
                      {autoMsg && <span className="mt-2 block text-xs font-medium text-smoke">{autoMsg}</span>}
                    </div>
                    <label className="block text-sm sm:col-span-2"><span className="mb-1 block font-semibold">Key facts the bot should know</span>
                      <textarea className={field} rows={4} value={bot.facts} onChange={(e) => setB("facts", e.target.value)} placeholder={"Hours: Mon–Fri 7–6\nService area: ...\nServices & typical pricing: ...\nCommon questions: ..."} />
                      <span className="mt-1 block text-xs text-smoke">Hours, service area, services, pricing, FAQs — anything you want it to answer accurately.</span></label>
                    <label className="block text-sm sm:col-span-2"><span className="mb-1 block font-semibold">Special instructions (optional)</span>
                      <textarea className={field} rows={3} value={bot.notes} onChange={(e) => setB("notes", e.target.value)} placeholder="Your mascot's name & personality, tone of voice, things to always or never say…" />
                      <span className="mt-1 block text-xs text-smoke">Shape its personality and rules — name, tone, do&apos;s and don&apos;ts.</span></label>
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
                    <div className="block text-sm sm:col-span-2">
                      <span className="mb-1 block font-semibold">Your mascot</span>
                      <div className="flex items-center gap-4">
                        <img src={bot.image || "/mascots/dr-volt-1.png"} alt="" className="h-20 w-20 shrink-0 rounded-xl border-2 border-ink/15 bg-white object-contain" />
                        <div className="flex-1">
                          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border-2 border-ink px-4 py-2 text-sm font-semibold transition hover:bg-ink hover:text-paper">
                            Upload your artwork
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadArt(e.target.files?.[0])} />
                          </label>
                          <span className="mt-1 block text-xs text-smoke">Upload your own character (PNG/JPG, square works best), pick one of ours in setup, or paste a URL.</span>
                          <input className={field + " mt-2"} value={bot.image} onChange={(e) => setB("image", e.target.value)} placeholder="…or paste an image URL" />
                        </div>
                      </div>
                    </div>
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
                  <div className="mt-4 border-t border-ink/10 pt-4">
                    <span className="block text-sm font-semibold">Already added it? Check that it&apos;s live.</span>
                    <div className="mt-2 flex gap-2">
                      <input className={field} value={verifyUrl} onChange={(e) => setVerifyUrl(e.target.value)} placeholder="https://yourbusiness.com (page with the code)" />
                      <button onClick={verifyInstall} disabled={verifyBusy} className="shrink-0 rounded-xl border-2 border-ink px-4 text-sm font-semibold transition hover:bg-ink hover:text-paper disabled:opacity-50">{verifyBusy ? "Checking…" : "Check"}</button>
                    </div>
                    {verifyMsg && (
                      <p className={"mt-2 rounded-xl px-3 py-2 text-sm " + (verifyMsg.ok ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800")}>{verifyMsg.text}</p>
                    )}
                  </div>
                </div>

                {ref && (
                  <div className="rounded-3xl border-2 border-ink bg-ink p-6 text-paper">
                    <h2 className="text-lg font-bold">Refer &amp; earn 💸</h2>
                    <p className="mt-0.5 text-sm text-smoke">Share your link. When a business you refer becomes a paying customer, you earn <b className="text-paper">20% of their first payment</b> in cash.</p>
                    <div className="mt-4 flex items-stretch gap-2">
                      <code className="flex-1 overflow-auto rounded-xl bg-paper px-4 py-3 text-xs text-ink">{refLink}</code>
                      <button onClick={() => { navigator.clipboard.writeText(refLink).then(() => { setRefCopied(true); setTimeout(() => setRefCopied(false), 1800); }); }} className="shrink-0 rounded-xl border-2 border-paper px-4 text-sm font-semibold">{refCopied ? "Copied ✓" : "Copy"}</button>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-3">
                      {([["Referrals", String(ref.count)], ["Paying", String(ref.paid)], ["Earned", "$" + ref.earned.toLocaleString()]] as [string, string][]).map(([k, v]) => (
                        <div key={k} className="rounded-2xl bg-paper/10 p-4 text-center">
                          <div className="text-2xl font-bold tracking-tightest">{v}</div>
                          <div className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-smoke">{k}</div>
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 text-xs text-smoke">Paid out monthly. <a href="/affiliate" className="underline">How it works →</a></p>
                  </div>
                )}

                <div className="rounded-3xl border-2 border-ink p-6">
                  <h2 className="text-lg font-bold">Leads {leads.length > 0 && <span className="ml-1 inline-block rounded-full bg-[#e3342b] px-2 py-0.5 align-middle text-xs font-bold text-white">{leads.length}</span>}</h2>
                  <p className="mt-0.5 text-sm text-smoke">When a visitor shares their name, email, or phone with your mascot, it shows up here — and we email you.</p>
                  {leads.length === 0 ? (
                    <p className="mt-5 rounded-2xl bg-ink/[0.03] px-4 py-6 text-center text-sm text-smoke">No leads yet. Once your mascot is live and someone leaves their info, it&apos;ll appear here.</p>
                  ) : (
                    <ul className="mt-4 divide-y divide-ink/10">
                      {leads.map((l) => (
                        <li key={l.id} className="py-3">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                            {l.name && <span className="font-semibold">{l.name}</span>}
                            {l.email && <a href={`mailto:${l.email}`} className="text-ink underline">{l.email}</a>}
                            {l.phone && <a href={`tel:${l.phone}`} className="text-ink underline">{l.phone}</a>}
                            <span className="ml-auto text-xs text-smoke">{new Date(l.at).toLocaleString()}</span>
                          </div>
                          <p className="mt-1 text-sm text-smoke">&ldquo;{l.message}&rdquo;</p>
                          {l.transcript && l.transcript.length > 0 && (
                            <div className="mt-1.5">
                              <button onClick={() => setOpenLead(openLead === l.id ? "" : l.id)} className="text-xs font-semibold text-ink underline">
                                {openLead === l.id ? "Hide conversation" : `View conversation (${l.transcript.length})`}
                              </button>
                              {openLead === l.id && (
                                <div className="mt-2 space-y-2 rounded-2xl bg-ink/[0.03] p-3">
                                  {l.transcript.map((m, i) => (
                                    <div key={i} className={"flex " + (m.role === "user" ? "justify-end" : "justify-start")}>
                                      <span className={"max-w-[80%] rounded-2xl px-3 py-1.5 text-xs " + (m.role === "user" ? "bg-ink text-paper" : "bg-white border border-ink/10 text-ink")}>{m.content}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
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
