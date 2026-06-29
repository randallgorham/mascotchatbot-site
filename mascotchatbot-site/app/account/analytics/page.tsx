"use client";

// Customer-facing read-only analytics for their own mascot — richer than the
// dashboard summary: response times, voice/text mix, busy hours, top questions.
import SiteHeader from "@/components/SiteHeader";
import { useEffect, useState } from "react";

type A = {
  msgs: number; convos: number; voice: number; text: number; sessions: number;
  avgRtMs: number; avgTtftMs: number; avgDwellSec: number; msgsPerConvo: number; errs: number;
  dailyMsgs: number[]; dailyConvos: number[]; hours: number[];
  topQuestions: { q: string; n: number }[]; days: string[];
};

function fmtMs(ms: number) { return ms >= 1000 ? (ms / 1000).toFixed(1) + "s" : ms + "ms"; }
function fmtDur(s: number) { if (!s) return "0s"; const m = Math.floor(s / 60), x = s % 60; return m ? m + "m " + x + "s" : x + "s"; }

function Spark({ data, color }: { data: number[]; color: string }) {
  if (!data?.length) return null;
  const max = Math.max(1, ...data), w = 280, h = 44;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(" ");
  return <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: 44 }} preserveAspectRatio="none"><polyline points={pts} fill="none" stroke={color} strokeWidth="2" /></svg>;
}

export default function CustomerAnalytics() {
  const [a, setA] = useState<A | null>(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "analytics" }) })
      .then((r) => r.json())
      .then((d) => { if (d.ok) setA(d.analytics); else setErr(d.error || "Sign in to view analytics."); })
      .catch(() => setErr("Couldn't load analytics."));
  }, []);

  const card: React.CSSProperties = { border: "2px solid #14171c", borderRadius: 18, padding: 18 };
  const peak = a ? a.hours.indexOf(Math.max(...a.hours)) : 0;
  const maxHr = a ? Math.max(1, ...a.hours) : 1;

  return (
    <main className="flex min-h-screen flex-col bg-paper text-ink" style={{ fontFamily: "ui-sans-serif,system-ui,Arial,sans-serif" }}>
      <SiteHeader />
      <div className="mx-auto w-full max-w-3xl flex-1 px-5 py-12">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tightest">Your mascot analytics</h1>
          <a href="/account" className="rounded-full border-2 border-ink px-4 py-2 text-sm font-semibold transition hover:bg-ink hover:text-paper">← Dashboard</a>
        </div>
        {err && <p className="mt-6 text-smoke">{err}</p>}
        {!a && !err && <p className="mt-6 text-smoke">Loading…</p>}
        {a && (
          <div className="mt-8 space-y-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {([["Conversations", a.convos.toLocaleString()], ["Messages", a.msgs.toLocaleString()], ["Avg response", fmtMs(a.avgRtMs)], ["Avg session", fmtDur(a.avgDwellSec)], ["Msgs / convo", String(a.msgsPerConvo)], ["Voice / text", a.voice + " / " + a.text], ["Sessions", a.sessions.toLocaleString()], ["First reply", fmtMs(a.avgTtftMs)]] as [string, string][]).map(([k, v]) => (
                <div key={k} className="rounded-2xl border-2 border-ink p-4 text-center">
                  <div className="text-2xl font-bold tracking-tightest">{v}</div>
                  <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-smoke">{k}</div>
                </div>
              ))}
            </div>

            <div style={card}>
              <h2 className="text-lg font-bold">Last 14 days</h2>
              <p className="mt-1 text-xs text-smoke">Messages</p>
              <Spark data={a.dailyMsgs} color="#2bc4e6" />
              <p className="mt-2 text-xs text-smoke">Conversations</p>
              <Spark data={a.dailyConvos} color="#0a7d33" />
            </div>

            <div style={card}>
              <h2 className="text-lg font-bold">Busiest hours (UTC){a.hours.some((x) => x) ? ` · peak ${peak}:00` : ""}</h2>
              <div className="mt-4 flex h-16 items-end gap-1">
                {a.hours.map((v, i) => (
                  <div key={i} title={`${i}:00 — ${v}`} className="flex-1 rounded-t" style={{ height: Math.max(2, (v / maxHr) * 64), background: v === maxHr && v > 0 ? "#2bc4e6" : "#cbd5e1" }} />
                ))}
              </div>
              <div className="mt-1 flex justify-between text-[10px] text-smoke"><span>0h</span><span>12h</span><span>23h</span></div>
            </div>

            <div style={card}>
              <h2 className="text-lg font-bold">Top questions visitors ask</h2>
              {a.topQuestions.length ? (
                <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm">
                  {a.topQuestions.map((t, i) => <li key={i}><b>{t.n}×</b> {t.q}</li>)}
                </ol>
              ) : <p className="mt-3 text-sm text-smoke">No questions logged yet — once visitors start chatting, the most common questions show up here.</p>}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
