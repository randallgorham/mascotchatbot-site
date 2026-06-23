"use client";

// Agency console: manage many client bots from one login, white-label each,
// grab embed codes, and edit each client's mascot settings inline.
import React, { useEffect, useState, useCallback } from "react";

type BotRow = {
  id: string;
  business: string;
  industry: string;
  plan: string;
  badge: boolean;
  image: string;
  leads: number;
};

type FullBot = {
  id: string;
  business: string;
  industry: string;
  about: string;
  facts: string;
  notes: string;
  cta: string;
  ctaUrl: string;
  greet: boolean;
  wave: boolean;
  wink: boolean;
  voice: string;
  accent: string;
  badge: boolean;
  plan: string;
};

const VOICES = ["alloy", "ash", "ballad", "coral", "echo", "sage", "shimmer", "verse"];
const ORIGIN = "https://www.mascotchatbot.com";

async function api(action: string, extra: Record<string, unknown> = {}) {
  const r = await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...extra }),
  });
  return r.json().catch(() => ({ ok: false }));
}

export default function ClientsPage() {
  const [bots, setBots] = useState<BotRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [signedOut, setSignedOut] = useState(false);
  const [err, setErr] = useState("");

  const [newBiz, setNewBiz] = useState("");
  const [newInd, setNewInd] = useState("");
  const [creating, setCreating] = useState(false);

  const [edit, setEdit] = useState<FullBot | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [copied, setCopied] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const me = await api("me");
    if (!me || !me.user) {
      setSignedOut(true);
      setLoading(false);
      return;
    }
    const res = await api("listBots");
    if (res && res.ok) setBots(res.bots || []);
    else setErr((res && res.error) || "Could not load your clients.");
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function addClient() {
    if (!newBiz.trim()) return;
    setCreating(true);
    const res = await api("createBot", { business: newBiz.trim(), industry: newInd.trim() });
    setCreating(false);
    if (res && res.ok) {
      setNewBiz("");
      setNewInd("");
      await load();
    } else {
      setErr((res && res.error) || "Could not add the client.");
    }
  }

  async function openEditor(id: string) {
    setSavedMsg("");
    const res = await api("getBot", { botId: id });
    if (res && res.ok && res.bot) {
      const b = res.bot;
      setEdit({
        id: b.id,
        business: b.business || "",
        industry: b.industry || "",
        about: b.about || "",
        facts: b.facts || "",
        notes: b.notes || "",
        cta: b.cta || "",
        ctaUrl: b.ctaUrl || "",
        greet: !!b.greet,
        wave: !!b.wave,
        wink: !!b.wink,
        voice: b.voice || "ash",
        accent: b.accent || "#e3342b",
        badge: !!b.badge,
        plan: b.plan || "active",
      });
    }
  }

  async function saveEditor() {
    if (!edit) return;
    setSaving(true);
    const res = await api("saveBot", {
      botId: edit.id,
      bot: {
        business: edit.business,
        industry: edit.industry,
        about: edit.about,
        facts: edit.facts,
        notes: edit.notes,
        cta: edit.cta,
        ctaUrl: edit.ctaUrl,
        greet: edit.greet,
        wave: edit.wave,
        wink: edit.wink,
        voice: edit.voice,
        accent: edit.accent,
        badge: edit.badge,
      },
    });
    setSaving(false);
    if (res && res.ok) {
      setSavedMsg("Saved.");
      await load();
    } else {
      setSavedMsg((res && res.error) || "Could not save.");
    }
  }

  function embedFor(id: string) {
    return '<script src="' + ORIGIN + '/widget.js" data-bot="' + id + '" defer></script>';
  }

  async function copyEmbed(id: string) {
    try {
      await navigator.clipboard.writeText(embedFor(id));
      setCopied(id);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  }

  if (loading) {
    return (
      <main style={wrap}>
        <p style={{ color: "#888" }}>Loading your client workspace…</p>
      </main>
    );
  }

  if (signedOut) {
    return (
      <main style={wrap}>
        <h1 style={h1}>Agency console</h1>
        <p style={{ color: "#555", marginTop: 8 }}>
          Please <a href="/account" style={link}>sign in</a> to manage your client mascots.
        </p>
      </main>
    );
  }

  return (
    <main style={wrap}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <h1 style={h1}>Agency console</h1>
        <a href="/account" style={link}>← Back to dashboard</a>
      </div>
      <p style={{ color: "#555", margin: "8px 0 22px", maxWidth: 620 }}>
        Manage every client mascot from one login. Add a client, grab their embed code, flip on
        white-label to remove our badge, and tune each bot{"’"}s settings.
      </p>

      {err ? <p style={{ color: "#e3342b", marginBottom: 16 }}>{err}</p> : null}

      {/* Add a client */}
      <section style={card}>
        <h2 style={h2}>Add a client</h2>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}>
          <input
            value={newBiz}
            onChange={(e) => setNewBiz(e.target.value)}
            placeholder="Client business name"
            style={{ ...input, flex: "2 1 220px" }}
          />
          <input
            value={newInd}
            onChange={(e) => setNewInd(e.target.value)}
            placeholder="Industry (optional)"
            style={{ ...input, flex: "1 1 160px" }}
          />
          <button onClick={addClient} disabled={creating || !newBiz.trim()} style={btnPrimary}>
            {creating ? "Adding…" : "Add client"}
          </button>
        </div>
      </section>

      {/* Client grid */}
      <section style={{ marginTop: 22 }}>
        <h2 style={h2}>Your clients ({bots.length})</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14, marginTop: 12 }}>
          {bots.map((b) => (
            <div key={b.id} style={tile}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <strong style={{ fontSize: 16 }}>{b.business}</strong>
                <span style={planBadge(b.plan)}>{b.plan}</span>
              </div>
              <div style={{ color: "#888", fontSize: 13, marginTop: 2 }}>{b.industry || "—"}</div>
              <div style={{ color: "#555", fontSize: 13, marginTop: 10 }}>
                {b.leads} lead{b.leads === 1 ? "" : "s"} captured
              </div>
              <div style={{ fontSize: 12, marginTop: 6, color: b.badge ? "#999" : "#0a7d33" }}>
                {b.badge ? "Badge shown" : "White-labeled ✓"}
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
                <button onClick={() => openEditor(b.id)} style={btnSmall}>Edit</button>
                <button onClick={() => copyEmbed(b.id)} style={btnSmall}>
                  {copied === b.id ? "Copied!" : "Copy embed"}
                </button>
                <a href={"/demo?b=" + b.id} target="_blank" rel="noreferrer" style={btnSmallLink}>Preview</a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Inline editor */}
      {edit ? (
        <section style={{ ...card, marginTop: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={h2}>Editing: {edit.business}</h2>
            <button onClick={() => setEdit(null)} style={btnSmall}>Close</button>
          </div>

          <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
            <Row label="Business name">
              <input value={edit.business} onChange={(e) => setEdit({ ...edit, business: e.target.value })} style={input} />
            </Row>
            <Row label="Industry">
              <input value={edit.industry} onChange={(e) => setEdit({ ...edit, industry: e.target.value })} style={input} />
            </Row>
            <Row label="About (what they do)">
              <textarea value={edit.about} onChange={(e) => setEdit({ ...edit, about: e.target.value })} style={{ ...input, minHeight: 60 }} />
            </Row>
            <Row label="Key facts (hours, services, FAQ)">
              <textarea value={edit.facts} onChange={(e) => setEdit({ ...edit, facts: e.target.value })} style={{ ...input, minHeight: 70 }} />
            </Row>
            <Row label="Special instructions / personality">
              <textarea value={edit.notes} onChange={(e) => setEdit({ ...edit, notes: e.target.value })} style={{ ...input, minHeight: 50 }} />
            </Row>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Row label="Call to action">
                <input value={edit.cta} onChange={(e) => setEdit({ ...edit, cta: e.target.value })} style={input} />
              </Row>
              <Row label="CTA link (optional)">
                <input value={edit.ctaUrl} onChange={(e) => setEdit({ ...edit, ctaUrl: e.target.value })} style={input} />
              </Row>
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <Row label="Voice">
                <select value={edit.voice} onChange={(e) => setEdit({ ...edit, voice: e.target.value })} style={input}>
                  {VOICES.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </Row>
              <Row label="Accent color">
                <input type="color" value={edit.accent} onChange={(e) => setEdit({ ...edit, accent: e.target.value })} style={{ ...input, padding: 2, width: 60 }} />
              </Row>
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 4 }}>
              <Check label="Auto-greet" v={edit.greet} on={(x) => setEdit({ ...edit, greet: x })} />
              <Check label="Wave" v={edit.wave} on={(x) => setEdit({ ...edit, wave: x })} />
              <Check label="Wink" v={edit.wink} on={(x) => setEdit({ ...edit, wink: x })} />
            </div>

            <div style={{ background: "#fafafa", border: "1px solid #eee", borderRadius: 10, padding: "12px 14px", marginTop: 4 }}>
              <Check
                label="White-label (remove “Powered by MascotChatbot” badge)"
                v={!edit.badge}
                on={(x) => setEdit({ ...edit, badge: !x })}
              />
              <div style={{ color: "#999", fontSize: 12, marginTop: 6 }}>
                Turn this on for reseller clients so the widget shows only their brand.
              </div>
            </div>

            <div style={{ background: "#0A0A0A", color: "#9fe", borderRadius: 10, padding: "12px 14px", fontFamily: "monospace", fontSize: 12, overflowX: "auto" }}>
              {embedFor(edit.id)}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <button onClick={saveEditor} disabled={saving} style={btnPrimary}>
                {saving ? "Saving…" : "Save changes"}
              </button>
              {savedMsg ? <span style={{ color: savedMsg === "Saved." ? "#0a7d33" : "#e3342b", fontSize: 14 }}>{savedMsg}</span> : null}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block", flex: "1 1 200px" }}>
      <span style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#333", marginBottom: 5 }}>{label}</span>
      {children}
    </label>
  );
}

function Check({ label, v, on }: { label: string; v: boolean; on: (x: boolean) => void }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 14, color: "#222", cursor: "pointer" }}>
      <input type="checkbox" checked={v} onChange={(e) => on(e.target.checked)} />
      {label}
    </label>
  );
}

const wrap: React.CSSProperties = { maxWidth: 980, margin: "0 auto", padding: "48px 22px 80px", fontFamily: "system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif" };
const h1: React.CSSProperties = { fontSize: 30, fontWeight: 800, letterSpacing: "-0.02em", margin: 0 };
const h2: React.CSSProperties = { fontSize: 18, fontWeight: 700, margin: 0 };
const card: React.CSSProperties = { border: "1px solid #ececec", borderRadius: 14, padding: "18px 20px", background: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,0.03)" };
const tile: React.CSSProperties = { border: "1px solid #ececec", borderRadius: 14, padding: "16px 16px", background: "#fff" };
const input: React.CSSProperties = { width: "100%", boxSizing: "border-box", border: "1px solid #ddd", borderRadius: 9, padding: "9px 11px", fontSize: 14, fontFamily: "inherit", background: "#fff" };
const btnPrimary: React.CSSProperties = { background: "#0A0A0A", color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontWeight: 600, fontSize: 14, cursor: "pointer" };
const btnSmall: React.CSSProperties = { background: "#f2f2f2", color: "#111", border: "1px solid #e2e2e2", borderRadius: 8, padding: "7px 12px", fontWeight: 600, fontSize: 13, cursor: "pointer" };
const btnSmallLink: React.CSSProperties = { ...btnSmall, textDecoration: "none", display: "inline-block" };
const link: React.CSSProperties = { color: "#e3342b", fontWeight: 600, textDecoration: "none" };

function planBadge(plan: string): React.CSSProperties {
  const map: Record<string, string> = { active: "#0a7d33", trial: "#b8860b", demo: "#666", starter: "#444" };
  return { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "#fff", background: map[plan] || "#444", borderRadius: 6, padding: "3px 7px" };
}
