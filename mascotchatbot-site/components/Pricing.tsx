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
  { id: "starter", name: "Starter", monthly: 99, annual: 79, label: "Get started", feats: ["Custom animated mascot", "FAQ brain trained on your business", "Text chat + lead capture to email/CRM", "Fully hosted & maintained", "1 website"] },
  { id: "pro", name: "Pro", monthly: 249, annual: 199, featured: true, label: "Most popular", feats: ["Everything in Starter", "Talking voice mascot (natural voice + lip-sync)", "Booking + calendar", "CRM / SMS routing", "Monthly tuning + performance report", "Priority build"] },
  { id: "premium", name: "Premium", monthly: 499, annual: 399, label: "Premium", feats: ["Everything in Pro", "Multi-page knowledge + custom integrations", "Special mascot animations", "A/B tuning", "Priority support"] },
];

type Tier = { id: "predesigned" | "rigged" | "custom"; price: number; name: string; tagline: string; blurb: string };

const TIERS: Tier[] = [
  { id: "predesigned", price: 499, name: "Pick a predesigned mascot", tagline: "Fastest & most affordable", blurb: "Choose any of our 150+ ready-made characters. We train it, give it a voice, and make it live." },
  { id: "rigged", price: 999, name: "Bring your own mascot", tagline: "You already have a character", blurb: "Send us your existing mascot or artwork — we design, rig, and animate it into a talking chatbot." },
  { id: "custom", price: 1499, name: "Full custom — made to look like you", tagline: "One of a kind", blurb: "We design a brand-new mascot from scratch — or make one in your likeness from a few photos you send. Cartoon-animated, voiced, and live." },
];

type Billing = "monthly" | "annual";

function money(n: number) {
  return "$" + n.toLocaleString();
}

function StepHeader({ n, title, sub, done }: { n: number; title: string; sub?: string; done?: boolean }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <span className={"flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-ink text-sm font-bold " + (done ? "bg-ink text-paper" : "bg-paper text-ink")}>
        {done ? "✓" : n}
      </span>
      <div>
        <h3 className="text-2xl font-bold tracking-tight md:text-3xl">
          <span className="text-smoke">Step {n} · </span>
          {title}
        </h3>
        {sub && <p className="text-sm text-smoke">{sub}</p>}
      </div>
    </div>
  );
}

export default function Pricing() {
  const [billing, setBilling] = useState<Billing>("annual");
  const [abVariant, setAbVariant] = useState<"monthly" | "annual" | "">("");
  const { items, add, setOpen } = useCart();

  const mascot = items.find((i) => i.kind === "mascot");
  const plan = items.find((i) => i.kind === "plan");

  // Assign (or re-read) the visitor's billing-default variant once.
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

  function pickTier(t: Tier) {
    if (t.id === "predesigned") {
      // Keep an already-picked character if there is one; otherwise send them to
      // the gallery to choose which ready-made mascot they want.
      if (mascot && mascot.tier === "predesigned" && mascot.img) return;
      add({ id: "mascot", kind: "mascot", name: "Predesigned mascot", detail: "Choose your character in the gallery ↓", monthly: 0, oneTime: t.price, tier: "predesigned" });
      const el = document.getElementById("demos");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    add({
      id: "mascot",
      kind: "mascot",
      name: t.id === "rigged" ? "Your mascot, rigged" : "Full custom mascot",
      detail: t.id === "rigged" ? "You send us your artwork — we rig it" : "Designed for you — or made to look like you",
      monthly: 0,
      oneTime: t.price,
      tier: t.id,
    });
  }

  function addPlan(p: Plan) {
    const detail = billing === "annual" ? "Billed yearly (save 20%)" : "Billed monthly";
    add({ id: "plan-" + p.id, name: p.name + " plan", kind: "plan", monthly: perMonth(p), oneTime: 0, billing, detail });
    if (abVariant) abBeacon("cart", abVariant);
  }
  function addService(id: string, name: string, price: number, detail: string) {
    add({ id, name, kind: "addon", monthly: 0, oneTime: price, detail });
  }

  return (
    <section id="pricing" className="scroll-mt-24 border-t-2 border-ink">
      <div className="mx-auto max-w-7xl px-5 py-24">
        <h2 className="mb-3 text-4xl font-bold tracking-tightest md:text-6xl">Simple, honest pricing.</h2>
        <p className="mb-12 max-w-xl text-smoke">Three quick steps: pick your mascot, choose your monthly plan, and add a website if you need one. Flat monthly — no per-message credits or surprise bills. Cancel anytime.</p>

        {/* ───── STEP 1 · MASCOT ───── */}
        <StepHeader n={1} title="Pick your mascot" sub="A one-time build. Choose how you want your character made." done={!!mascot} />

        {mascot ? (
          <div className="mb-6 flex items-center gap-4 rounded-3xl border-2 border-ink bg-paper p-4 shadow-sm">
            {mascot.img ? (
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-ink/10 bg-[#f3f4f6]">
                <img src={`/mascots/${mascot.img}.png`} alt="" className="h-14 w-14 object-contain mix-blend-multiply" />
              </span>
            ) : null}
            <div className="flex-1">
              <div className="text-sm font-bold">✓ {mascot.name} — {money(mascot.oneTime)} one-time</div>
              <div className="text-xs text-smoke">{mascot.detail}</div>
            </div>
            <a href="#demos" className="shrink-0 text-sm font-semibold text-smoke underline underline-offset-4 hover:text-ink">Change</a>
          </div>
        ) : null}

        <div className="mb-14 grid items-stretch gap-6 md:grid-cols-3">
          {TIERS.map((t) => {
            const selected = mascot && mascot.tier === t.id;
            return (
              <div key={t.id} className={"flex h-full flex-col rounded-3xl border-2 p-7 transition " + (selected ? "border-ink bg-ink text-paper shadow-xl" : "border-ink/15 bg-paper shadow-sm hover:-translate-y-1 hover:shadow-md")}>
                <span className={"mb-3 inline-block w-fit rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest " + (selected ? "bg-paper text-ink" : "border border-ink/15 text-smoke")}>{t.tagline}</span>
                <h4 className="text-xl font-bold tracking-tight">{t.name}</h4>
                <div className="mt-3 flex items-end gap-1">
                  <span className="text-4xl font-bold tracking-tightest">{money(t.price)}</span>
                  <span className={"mb-1 text-sm " + (selected ? "text-paper/60" : "text-smoke")}>one-time</span>
                </div>
                <p className={"mt-3 flex-1 text-sm leading-relaxed " + (selected ? "text-paper/75" : "text-smoke")}>{t.blurb}</p>
                <button onClick={() => pickTier(t)} className={"mt-6 rounded-full px-6 py-3 text-center font-semibold transition-all duration-300 hover:-translate-y-0.5 " + (selected ? "bg-paper text-ink" : "bg-ink text-paper shadow-[0_8px_22px_rgba(10,10,10,0.28)] hover:shadow-[0_14px_30px_rgba(10,10,10,0.35)]")}>
                  {selected ? "Selected ✓" : t.id === "predesigned" ? "Browse mascots →" : "Select"}
                </button>
              </div>
            );
          })}
        </div>

        {/* ───── STEP 2 · MONTHLY PLAN ───── */}
        <StepHeader n={2} title="Choose your monthly plan" sub="What your mascot can do each month. Cancel anytime." done={!!plan} />

        <div className="mb-8 inline-flex flex-wrap gap-1 rounded-full border-2 border-ink p-1">
          {([["monthly", "Monthly"], ["annual", "Annual −20%"]] as [Billing, string][]).map(([id, lbl]) => (
            <button key={id} onClick={() => setBilling(id)} className={"rounded-full px-4 py-2 text-sm font-semibold transition " + (billing === id ? "bg-ink text-paper" : "text-ink hover:bg-ink/5")}>{lbl}</button>
          ))}
        </div>

        <div className="mb-14 grid items-start gap-6 md:grid-cols-3">
          {PLANS.map((p) => {
            const selected = plan && plan.id === "plan-" + p.id;
            return (
              <div key={p.id} className={"flex h-full flex-col rounded-3xl border p-8 transition " + (p.featured ? "border-ink bg-ink text-paper shadow-xl md:-mt-3 md:scale-[1.03]" : "border-ink/15 bg-paper shadow-sm hover:-translate-y-1 hover:shadow-md")}>
                <span className={"mb-4 inline-block w-fit rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest " + (p.featured ? "bg-paper text-ink" : "border border-ink/15 text-smoke")}>{p.label}</span>
                <h3 className="text-2xl font-bold tracking-tight">{p.name}</h3>
                <div className="mt-4 flex items-end gap-1">
                  <span className="text-6xl font-bold tracking-tightest">{money(perMonth(p))}</span>
                  <span className={"mb-2 " + (p.featured ? "text-paper/60" : "text-smoke")}>/mo</span>
                </div>
                <p className={"mt-1 text-sm " + (p.featured ? "text-paper/60" : "text-smoke")}>{billing === "annual" ? "billed yearly (save 20%)" : "billed monthly"}</p>
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
                  {selected ? "Selected ✓ — change" : "Choose " + p.name}
                </button>
              </div>
            );
          })}
        </div>

        {/* ───── STEP 3 · WEBSITE (OPTIONAL) ───── */}
        <StepHeader n={3} title="Add a website (optional)" sub="Need your site updated or built around your new mascot? By THNK.biz." />

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

        <p className="mt-10 text-center text-sm text-smoke">
          Your picks show in the cart, top-right. <button onClick={() => setOpen(true)} className="font-semibold text-ink underline">View cart &amp; checkout →</button>
        </p>
      </div>
    </section>
  );
}
