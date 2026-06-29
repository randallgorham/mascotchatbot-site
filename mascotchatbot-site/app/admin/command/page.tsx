"use client";

// Owner command center: full business overview, trends, funnel, affiliate
// payouts, a customer table, and per-customer drill-down with live controls.
import React, { useEffect, useState, useCallback } from "react";

type KPIs = {
  customers: number; active: number; trial: number; demo: number; disabled: number;
  signups: number; leads: number; convos: number; messages: number;
  revenue: number; orders: number; affiliateOwed: number; affiliateConversions: number;
};
type SeriesPt = { day: string; signups: number; revenue: number; convos: number; leads: number };
type Funnel = { signups: number; demos: number; trials: number; paid: number };
type Customer = { id: string; business: string; owner: string; industry: string; plan: string; trialEnds: string; messages: number; convos: number; leads: number; revenue: number; referrer: string; updatedAt: string };
type PayRow = { referrer: string; signups: number; conversions: number; owed: number };
type Payouts = { rows: PayRow[]; totalOwed: number; totalConversions: number };
type AB = { monthly: { views: number; carts: number }; annual: { views: number; carts: number } };

type Lead = { id: string; name?: string; email?: string; phone?: string; message: string; at: string; transcript?: { role: string; content: string }[] };
type Detail = {
  bot: Customer & { about?: string; facts?: string; voice?: string; accent?: string; badge?: boolean };
  user: { email: string; name: string; createdAt?: string; google?: boolean } | null;
  leads: Lead[];
  orders: { id?: string; amount?: number; status?: string; createdAt?: string }[];
  referral: { referrer?: string; status?: string; commission?: number } | null;
  revenue: number;
};

const PLANS = ["trial", "active", "starter", "demo", "disabled"];

async function get() {
  const r = await fetch("/api/admin/command", { cache: "no-store" });
  return r.json().catch(() => ({ ok: false, error: "Request failed." }));
}
async function post(action: string, extra: Record<string, unknown> = {}) {
  const r = await fetch("/api/admin/command", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, ...extra }) });
  return r.json().catch(() => ({ ok: false }));
}

export default function CommandCenter() {
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [err, setErr] = useState("");
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [series, setSeries] = useState<SeriesPt[]>([]);
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pay, setPay] = useState<Payouts | null>(null);
  const [ab, setAb] = useState<AB | null>(null);

  const [q, setQ] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [openId, setOpenId] = useState("");
  const [detail, setDetail] = useState<Detail | null>(null);
  const [detailBusy, setDetailBusy] = useState(false);
  const [actMsg, setActMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const d = await get();
    if (d && d.ok) {
      setKpis(d.kpis); setSeries(d.series || []); setFunnel(d.funnel);
      setCustomers(d.customers || []); setPay(d.payouts || null); setAb(d.ab || null);
    } else if (d && (d.error === "Forbidden")) setForbidden(true);
    else setErr((d && d.error) || "Could not load.");
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function openCustomer(id: string) {
    if (openId === id) { setOpenId(""); setDetail(null); return; }
    setOpenId(id); setDetail(null); setDetailBusy(true); setActMsg("");
    const d = await post("customer", { botId: id });
    setDetailBusy(false);
    if (d && d.ok) setDetail(d as Detail);
    else setActMsg((d && d.error) || "Could not load customer.");
  }

  async function act(action: string, extra: Record<string, unknown>, note: string) {
    setActMsg("Working…");
    const d = await post(action, extra);
    if (d && d.ok) {
      setActMsg(note);
      await load();
      if (openId) { const dd = await post("customer", { botId: openId }); if (dd && dd.ok) setDetail(dd as Detail); }
    } else setActMsg((d && d.error) || "Action failed.");
  }

  if (loading) return <main style={wrap}><p style={{ color: "#888" }}>Loading command center…</p></main>;
  if (forbidden) return (
    <main style={wrap}>
      <h1 style={h1}>Command center</h1>
      <p style={{ color: "#555", marginTop: 10 }}>This is owner/admin only. <a href="/admin" style={link}>Sign in to the admin →</a></p>
    </main>
  );

  const filtered = customers.filter((c) => {
    if (planFilter !== "all" && c.plan !== planFilter) return false;
    if (!q) return true;
    const s = (c.business + " " + c.owner + " " + c.industry).toLowerCase();
    return s.includes(q.toLowerCase());
  });

  return (
    <main style={wrap}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <h1 style={h1}>Command center</h1>
        <div style={{ display: "flex", gap: 14 }}>
          <a href="/admin/fleet" style={link}>🛰️ Fleet dashboard</a>
          <a href="/admin" style={link}>Admin settings</a>
          <button onClick={load} style={btnSmall}>Refresh</button>
        </div>
      </div>
      <p style={{ color: "#555", margin: "6px 0 22px" }}>Your whole business at a glance — live from the database.</p>

      {err ? <p style={{ color: "#e3342b" }}>{err}</p> : null}

      {/* KPI grid */}
      {kpis && (
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12 }}>
          <Kpi label="Revenue" value={"$" + kpis.revenue.toLocaleString()} accent="#0a7d33" sub={kpis.orders + " paid orders"} />
          <Kpi label="Customers" value={kpis.customers} sub={kpis.active + " active"} />
          <Kpi label="On trial" value={kpis.trial} accent="#b8860b" />
          <Kpi label="Signups" value={kpis.signups} />
          <Kpi label="Leads captured" value={kpis.leads} />
          <Kpi label="Conversations" value={kpis.convos} sub={kpis.messages.toLocaleString() + " messages"} />
          <Kpi label="Demos live" value={kpis.demo} />
          <Kpi label="Affiliate owed" value={"$" + kpis.affiliateOwed.toLocaleString()} accent="#e3342b" sub={kpis.affiliateConversions + " conversions"} />
        </section>
      )}

      {/* Trends */}
      {series.length > 0 && (
        <section style={{ marginTop: 22, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14 }}>
          <Chart title="Signups / day" data={series.map((s) => s.signups)} labels={series.map((s) => s.day)} color="#2bc4e6" />
          <Chart title="Revenue / day" data={series.map((s) => s.revenue)} labels={series.map((s) => s.day)} color="#0a7d33" money />
          <Chart title="Conversations / day" data={series.map((s) => s.convos)} labels={series.map((s) => s.day)} color="#0A0A0A" />
          <Chart title="Leads / day" data={series.map((s) => s.leads)} labels={series.map((s) => s.day)} color="#e3342b" />
        </section>
      )}

      {/* Funnel */}
      {funnel && (
        <section style={{ ...card, marginTop: 22 }}>
          <h2 style={h2}>Acquisition funnel</h2>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 }}>
            <FunnelStep label="Signups" value={funnel.signups} max={funnel.signups} />
            <FunnelStep label="On trial" value={funnel.trials} max={funnel.signups} />
            <FunnelStep label="Demos" value={funnel.demos} max={funnel.signups} />
            <FunnelStep label="Paid / active" value={funnel.paid} max={funnel.signups} />
          </div>
        </section>
      )}

      {/* A/B experiment: billing default */}
      {ab && (ab.monthly.views + ab.annual.views > 0) && (() => {
        const rate = (x: { views: number; carts: number }) => (x.views > 0 ? (x.carts / x.views) * 100 : 0);
        const mr = rate(ab.monthly), ar = rate(ab.annual);
        const lead = mr === ar ? "" : mr > ar ? "monthly" : "annual";
        const lift = Math.min(mr, ar) > 0 ? Math.abs(mr - ar) / Math.min(mr, ar) * 100 : 0;
        const Bar = ({ label, x, win }: { label: string; x: { views: number; carts: number }; win: boolean }) => (
          <div style={{ flex: "1 1 200px", border: "1px solid " + (win ? "#0a7d33" : "#ececec"), borderRadius: 12, padding: "14px 16px", background: win ? "#f3fbf5" : "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontWeight: 700, textTransform: "capitalize" }}>{label} default{win ? " 🏆" : ""}</span>
              <span style={{ fontSize: 22, fontWeight: 800, color: win ? "#0a7d33" : "#0A0A0A" }}>{rate(x).toFixed(1)}%</span>
            </div>
            <div style={{ fontSize: 12, color: "#888", marginTop: 4 }}>{x.carts.toLocaleString()} add-to-cart / {x.views.toLocaleString()} visitors</div>
          </div>
        );
        return (
          <section style={{ ...card, marginTop: 22 }}>
            <h2 style={h2}>A/B test — pricing billing default</h2>
            <p style={{ color: "#888", fontSize: 13, margin: "4px 0 12px" }}>Add-to-cart rate by which billing option new visitors see first.</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Bar label="monthly" x={ab.monthly} win={lead === "monthly"} />
              <Bar label="annual" x={ab.annual} win={lead === "annual"} />
            </div>
            <p style={{ fontSize: 13, color: "#555", marginTop: 12 }}>
              {lead ? <><strong style={{ textTransform: "capitalize" }}>{lead}</strong> is winning by {lift.toFixed(0)}%. {ab.monthly.views + ab.annual.views < 200 ? "Keep gathering data before deciding (aim for 200+ visitors per side)." : "Sample is getting meaningful — consider locking in the winner."}</> : "No difference yet — keep gathering data."}
            </p>
          </section>
        );
      })()}

      {/* Affiliate payouts */}
      {pay && pay.rows.length > 0 && (
        <section style={{ ...card, marginTop: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <h2 style={h2}>Affiliate payouts</h2>
            <span style={{ color: "#555", fontSize: 14 }}>${pay.totalOwed.toLocaleString()} owed</span>
          </div>
          <table style={table}>
            <thead><tr><Th>Affiliate</Th><Th>Signups</Th><Th>Conversions</Th><Th>Owed</Th><Th> </Th></tr></thead>
            <tbody>
              {pay.rows.map((r) => (
                <tr key={r.referrer} style={{ borderTop: "1px solid #eee" }}>
                  <Td>{r.referrer}</Td><Td>{r.signups}</Td><Td>{r.conversions}</Td>
                  <Td><strong>${r.owed.toLocaleString()}</strong></Td>
                  <Td>{r.owed > 0 ? <button onClick={() => act("markPayoutPaid", { referrer: r.referrer }, "Marked paid ✓")} style={btnSmall}>Mark paid</button> : <span style={{ color: "#0a7d33" }}>Settled</span>}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Customers */}
      <section style={{ ...card, marginTop: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <h2 style={h2}>Customers ({filtered.length})</h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" style={{ ...input, width: 180 }} />
            <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)} style={{ ...input, width: 130 }}>
              <option value="all">All plans</option>
              {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
        {actMsg ? <p style={{ color: actMsg.includes("fail") || actMsg.includes("not") ? "#e3342b" : "#0a7d33", fontSize: 14, marginTop: 8 }}>{actMsg}</p> : null}
        <div style={{ overflowX: "auto" }}>
          <table style={table}>
            <thead><tr><Th>Business</Th><Th>Owner</Th><Th>Plan</Th><Th>Convos</Th><Th>Leads</Th><Th>Revenue</Th><Th>Source</Th><Th> </Th></tr></thead>
            <tbody>
              {filtered.map((c) => (
                <React.Fragment key={c.id}>
                  <tr style={{ borderTop: "1px solid #eee", background: openId === c.id ? "#fafafa" : "transparent" }}>
                    <Td><strong>{c.business || "—"}</strong></Td>
                    <Td><span style={{ color: "#555" }}>{c.owner || "—"}</span></Td>
                    <Td><span style={planBadge(c.plan)}>{c.plan}</span></Td>
                    <Td>{c.convos}</Td><Td>{c.leads}</Td>
                    <Td>{c.revenue ? "$" + c.revenue.toLocaleString() : "—"}</Td>
                    <Td>{c.referrer ? <span title={c.referrer} style={{ color: "#2bc4e6" }}>referral</span> : <span style={{ color: "#bbb" }}>direct</span>}</Td>
                    <Td><button onClick={() => openCustomer(c.id)} style={btnSmall}>{openId === c.id ? "Close" : "Manage"}</button></Td>
                  </tr>
                  {openId === c.id && (
                    <tr>
                      <td colSpan={8} style={{ padding: 0 }}>
                        <div style={{ background: "#fafafa", border: "1px solid #eee", borderRadius: 12, padding: 16, margin: "0 0 8px" }}>
                          {detailBusy ? <p style={{ color: "#888" }}>Loading…</p> : detail ? <DrillDown d={detail} act={act} /> : <p style={{ color: "#888" }}>—</p>}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function DrillDown({ d, act }: { d: Detail; act: (a: string, e: Record<string, unknown>, n: string) => void }) {
  const b = d.bot;
  const [plan, setPlan] = useState(b.plan);
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 12 }}>
        <Mini label="Plan" value={b.plan} />
        <Mini label="Revenue" value={"$" + (d.revenue || 0).toLocaleString()} />
        <Mini label="Leads" value={b.leads} />
        <Mini label="Conversations" value={b.convos} />
        <Mini label="Messages" value={b.messages} />
        <Mini label="Joined" value={d.user?.createdAt ? d.user.createdAt.slice(0, 10) : "—"} />
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <select value={plan} onChange={(e) => setPlan(e.target.value)} style={{ ...input, width: 130 }}>
          {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <button onClick={() => act("setPlan", { botId: b.id, plan }, "Plan updated ✓")} style={btnSmall}>Set plan</button>
        <button onClick={() => act("extendTrial", { botId: b.id, days: 14 }, "Trial extended 14 days ✓")} style={btnSmall}>+14d trial</button>
        <button onClick={() => act("endTrial", { botId: b.id }, "Trial ended, set active ✓")} style={btnSmall}>End trial → active</button>
        {d.user?.email ? <button onClick={() => act("resendWelcome", { email: d.user!.email }, "Welcome email sent ✓")} style={btnSmall}>Resend welcome</button> : null}
        <a href={"/demo?b=" + b.id} target="_blank" rel="noreferrer" style={btnSmallLink}>Preview bot</a>
      </div>

      {b.trialEnds ? <div style={{ fontSize: 13, color: "#b8860b" }}>Trial ends {new Date(b.trialEnds).toLocaleDateString()}</div> : null}
      {d.referral?.referrer ? <div style={{ fontSize: 13, color: "#555" }}>Referred by <strong>{d.referral.referrer}</strong> ({d.referral.status}{d.referral.commission ? ", $" + d.referral.commission + " commission" : ""})</div> : null}

      {/* Leads + transcripts */}
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 700, margin: "4px 0 8px" }}>Leads ({d.leads.length})</h3>
        {d.leads.length === 0 ? <p style={{ color: "#999", fontSize: 13 }}>No leads yet.</p> : (
          <div style={{ display: "grid", gap: 8 }}>
            {d.leads.slice(0, 25).map((l) => (
              <details key={l.id} style={{ background: "#fff", border: "1px solid #eee", borderRadius: 9, padding: "8px 11px" }}>
                <summary style={{ cursor: "pointer", fontSize: 13 }}>
                  <strong>{l.name || l.email || l.phone || "Visitor"}</strong>
                  <span style={{ color: "#999" }}> · {l.at ? l.at.slice(0, 10) : ""}</span>
                  {l.email ? <span style={{ color: "#555" }}> · {l.email}</span> : null}
                  {l.phone ? <span style={{ color: "#555" }}> · {l.phone}</span> : null}
                </summary>
                <div style={{ marginTop: 8, fontSize: 13, color: "#333" }}>{l.message}</div>
                {l.transcript && l.transcript.length > 0 ? (
                  <div style={{ marginTop: 8, borderTop: "1px dashed #eee", paddingTop: 8, display: "grid", gap: 4 }}>
                    {l.transcript.map((t, i) => (
                      <div key={i} style={{ fontSize: 12, color: t.role === "user" ? "#0A0A0A" : "#777" }}>
                        <strong>{t.role === "user" ? "Visitor" : "Mascot"}:</strong> {t.content}
                      </div>
                    ))}
                  </div>
                ) : null}
              </details>
            ))}
          </div>
        )}
      </div>

      {/* Orders */}
      {d.orders.length > 0 && (
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, margin: "4px 0 8px" }}>Orders</h3>
          <div style={{ display: "grid", gap: 4 }}>
            {d.orders.map((o, i) => (
              <div key={o.id || i} style={{ fontSize: 13, color: "#333" }}>${Number(o.amount || 0).toLocaleString()} · {o.status || "paid"} · {o.createdAt ? o.createdAt.slice(0, 10) : ""}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---- small presentational helpers ---- */
function Kpi({ label, value, sub, accent }: { label: string; value: React.ReactNode; sub?: string; accent?: string }) {
  return (
    <div style={{ border: "1px solid #ececec", borderRadius: 14, padding: "14px 16px", background: "#fff" }}>
      <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", color: accent || "#0A0A0A" }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "#888", marginTop: 3 }}>{label}</div>
      {sub ? <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>{sub}</div> : null}
    </div>
  );
}
function Mini({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #eee", borderRadius: 9, padding: "9px 11px" }}>
      <div style={{ fontSize: 16, fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: 11, color: "#999", textTransform: "uppercase", letterSpacing: "0.03em" }}>{label}</div>
    </div>
  );
}
function Chart({ title, data, labels, color, money }: { title: string; data: number[]; labels: string[]; color: string; money?: boolean }) {
  const max = Math.max(1, ...data);
  const total = data.reduce((s, n) => s + n, 0);
  const W = 240, H = 70, n = data.length, bw = W / n;
  return (
    <div style={{ border: "1px solid #ececec", borderRadius: 14, padding: "14px 16px", background: "#fff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 13, fontWeight: 700 }}>{title}</span>
        <span style={{ fontSize: 13, color: "#888" }}>{money ? "$" + Math.round(total).toLocaleString() : total.toLocaleString()}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 70, marginTop: 8, display: "block" }} preserveAspectRatio="none">
        {data.map((v, i) => {
          const h = (v / max) * (H - 6);
          return <rect key={i} x={i * bw + 1} y={H - h} width={bw - 2} height={h} rx={1.5} fill={color} opacity={v === 0 ? 0.15 : 0.85} />;
        })}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#bbb", marginTop: 2 }}>
        <span>{labels[0]?.slice(5)}</span><span>{labels[labels.length - 1]?.slice(5)}</span>
      </div>
    </div>
  );
}
function FunnelStep({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ flex: "1 1 130px", minWidth: 120 }}>
      <div style={{ fontSize: 22, fontWeight: 800 }}>{value}</div>
      <div style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>{label} · {pct}%</div>
      <div style={{ height: 8, background: "#f0f0f0", borderRadius: 4, overflow: "hidden" }}>
        <div style={{ width: pct + "%", height: "100%", background: "#0A0A0A" }} />
      </div>
    </div>
  );
}
function Th({ children }: { children: React.ReactNode }) {
  return <th style={{ textAlign: "left", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em", color: "#999", fontWeight: 700, padding: "8px 10px" }}>{children}</th>;
}
function Td({ children }: { children: React.ReactNode }) {
  return <td style={{ fontSize: 13, padding: "9px 10px", verticalAlign: "middle" }}>{children}</td>;
}

const wrap: React.CSSProperties = { maxWidth: 1100, margin: "0 auto", padding: "40px 22px 90px", fontFamily: "system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif" };
const h1: React.CSSProperties = { fontSize: 30, fontWeight: 800, letterSpacing: "-0.02em", margin: 0 };
const h2: React.CSSProperties = { fontSize: 18, fontWeight: 700, margin: 0 };
const card: React.CSSProperties = { border: "1px solid #ececec", borderRadius: 16, padding: "18px 20px", background: "#fff" };
const table: React.CSSProperties = { width: "100%", borderCollapse: "collapse", marginTop: 10 };
const input: React.CSSProperties = { boxSizing: "border-box", border: "1px solid #ddd", borderRadius: 9, padding: "8px 11px", fontSize: 14, fontFamily: "inherit", background: "#fff" };
const btnSmall: React.CSSProperties = { background: "#f2f2f2", color: "#111", border: "1px solid #e2e2e2", borderRadius: 8, padding: "6px 11px", fontWeight: 600, fontSize: 13, cursor: "pointer" };
const btnSmallLink: React.CSSProperties = { ...btnSmall, textDecoration: "none", display: "inline-block" };
const link: React.CSSProperties = { color: "#e3342b", fontWeight: 600, textDecoration: "none", fontSize: 14 };

function planBadge(plan: string): React.CSSProperties {
  const map: Record<string, string> = { active: "#0a7d33", trial: "#b8860b", demo: "#666", starter: "#444", disabled: "#c0392b" };
  return { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "#fff", background: map[plan] || "#444", borderRadius: 6, padding: "3px 7px", display: "inline-block" };
}
