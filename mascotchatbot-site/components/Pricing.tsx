"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/components/CartProvider";

// A/B experiment: half of new visitors see "Monthly" as the default billing
// toggle, half see "Annual". We measure which default drives more add-to-cart.
function abBeacon(event: string, variant: string) {
  if (!variant) return;
  try {
    fetch("/api/ab", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event, variant }), keepalive: true }).catch(() => {});
  } catch {
    /* ignore */
  }
}

type Plan = { id: string; name: string; monthly: number; annual: number; featured?: boolean; label: string; feats: string[] };

const PLANS: Plan[] = [
  { id: "starter", name: "Starter", monthly: 99, annual: 79, label: "The essentials", feats: ["Animated talking mascot on your website", "FAQ brain trained on your business", "Unlimited conversations, 24/7", "Lead capture straight to your email", "Appointment requests captured & emailed", "Conversation history + basic analytics", "1 website · fully hosted & maintained"] },
  { id: "pro", name: "Pro", monthly: 249, annual: 199, featured: true, label: "Most popular · capture & convert", feats: ["Everything in Starter", "Talking voice mascot — natural voice, lip-sync & hands-free mic", "CRM integration — leads auto-added (HubSpot, GoHighLevel & more)", "Instant SMS lead alerts + team routing", "Multilingual — replies in each visitor's language", "Remove \"Powered by MascotChatbot\" branding", "Monthly tuning + performance report · priority build"] },
  { id: "premium", name: "Premium", monthly: 499, annual: 399, label: "Automate & optimize", feats: ["Everything in Pro", "Two-way calendar booking — books real appointments (Google / Outlook / Calendly)", "Special mascot moves & interactive animations", "Multi-page / multi-site knowledge + custom integrations (API & webhooks)", "A/B tuning of greeting, voice & prompts to lift conversions", "Advanced analytics — response times, top questions, conversion funnels", "Dedicated success manager + priority SLA"] },
];

// One-time setup packages — the design + rigging + animation work to bring a mascot to life.
type MascotKey = "ours" | "animate" | "scratch";
const SETUP: Record<MascotKey, { fee: number; turn: string; label: string; blurb: string }> = {
  ours: { fee: 499, turn: "1–2 weeks", label: "Use one of our mascots", blurb: "Pick from our 30+ ready-made characters. We rig, animate, and wire it to your business — live in 1–2 weeks." },
  animate: { fee: 999, turn: "2–4 weeks", label: "Animate your mascot", blurb: "Send us your existing mascot or artwork and we rig + animate it into a talking bot — live in 2–4 weeks." },
  scratch: { fee: 1499, turn: "2–4 weeks", label: "Design from scratch", blurb: "We design a brand-new custom mascot for your brand and fully animate it — live in 2–4 weeks." },
};

type Billing = "monthly" | "annual";

function money(n: number) {
  return "$" + n.toLocaleString();
}

export default function Pricing() {
  const [billing, setBilling] = useState<Billing>("annual");
  const [mascot, setMascot] = useState<MascotKey>("ours");
  const [abVariant, setAbVariant] = useState<"monthly" | "annual" | "">("");
  const { add, setOpen } = useCart();

  // Assign (or re-read) the visitor's billing-default variant once, persist it
  // for 180 days, set the toggle to that default, and log a one-time view.
  useEffect(() => {
    const m = document.cookie.match(/mcb_abp=(monthly|annual)/);
    let v: "monthly" | "annual";
    if (m) {
      v = m[1] as "monthly" | "annual";
    } else {
      v = Math.random() < 0.5 ? "monthly" : "annual";
      document.cookie = "mcb_abp=" + v + "; path=/; max-age=15552000; samesite=lax";
      abBeacon("view", v);
    }
    setAbVariant(v);
    setBilling(v);
  }, []);

  function perMonth(p: Plan) {
    return billing === "monthly" ? p.monthly : p.annual;
  }
  const setupFee = SETUP[mascot].fee;
  const setupTurn = SETUP[mascot].turn;

  function addPlan(p: Plan) {
    const detail =
      (billing === "annual" ? "Billed yearly (save 20%)" : "Billed monthly") +
      " · " + SETUP[mascot].label + " (" + money(setupFee) + " setup, live in " + setupTurn + ")";
    add({ id: "plan-" + p.id, name: p.name + " plan", kind: "plan", monthly: perMonth(p), oneTime: setupFee, billing, detail });
    if (abVariant) abBeacon("cart", abVariant);
  }
  function addService(id: string, name: string, price: number, detail: string) {
    add({ id, name, kind: "addon", monthly: 0, oneTime: price, detail });
  }

  const toggle: [Billing, string][] = [
    ["monthly", "Monthly"],
    ["annual", "Annual −20%"],
  ];

  return (
    <section id="pricing" className="scroll-mt-24 border-t-2 border-ink">
      <div className="mx-auto max-w-7xl px-5 py-24">
        <h2 className="mb-3 text-4xl font-bold tracking-tightest md:text-6xl">Simple, honest pricing.</h2>
        <p className="mb-8 max-w-lg text-smoke">A flat monthly plan keeps your mascot live, answering, and improving — no per-message credits, no surprise bills. Plus a one-time setup to design &amp; rig your mascot. Cancel the monthly anytime.</p>

        {/* Step 1 — one-time setup / mascot path */}
        <div className="mb-8">
          <div className="mb-3 text-xs font-bold uppercase tracking-widest text-smoke">1 · Your mascot — one-time setup</div>
          <div className="grid gap-4 md:grid-cols-3">
            {(Object.keys(SETUP) as MascotKey[]).map((k) => {
              const s = SETUP[k];
              const active = mascot === k;
              return (
                <button key={k} onClick={() => setMascot(k)} className={"flex flex-col rounded-2xl border-2 p-5 text-left transition " + (active ? "border-ink bg-ink text-paper shadow-lg" : "border-ink/15 bg-paper hover:-translate-y-0.5 hover:shadow-md")}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold tracking-tight">{s.label}</span>
                    <span className={"flex h-5 w-5 items-center justify-center rounded-full border " + (active ? "border-paper" : "border-ink/30")}>{active ? "✓" : ""}</span>
                  </div>
                  <div className="mt-3 text-3xl font-bold tracking-tightest">{money(s.fee)}<span className={"ml-1 text-sm font-medium " + (active ? "text-paper/60" : "text-smoke")}>one-time</span></div>
                  <div className={"mt-1 text-xs font-semibold uppercase tracking-wider " + (active ? "text-paper/70" : "text-smoke")}>Live in {s.turn}</div>
                  <p className={"mt-2 text-sm leading-relaxed " + (active ? "text-paper/80" : "text-smoke")}>{s.blurb}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2 — monthly plan */}
        <div className="mb-5 flex flex-col items-start gap-3">
          <div className="text-xs font-bold uppercase tracking-widest text-smoke">2 · Monthly hosting plan</div>
          <div className="inline-flex flex-wrap gap-1 rounded-full border-2 border-ink p-1">
            {toggle.map(([id, lbl]) => (
              <button key={id} onClick={() => setBilling(id)} className={"rounded-full px-4 py-2 text-sm font-semibold transition " + (billing === id ? "bg-ink text-paper" : "text-ink hover:bg-ink/5")}>{lbl}</button>
            ))}
          </div>
        </div>

        <div className="grid items-start gap-6 md:grid-cols-3">
          {PLANS.map((p) => (
            <div key={p.id} className={"flex h-full flex-col rounded-3xl border p-8 transition " + (p.featured ? "border-ink bg-ink text-paper shadow-xl md:-mt-3 md:scale-[1.03]" : "border-ink/15 bg-paper shadow-sm hover:-translate-y-1 hover:shadow-md")}>
              <span className={"mb-4 inline-block w-fit rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest " + (p.featured ? "bg-paper text-ink" : "border border-ink/15 text-smoke")}>{p.label}</span>
              <h3 className="text-2xl font-bold tracking-tight">{p.name}</h3>
              <div className="mt-4 flex items-end gap-1">
                <span className="text-6xl font-bold tracking-tightest">{money(perMonth(p))}</span>
                <span className={"mb-2 " + (p.featured ? "text-paper/60" : "text-smoke")}>/mo</span>
              </div>
              <p className={"mt-1 text-sm " + (p.featured ? "text-paper/60" : "text-smoke")}>
                {billing === "annual" ? "billed yearly" : "billed monthly"}
                {" · "}
                {money(setupFee)} one-time setup
              </p>
              <div className={"my-6 h-px w-full " + (p.featured ? "bg-paper/20" : "bg-ink/10")} />
              <ul className="flex-1 space-y-3.5 text-sm">
                {p.feats.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <svg width="18" height="18" viewBox="0 0 20 20" className="mt-0.5 shrink-0" aria-hidden="true">
                      <circle cx="10" cy="10" r="10" fill={p.featured ? "#ffffff" : "#0A0A0A"} />
                      <path d="M5.5 10.5l2.8 2.8 6-6.4" fill="none" stroke={p.featured ? "#0A0A0A" : "#ffffff"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => addPlan(p)} className={"mt-8 rounded-full px-6 py-3.5 text-center font-semibold transition-all duration-300 hover:-translate-y-0.5 " + (p.featured ? "bg-paper text-ink shadow-[0_8px_22px_rgba(0,0,0,0.18)] hover:shadow-[0_14px_30px_rgba(0,0,0,0.28)]" : "bg-ink text-paper shadow-[0_8px_22px_rgba(10,10,10,0.28)] hover:shadow-[0_14px_30px_rgba(10,10,10,0.35)]")}>
                Add {p.name} — {money(perMonth(p))}/mo + {money(setupFee)}
              </button>
            </div>
          ))}
        </div>

        {/* THNK add-ons */}
        <div className="mt-8">
          <div className="mb-3 text-xs font-bold uppercase tracking-widest text-smoke">3 · Add a website (optional) · by THNK.biz</div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col rounded-3xl border-2 border-ink bg-paper p-7">
              <h3 className="text-xl font-bold tracking-tight">Website update</h3>
              <p className="mt-1 flex-1 text-sm text-smoke">A modern refresh of your existing site — up to 10 pages — rebuilt around your new mascot.</p>
              <div className="mt-4 text-3xl font-bold tracking-tightest">{money(999)} <span className="text-base font-medium text-smoke">one-time</span></div>
              <button onClick={() => addService("thnk-update", "Website update (up to 10 pages)", 999, "One-time · up to 10 pages, by THNK")} className="mt-5 rounded-full bg-ink px-6 py-3 font-semibold text-paper shadow-[0_8px_22px_rgba(10,10,10,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(10,10,10,0.35)]">Add to cart</button>
            </div>
            <div className="flex flex-col rounded-3xl border-2 border-ink bg-ink p-7 text-paper">
              <h3 className="text-xl font-bold tracking-tight">Full custom rebuild</h3>
              <p className="mt-1 flex-1 text-sm text-paper/70">A brand-new, fully custom website designed from scratch around your mascot.</p>
              <div className="mt-4 text-3xl font-bold tracking-tightest">from {money(1500)} <span className="text-base font-medium text-paper/60">one-time</span></div>
              <button onClick={() => addService("thnk-rebuild", "Full website rebuild by THNK", 1500, "One-time · full custom build, by THNK")} className="mt-5 rounded-full bg-paper px-6 py-3 font-semibold text-ink shadow-[0_8px_22px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(0,0,0,0.28)]">Add to cart</button>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-smoke">
          <button onClick={() => setOpen(true)} className="font-semibold text-ink underline">View cart & checkout →</button>
        </p>
      </div>
    </section>
  );
}
