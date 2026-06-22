"use client";

import { useState } from "react";
import { useCart } from "@/components/CartProvider";

type Plan = { id: string; name: string; monthly: number; annual: number; setup: number; featured?: boolean; label: string; feats: string[] };

const PLANS: Plan[] = [
  { id: "starter", name: "Starter", monthly: 249, annual: 199, setup: 500, label: "Get started", feats: ["Custom animated mascot", "FAQ brain trained on your business", "Text chat + lead capture to email/CRM", "Fully hosted & maintained", "1 website"] },
  { id: "pro", name: "Pro", monthly: 599, annual: 479, setup: 1500, featured: true, label: "Most popular", feats: ["Everything in Starter", "Talking voice mascot (natural voice + lip-sync)", "Booking + calendar", "CRM / SMS routing", "Monthly tuning + performance report", "Priority build"] },
  { id: "premium", name: "Premium", monthly: 1199, annual: 959, setup: 2500, label: "Premium", feats: ["Everything in Pro", "Multi-page knowledge + custom integrations", "Multiple mascots / multi-location", "A/B tuning", "Priority support"] },
];

type Billing = "monthly" | "annual" | "prepay3";

function money(n: number) {
  return "$" + n.toLocaleString();
}

export default function Pricing() {
  const [billing, setBilling] = useState<Billing>("annual");
  const [mascot, setMascot] = useState<"predesigned" | "custom">("predesigned");
  const CUSTOM_FEE = 300;
  const { add, setOpen } = useCart();

  function perMonth(p: Plan) {
    return billing === "monthly" ? p.monthly : p.annual;
  }
  function setupFor(p: Plan) {
    return billing === "prepay3" ? 0 : p.setup;
  }
  function oneTimeFor(p: Plan) {
    return setupFor(p) + (mascot === "custom" ? CUSTOM_FEE : 0);
  }
  function billingLabel() {
    if (billing === "monthly") return "billed monthly";
    if (billing === "annual") return "billed yearly";
    return "3-year prepay";
  }
  function addPlan(p: Plan) {
    const detail =
      billing === "prepay3"
        ? "3-year prepay — setup waived"
        : billing === "annual"
        ? "Billed yearly (save 20%)"
        : "Billed monthly";
    add({ id: "plan-" + p.id, name: p.name + " plan", kind: "plan", monthly: perMonth(p), oneTime: oneTimeFor(p), billing, detail: detail + (mascot === "custom" ? " · custom mascot" : " · predesigned mascot") });
  }
  function addService(id: string, name: string, price: number, detail: string) {
    add({ id, name, kind: "addon", monthly: 0, oneTime: price, detail });
  }

  const toggle: [Billing, string][] = [
    ["monthly", "Monthly"],
    ["annual", "Annual −20%"],
    ["prepay3", "3 years · setup waived"],
  ];

  return (
    <section id="pricing" className="scroll-mt-24 border-t-2 border-ink">
      <div className="mx-auto max-w-7xl px-5 py-24">
        <h2 className="mb-3 text-4xl font-bold tracking-tightest md:text-6xl">Simple, honest pricing.</h2>
        <p className="mb-8 max-w-lg text-smoke">Flat monthly — no per-message credits, no surprise overage bills. We build it, host it, and keep it sharp. Cancel anytime.</p>

        <div className="mb-10 flex flex-col items-start gap-3">
          <div className="inline-flex flex-wrap gap-1 rounded-full border-2 border-ink p-1">
            {toggle.map(([id, lbl]) => (
              <button key={id} onClick={() => setBilling(id)} className={"rounded-full px-4 py-2 text-sm font-semibold transition " + (billing === id ? "bg-ink text-paper" : "text-ink hover:bg-ink/5")}>{lbl}</button>
            ))}
          </div>
          <div className="inline-flex flex-wrap gap-1 rounded-full border-2 border-ink p-1">
            {(["predesigned", "custom"] as const).map((id) => (
              <button key={id} onClick={() => setMascot(id)} className={"rounded-full px-4 py-2 text-sm font-semibold transition " + (mascot === id ? "bg-ink text-paper" : "text-ink hover:bg-ink/5")}>{id === "predesigned" ? "Predesigned mascot" : "Custom mascot"}</button>
            ))}
          </div>
          <p className="max-w-lg text-sm text-smoke">{mascot === "predesigned" ? "Pick from our 30+ ready-made mascots — the fastest, most affordable option." : `We craft a one-of-a-kind mascot for you (or use your own artwork) — +${money(CUSTOM_FEE)} one-time.`}</p>
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
                {billingLabel()}
                {" · "}
                {billing === "prepay3" ? "setup waived 🎉" : money(setupFor(p)) + " setup"}
                {mascot === "custom" ? " · +" + money(CUSTOM_FEE) + " custom mascot" : ""}
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
                Add {p.name} to cart
              </button>
            </div>
          ))}
        </div>

        {/* THNK add-ons */}
        <div className="mt-8">
          <div className="mb-3 text-xs font-bold uppercase tracking-widest text-smoke">Add a website service · by THNK.biz</div>
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
