"use client";

// Admin Fleet dashboard: every deployed mascot in one directory, a fleet roll-up with
// "needs attention" flags, and a per-mascot analytics drill-down.
import React, { useEffect, useState, useCallback } from "react";
import { eligibleSkills, tierAllowance, normTier, BASE_SKILLS } from "@/lib/skills";

type Row = {
  kind: string; id: string; business: string; owner: string; industry: string;
  plan: string; setup: string; voiceId: string; voice: number; text: number; hasMascot: boolean; siteUrl: string;
  installed: boolean; goLive: string; updatedAt: string; leads: number; leadRate: number;
  msgs: number; convos: number; avgRtMs: number; avgTtftMs: number; avgTtsMs: number;
  ttsFallback: number; errs: number; sessions: number;
  avgDwellSec: number; msgsPerConvo: number; errRate: number; lastActive: string;
  dailyMsgs: number[]; dailyConvos: number[]; flags: string[];
};
type Rollup = {
  deployments: number; firstParty: number; installed: number; notInstalled: number;
  totalMsgs: number; totalConvos: number; totalLeads: number; totalSessions: number;
  avgRtMs: number; totalErrs: number; errRate: number; voiceShare: number; leadConversion: number;
};
type Detail = {
  id: string; isBot: boolean; bot: Record<string, unknown> | null;
  stats: Row; hours: number[];
  topQuestions: { q: string; n: number; last: number }[];
  recentQuestions: { q: string; at: number }[];
  leads: { id: string; name?: string; email?: string; phone?: string; at?: string }[];
  days: string[];
};

const FLAG_LABEL: Record<string, string> = {
  "not-installed": "Not installed",
  "high-errors": "High error rate",
  "slow": "Slow responses",
  "trial-ending": "Trial ending",
  "no-leads": "No leads yet",
  "quiet": "Quiet 7d+",
};
const FLAG_COLOR: Record<string, string> = {
  "not-installed": "#b45309", "high-errors": "#b91c1c", "slow": "#b91c1c",
  "trial-ending": "#9a6700", "no-leads": "#6b7280", "quiet": "#6b7280",
};

function fmtMs(ms: number) { return ms >= 1000 ? (ms / 1000).toFixed(1) + "s" : ms + "ms"; }
function fmtDur(sec: number) { if (!sec) return "0s"; const m = Math.floor(sec / 60), s = sec % 60; return m ? m + "m " + s + "s" : s + "s"; }
function ago(iso: string) {
  if (!iso) return "—";
  const t = new Date(iso).getTime(); if (isNaN(t)) return "—";
  const d = Math.floor((Date.now() - t) / 86400000);
  return d <= 0 ? "today" : d === 1 ? "yesterday" : d + "d ago";
}

function Spark({ data, color = "#2bc4e6" }: { data: number[]; color?: string }) {
  if (!data || !data.length) return null;
  const max = Math.max(1, ...data); const w = 120, h = 28;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" />
    </svg>
  );
}

async function get() {
  const r = await fetch("/api/admin/fleet", { cache: "no-store" });
  return { status: r.status, data: await r.json().catch(() => ({})) };
}
async function post(action: string, extra: Record<string, unknown> = {}) {
  const r = await fetch("/api/admin/fleet", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ...extra }) });
  return r.json().catch(() => ({}));
}

export default function FleetDashboard() {
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [err, setErr] = useState("");
  const [rollup, setRollup] = useState<Rollup | null>(null);
  const [dir, setDir] = useState<Row[]>([]);
  const [attention, setAttention] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [openId, setOpenId] = useState("");
  const [detail, setDetail] = useState<Detail | null>(null);
  const [detailBusy, setDetailBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setErr("");
    const { status, data } = await get();
    if (status === 403) { setForbidden(true); setLoading(false); return; }
    if (!data.ok) { setErr(data.error || "Failed to load."); setLoading(false); return; }
    setRollup(data.rollup); setDir(data.directory || []); setAttention(data.attention || []);
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function openMascot(id: string) {
    if (openId === id) { setOpenId(""); setDetail(null); return; }
    setOpenId(id); setDetail(null); setDetailBusy(true);
    const d = await post("mascot", { id });
    if (d.ok) setDetail(d as Detail);
    setDetailBusy(false);
  }

  if (forbidden) return (
    <main style={wrap}><h1 style={{ fontSize: 22 }}>Fleet</h1><p style={{ color: "#b91c1c" }}>You don't have access to this dashboard.</p><p><a href="/account" style={link}>Go to your account →</a></p></main>
  );

  const filtered = dir.filter((r) => {
    if (filter === "installed" && !r.installed) return false;
    if (filter === "not-installed" && r.installed) return false;
    if (filter === "attention" && (!r.flags || !r.flags.length)) return false;
    if (filter === "first-party" && r.kind !== "first-party") return false;
    if (filter === "customers" && r.kind !== "customer") return false;
    if (!q) return true;
    const hay = (r.business + " " + r.owner + " " + r.industry + " " + r.siteUrl + " " + r.id).toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  return (
    <main style={wrap}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>🛰️ Fleet — every deployed mascot</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <a href="/admin/command" style={btnSmall}>Command center</a>
          <button onClick={load} style={btnSmall}>Refresh</button>
        </div>
      </div>
      <p style={{ color: "#555", margin: "6px 0 20px" }}>Live telemetry across all mascots — installs, usage, response times, lead conversion, and what needs attention.</p>

      {loading && <p>Loading…</p>}
      {err && <p style={{ color: "#b91c1c" }}>{err}</p>}

      {rollup && (
        <>
          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12 }}>
            <Kpi label="Deployments" value={rollup.deployments} sub={rollup.installed + " installed"} />
            <Kpi label="Conversations" value={rollup.totalConvos.toLocaleString()} sub={rollup.totalMsgs.toLocaleString() + " messages"} />
            <Kpi label="Leads captured" value={rollup.totalLeads.toLocaleString()} sub={rollup.leadConversion + "% of convos"} accent="#0a7d33" />
            <Kpi label="Avg response" value={fmtMs(rollup.avgRtMs)} sub="fleet-wide" />
            <Kpi label="Error rate" value={rollup.errRate + "%"} sub={rollup.totalErrs + " errors"} accent={rollup.errRate >= 3 ? "#b91c1c" : undefined} />
            <Kpi label="Voice share" value={rollup.voiceShare + "%"} sub="spoke vs typed" />
            <Kpi label="Sessions" value={rollup.totalSessions.toLocaleString()} sub="mascot opens" />
            <Kpi label="Not installed" value={rollup.notInstalled} sub="awaiting embed" accent={rollup.notInstalled > 0 ? "#b45309" : undefined} />
          </section>

          {attention.length > 0 && (
            <section style={{ ...card, marginTop: 22, borderColor: "#f3d39b", background: "#fffaf0" }}>
              <h2 style={h2}>⚠️ Needs attention ({attention.length})</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
                {attention.map((r) => (
                  <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <div>
                      <button onClick={() => openMascot(r.id)} style={{ ...linkBtn, fontWeight: 700 }}>{r.business || r.id}</button>
                      <span style={{ color: "#777", fontSize: 12, marginLeft: 8 }}>{r.owner !== "—" ? r.owner : r.industry}</span>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {(r.flags || []).map((f) => <span key={f} style={{ ...pill, color: FLAG_COLOR[f] || "#555", borderColor: (FLAG_COLOR[f] || "#999") + "55" }}>{FLAG_LABEL[f] || f}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section style={{ ...card, marginTop: 22 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
              <h2 style={h2}>Deployment directory</h2>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search business, owner, site…" style={input} />
                <select value={filter} onChange={(e) => setFilter(e.target.value)} style={input}>
                  <option value="all">All ({dir.length})</option>
                  <option value="customers">Customers</option>
                  <option value="first-party">First-party</option>
                  <option value="installed">Installed</option>
                  <option value="not-installed">Not installed</option>
                  <option value="attention">Needs attention</option>
                </select>
              </div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={table}>
                <thead>
                  <tr>
                    <Th>Mascot / business</Th><Th>Site</Th><Th>Industry</Th><Th>Plan</Th>
                    <Th right>Msgs</Th><Th right>Convos</Th><Th right>Leads</Th>
                    <Th right>Avg resp</Th><Th right>Voice</Th><Th right>Errors</Th>
                    <Th>Last active</Th><Th>14-day</Th><Th></Th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <React.Fragment key={r.id}>
                      <tr style={{ borderTop: "1px solid #eee" }}>
                        <Td>
                          <div style={{ fontWeight: 600 }}>{r.business || r.id} {r.kind === "first-party" && <span style={{ ...pill, color: "#1597b4", borderColor: "#2bc4e655" }}>first-party</span>}</div>
                          <div style={{ color: "#888", fontSize: 12 }}>{r.owner !== "—" ? r.owner : ""}{!r.installed && r.kind === "customer" ? " · not installed" : ""}</div>
                          {(r.flags && r.flags.length) ? <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 3 }}>{r.flags.map((f) => <span key={f} style={{ ...pill, fontSize: 10, color: FLAG_COLOR[f] || "#555", borderColor: (FLAG_COLOR[f] || "#999") + "55" }}>{FLAG_LABEL[f] || f}</span>)}</div> : null}
                        </Td>
                        <Td>{r.siteUrl ? <a href={r.siteUrl} target="_blank" rel="noreferrer" style={link}>{r.siteUrl.replace(/^https?:\/\//, "").slice(0, 26)}</a> : <span style={{ color: "#bbb" }}>—</span>}</Td>
                        <Td>{r.industry || "—"}</Td>
                        <Td><span style={{ textTransform: "capitalize" }}>{r.plan}</span></Td>
                        <Td right>{r.msgs.toLocaleString()}</Td>
                        <Td right>{r.convos.toLocaleString()}</Td>
                        <Td right>{r.leads}{r.leadRate ? <span style={{ color: "#0a7d33", fontSize: 11 }}> · {r.leadRate}%</span> : null}</Td>
                        <Td right>{r.msgs ? fmtMs(r.avgRtMs) : "—"}</Td>
                        <Td right>{r.voice}</Td>
                        <Td right><span style={{ color: r.errRate >= 5 ? "#b91c1c" : "inherit" }}>{r.errs}{r.errRate ? " · " + r.errRate + "%" : ""}</span></Td>
                        <Td>{r.lastActive ? ago(r.lastActive) : "—"}</Td>
                        <Td><Spark data={r.dailyMsgs} /></Td>
                        <Td><button onClick={() => openMascot(r.id)} style={btnSmall}>{openId === r.id ? "Close" : "Open"}</button></Td>
                      </tr>
                      {openId === r.id && (
                        <tr><td colSpan={13} style={{ background: "#fafbfc", padding: 0 }}>
                          {detailBusy && <p style={{ padding: 16 }}>Loading analytics…</p>}
                          {detail && detail.id === r.id && <MascotDetail d={detail} row={r} />}
                        </td></tr>
                      )}
                    </React.Fragment>
                  ))}
                  {!filtered.length && <tr><Td>No mascots match.</Td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </main>
  );
}

function MascotDetail({ d, row }: { d: Detail; row: Row }) {
  const maxHr = Math.max(1, ...d.hours);
  const peakHr = d.hours.indexOf(Math.max(...d.hours));
  return (
    <div style={{ padding: 16 }}>
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10 }}>
        <Kpi label="Avg session" value={fmtDur(d.stats.avgDwellSec)} sub={d.stats.sessions + " sessions"} />
        <Kpi label="Msgs / convo" value={d.stats.msgsPerConvo} sub={d.stats.convos + " convos"} />
        <Kpi label="Avg response" value={fmtMs(d.stats.avgRtMs)} sub={"first token " + fmtMs(d.stats.avgTtftMs)} />
        <Kpi label="Voice TTS" value={fmtMs(d.stats.avgTtsMs)} sub={d.stats.ttsFallback + " fallbacks"} />
        <Kpi label="Voice / text" value={d.stats.voice + " / " + d.stats.text} sub="channel mix" />
        <Kpi label="Lead conv." value={row.leadRate + "%"} sub={row.leads + " leads"} accent="#0a7d33" />
        <Kpi label="Errors" value={d.stats.errs} sub={d.stats.errRate + "% of msgs"} accent={d.stats.errRate >= 5 ? "#b91c1c" : undefined} />
        <Kpi label="Last active" value={d.stats.lastActive ? ago(d.stats.lastActive) : "—"} />
      </section>

      {d.isBot && d.bot && <SkillsEditor bot={d.bot} />}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16, marginTop: 16 }}>
        <div style={card}>
          <h3 style={h3}>Messages — last 14 days</h3>
          <Spark data={d.stats.dailyMsgs} />
          <h3 style={{ ...h3, marginTop: 12 }}>Conversations — last 14 days</h3>
          <Spark data={d.stats.dailyConvos} color="#0a7d33" />
        </div>

        <div style={card}>
          <h3 style={h3}>Busiest hours (UTC){d.hours.some((x) => x) ? " · peak " + peakHr + ":00" : ""}</h3>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 60, marginTop: 8 }}>
            {d.hours.map((v, i) => (
              <div key={i} title={i + ":00 — " + v} style={{ flex: 1, height: Math.max(2, (v / maxHr) * 60), background: v === maxHr && v > 0 ? "#2bc4e6" : "#cbd5e1", borderRadius: 2 }} />
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#999", fontSize: 10, marginTop: 4 }}><span>0h</span><span>12h</span><span>23h</span></div>
        </div>

        <div style={card}>
          <h3 style={h3}>Top questions asked</h3>
          {d.topQuestions.length ? (
            <ol style={{ margin: "8px 0 0", paddingLeft: 18, fontSize: 13, lineHeight: 1.5 }}>
              {d.topQuestions.map((t, i) => <li key={i}><strong>{t.n}×</strong> {t.q}</li>)}
            </ol>
          ) : <p style={{ color: "#999", fontSize: 13 }}>No questions logged yet.</p>}
        </div>
      </div>

      {d.isBot && d.leads && d.leads.length > 0 && (
        <div style={{ ...card, marginTop: 16 }}>
          <h3 style={h3}>Recent leads ({d.leads.length})</h3>
          <table style={table}>
            <thead><tr><Th>Name</Th><Th>Email</Th><Th>Phone</Th><Th>When</Th></tr></thead>
            <tbody>
              {d.leads.slice(0, 12).map((l) => (
                <tr key={l.id} style={{ borderTop: "1px solid #eee" }}>
                  <Td>{l.name || "—"}</Td><Td>{l.email || "—"}</Td><Td>{l.phone || "—"}</Td><Td>{l.at ? ago(l.at) : "—"}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SkillsEditor({ bot }: { bot: Record<string, unknown> }) {
  const id = String(bot.id || "");
  const [tier, setTier] = useState(normTier(String(bot.tier || "")));
  const [sel, setSel] = useState<string[]>(Array.isArray(bot.skills) ? (bot.skills as string[]) : []);
  const [msg, setMsg] = useState("");
  async function cmd(action: string, extra: Record<string, unknown>) {
    setMsg("Saving…");
    const r = await fetch("/api/admin/command", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, botId: id, ...extra }) });
    const dd = await r.json().catch(() => ({}));
    if (dd && dd.ok && dd.bot) { setTier(normTier(String(dd.bot.tier || ""))); setSel(Array.isArray(dd.bot.skills) ? dd.bot.skills : []); setMsg("Saved ✓"); }
    else setMsg(dd.error || "Failed");
  }
  const allow = tierAllowance(tier);
  const elig = eligibleSkills(tier);
  const used = sel.length;
  const toggle = (sid: string, on: boolean) => {
    let next = sel.filter((x) => x !== sid);
    if (on) { if (allow !== Infinity && next.length >= allow) return; next = [...next, sid]; }
    setSel(next); cmd("setSkills", { skills: next });
  };
  return (
    <div style={{ ...card, marginTop: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <h3 style={h3}>Skills (admin override)</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: "#888" }}>Tier</span>
          <select value={tier} onChange={(e) => { const t = normTier(e.target.value); setTier(t); cmd("setTier", { tier: t }); }} style={input}>
            <option value="starter">Starter (2)</option>
            <option value="pro">Pro (5)</option>
            <option value="premium">Premium (all)</option>
          </select>
          <span style={{ fontSize: 12, color: "#888" }}>{allow === Infinity ? "all" : used + "/" + allow}</span>
          {msg && <span style={{ fontSize: 12, color: msg.includes("Fail") ? "#b91c1c" : "#0a7d33" }}>{msg}</span>}
        </div>
      </div>
      <p style={{ fontSize: 12, color: "#999", margin: "4px 0 8px" }}>Always on: {BASE_SKILLS.map((s) => s.label).join(", ")}.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 6 }}>
        {elig.map((sk) => {
          const on = sel.includes(sk.id);
          const atCap = allow !== Infinity && used >= allow && !on;
          return (
            <label key={sk.id} style={{ display: "flex", gap: 6, alignItems: "flex-start", fontSize: 12.5, opacity: atCap ? 0.5 : 1, cursor: atCap ? "default" : "pointer", border: "1px solid #e7e9ee", borderRadius: 8, padding: "6px 8px", background: on ? "#f3fbfd" : "#fff" }}>
              <input type="checkbox" checked={on} disabled={atCap} onChange={(e) => toggle(sk.id, e.target.checked)} />
              <span><b>{sk.label}</b></span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function Kpi({ label, value, sub, accent }: { label: string; value: React.ReactNode; sub?: string; accent?: string }) {
  return (
    <div style={card}>
      <div style={{ fontSize: 12, color: "#777", fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: accent || "#111", lineHeight: 1.1, marginTop: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}
function Th({ children, right }: { children?: React.ReactNode; right?: boolean }) {
  return <th style={{ textAlign: right ? "right" : "left", padding: "8px 10px", fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: ".03em", whiteSpace: "nowrap" }}>{children}</th>;
}
function Td({ children, right }: { children?: React.ReactNode; right?: boolean }) {
  return <td style={{ textAlign: right ? "right" : "left", padding: "9px 10px", fontSize: 13, verticalAlign: "top" }}>{children}</td>;
}

const wrap: React.CSSProperties = { maxWidth: 1180, margin: "0 auto", padding: "28px 20px 80px", fontFamily: "ui-sans-serif,system-ui,Arial,sans-serif", color: "#111" };
const card: React.CSSProperties = { background: "#fff", border: "1px solid #e7e9ee", borderRadius: 14, padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,.04)" };
const h2: React.CSSProperties = { fontSize: 16, fontWeight: 700, margin: 0 };
const h3: React.CSSProperties = { fontSize: 13, fontWeight: 700, margin: 0, color: "#444" };
const table: React.CSSProperties = { width: "100%", borderCollapse: "collapse" };
const input: React.CSSProperties = { border: "1px solid #d9dee5", borderRadius: 9, padding: "7px 10px", fontSize: 13, outline: "none" };
const btnSmall: React.CSSProperties = { border: "1px solid #d9dee5", background: "#fff", borderRadius: 9, padding: "7px 12px", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#111", textDecoration: "none" };
const link: React.CSSProperties = { color: "#1597b4", textDecoration: "none" };
const linkBtn: React.CSSProperties = { border: "none", background: "none", color: "#1597b4", cursor: "pointer", padding: 0, fontSize: 14 };
const pill: React.CSSProperties = { display: "inline-block", border: "1px solid #ddd", borderRadius: 999, padding: "1px 7px", fontSize: 11, marginLeft: 4 };
