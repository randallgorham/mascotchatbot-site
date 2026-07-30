"use client";

import SiteHeader from "@/components/SiteHeader";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function CompleteInner() {
  const sp = useSearchParams();
  const sessionId = sp.get("session_id") || "";
  const [state, setState] = useState<"checking" | "paid" | "pending" | "error">("checking");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!sessionId) { setState("error"); return; }
    (async () => {
      try {
        const r = await fetch("/api/checkout/status?session_id=" + encodeURIComponent(sessionId));
        const d = await r.json();
        if (d && d.ok && (d.paymentStatus === "paid" || d.status === "complete")) { setEmail(d.email || ""); setState("paid"); }
        else if (d && d.ok) setState("pending");
        else setState("error");
      } catch { setState("error"); }
    })();
  }, [sessionId]);

  return (
    <main className="min-h-screen bg-paper text-ink" style={{ fontFamily: "ui-sans-serif,system-ui,Arial,sans-serif" }}>
      <SiteHeader />
      <div className="mx-auto max-w-2xl px-5 py-20 text-center">
        {state === "checking" && <p className="text-smoke">Confirming your payment…</p>}
        {state === "paid" && (
          <div className="rounded-3xl border-2 border-ink bg-paper p-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ink">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 6.5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <h1 className="mt-5 text-3xl font-bold tracking-tight">Payment complete! 🎉</h1>
            <p className="mx-auto mt-2 max-w-md text-smoke">Thank you{email ? ", " + email : ""}. Your account and mascot have been created — check your email to finish onboarding and grab your embed code.</p>
            <a href="/account" className="mt-6 inline-block rounded-full bg-ink px-6 py-3 font-semibold text-paper transition hover:opacity-90">Set up my mascot →</a>
          </div>
        )}
        {state === "pending" && (
          <div className="rounded-3xl border border-ink/20 p-10">
            <h1 className="text-2xl font-bold">Payment processing…</h1>
            <p className="mt-2 text-smoke">Your payment is being finalized. You&apos;ll get a confirmation email shortly — no need to pay again.</p>
          </div>
        )}
        {state === "error" && (
          <div className="rounded-3xl border border-ink/20 p-10">
            <h1 className="text-2xl font-bold">We couldn&apos;t confirm this payment.</h1>
            <p className="mt-2 text-smoke">If you were charged, you&apos;re all set and we&apos;ll email you. Otherwise, <a href="/#pricing" className="font-semibold text-ink underline">try again</a>.</p>
          </div>
        )}
      </div>
    </main>
  );
}

export default function CheckoutComplete() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-paper" />}>
      <CompleteInner />
    </Suspense>
  );
}
