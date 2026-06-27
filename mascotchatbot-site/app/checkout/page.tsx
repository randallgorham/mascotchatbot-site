"use client";

import SiteHeader from "@/components/SiteHeader";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";

function money(n: number) {
  return "$" + n.toLocaleString();
}

export default function Checkout() {
  const { items, monthlyTotal, oneTimeTotal, remove, clear } = useCart();
  const [form, setForm] = useState({ business: "", email: "", website: "", notes: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [orderId, setOrderId] = useState("");
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending"); setErr("");
    try {
      const r = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, items, monthly: monthlyTotal, oneTime: oneTimeTotal }),
      });
      const d = await r.json();
      if (d.ok) {
        // If Stripe is connected, send them straight to secure payment; otherwise confirm + invoice.
        try {
          const cs = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items, email: form.email }) });
          const cd = await cs.json();
          if (cd && cd.ok && cd.url) { clear(); window.location.href = cd.url; return; }
        } catch {
          /* fall through to invoice flow */
        }
        setOrderId(d.id); setStatus("done"); clear();
      } else { setErr(d.error || "Something went wrong."); setStatus("error"); }
    } catch {
      setErr("Network error — please try again."); setStatus("error");
    }
  }

  return (
    <main className="min-h-screen bg-paper text-ink" style={{ fontFamily: "ui-sans-serif,system-ui,Arial,sans-serif" }}>
      <SiteHeader />

      <div className="mx-auto max-w-5xl px-5 py-12">
        <h1 className="mb-8 text-4xl font-bold tracking-tightest">Checkout</h1>

        {status === "done" ? (
          <div className="rounded-3xl border-2 border-ink bg-paper p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ink">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 6.5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <h2 className="mt-5 text-2xl font-bold tracking-tight">Order received! 🎉</h2>
            <p className="mx-auto mt-2 max-w-md text-smoke">Thanks — your order <b className="text-ink">{orderId}</b> is in. We&apos;ll email you within one business day to confirm details and send your secure payment link, then start building your mascot.</p>
            <a href="/" className="mt-6 inline-block rounded-full bg-ink px-6 py-3 font-semibold text-paper transition hover:opacity-90">Back to home</a>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-ink/30 p-12 text-center text-smoke">
            Your cart is empty. <a href="/#pricing" className="font-semibold text-ink underline">Choose a plan →</a>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-[1fr_0.9fr]">
            {/* Form */}
            <form onSubmit={submit} className="order-2 rounded-3xl border border-ink/15 bg-paper p-6 shadow-sm md:order-1">
              <h2 className="mb-4 text-lg font-bold">Tell us about your business</h2>
              <p className="mb-5 text-sm text-smoke">This is what we need to build and deliver your mascot chatbot.</p>
              <div className="space-y-3">
                <Field label="Business name" value={form.business} onChange={(v) => setForm({ ...form, business: v })} placeholder="Acme Plumbing" required />
                <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="you@business.com" required />
                <Field label="Website" value={form.website} onChange={(v) => setForm({ ...form, website: v })} placeholder="https://yoursite.com" />
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-smoke">What should your mascot do?</span>
                  <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={4} placeholder="Answer FAQs, book appointments, capture leads… plus your hours, services, and any character ideas."
                    className="w-full rounded-xl border-2 border-ink/15 bg-white px-4 py-3 text-ink outline-none focus:border-ink" />
                </label>
              </div>
              <button disabled={status === "sending"} className="mt-5 w-full rounded-full bg-ink px-6 py-4 font-semibold text-paper transition hover:opacity-90 disabled:opacity-60">
                {status === "sending" ? "Placing order…" : "Place order"}
              </button>
              {err && <p className="mt-3 text-center text-sm font-medium text-red-600">{err}</p>}
              <p className="mt-3 text-center text-xs text-smoke">No charge today. We confirm details and email a secure payment link.</p>
            </form>

            {/* Summary */}
            <div className="order-1 md:order-2">
              <div className="rounded-3xl border-2 border-ink bg-paper p-6">
                <h2 className="mb-4 text-lg font-bold">Order summary</h2>
                <ul className="space-y-3">
                  {items.map((it) => (
                    <li key={it.id} className="flex items-start justify-between gap-2 border-b border-ink/10 pb-3">
                      <div>
                        <div className="font-semibold">{it.name}</div>
                        {it.detail && <div className="text-xs text-smoke">{it.detail}</div>}
                      </div>
                      <div className="shrink-0 text-right text-sm">
                        {it.monthly > 0 && <div className="font-semibold">{money(it.monthly)}/mo</div>}
                        {it.oneTime > 0 && <div className={it.monthly > 0 ? "text-smoke" : "font-semibold"}>{money(it.oneTime)} once</div>}
                        <button onClick={() => remove(it.id)} className="mt-0.5 text-xs text-smoke underline hover:text-ink">remove</button>
                      </div>
                    </li>
                  ))}
                </ul>
                {(() => {
                  const plan = items.find((i) => i.kind === "plan");
                  const term = (plan && plan.billing) || "monthly";
                  const months = term === "annual" ? 12 : term === "prepay3" ? 36 : 1;
                  const subLabel = term === "annual" ? "Billed yearly" : term === "prepay3" ? "Billed once for 3 years" : "Billed monthly";
                  const prepaid = monthlyTotal * months;
                  const total = prepaid + oneTimeTotal;
                  return (
                    <>
                      {/* Lead with the monthly rate; the total is the secondary line. */}
                      <div className="mt-4 border-t border-ink/10 pt-4">
                        <div className="flex items-end gap-1.5">
                          <span className="text-4xl font-bold tracking-tightest">{money(monthlyTotal)}</span>
                          <span className="mb-1.5 text-smoke">/mo</span>
                        </div>
                        <p className="mt-1 text-sm text-smoke">
                          {subLabel}
                          {term === "prepay3" ? " · setup waived" : oneTimeTotal > 0 ? " · " + money(oneTimeTotal) + " setup" : ""}
                        </p>
                      </div>
                      <div className="mt-4 space-y-1.5 text-sm">
                        {months > 1 ? (
                          <div className="flex justify-between"><span className="text-smoke">{months} months prepaid ({months} &times; {money(monthlyTotal)})</span><span className="font-medium">{money(prepaid)}</span></div>
                        ) : (
                          <div className="flex justify-between"><span className="text-smoke">First month</span><span className="font-medium">{money(monthlyTotal)}</span></div>
                        )}
                        {oneTimeTotal > 0 && (
                          <div className="flex justify-between"><span className="text-smoke">Setup &amp; one-time</span><span className="font-medium">{money(oneTimeTotal)}</span></div>
                        )}
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-ink/10 pt-3 text-sm">
                        <span className="text-smoke">Total billed today</span>
                        <span className="font-bold">{money(total)}</span>
                      </div>
                      <p className="mt-1.5 text-xs text-smoke">
                        {term === "prepay3"
                          ? "One payment covers 3 full years, then renews at " + money(monthlyTotal) + "/mo."
                          : term === "annual"
                          ? "Renews yearly at " + money(monthlyTotal * 12) + "/yr."
                          : "Then " + money(monthlyTotal) + "/mo — cancel anytime."}
                      </p>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function Field({ label, value, onChange, placeholder, type = "text", required = false }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-smoke">{label}</span>
      <input type={type} value={value} required={required} placeholder={placeholder} onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border-2 border-ink/15 bg-white px-4 py-3 text-ink outline-none focus:border-ink" />
    </label>
  );
}
