"use client";

import { useState } from "react";

const WEBHOOK =
  "https://services.leadconnectorhq.com/hooks/tdPvZCqogPax3pstSXA8/webhook-trigger/2fe7d360-4cc7-4101-bde1-b3588511d8eb";

export default function LeadForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const business = String(data.get("business") || "");
    const email = String(data.get("email") || "");
    setStatus("sending");
    try {
      const body = new URLSearchParams({ business, email, source: "mascotchatbot.com" });
      await fetch(WEBHOOK, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });
      setStatus("done");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="mx-auto mt-10 max-w-xl rounded-3xl bg-paper p-8 text-center text-ink shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)]">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-ink">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 6.5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h3 className="mt-5 text-2xl font-bold tracking-tight">You&apos;re in.</h3>
        <p className="mt-2 text-smoke">
          We&apos;re building your free demo mascot now. Check your inbox in the next few minutes.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto mt-10 max-w-xl rounded-3xl bg-paper p-6 text-left shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5)] sm:p-8"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="business" className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-smoke">
            Business
          </label>
          <input
            id="business"
            name="business"
            type="text"
            required
            placeholder="Your business name"
            className="w-full rounded-xl border-2 border-ink/10 bg-white px-4 py-3 text-ink outline-none transition placeholder:text-smoke/70 focus:border-ink"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-smoke">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@business.com"
            className="w-full rounded-xl border-2 border-ink/10 bg-white px-4 py-3 text-ink outline-none transition placeholder:text-smoke/70 focus:border-ink"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-4 w-full rounded-xl bg-ink px-7 py-4 text-base font-semibold text-paper transition hover:opacity-90 disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Get my free demo"}
      </button>

      <p className="mt-3 text-center text-xs text-smoke">
        Free, no commitment. We&apos;ll build a live mascot for your site.
      </p>

      {status === "error" && (
        <p className="mt-3 text-center text-sm font-medium text-red-600">Something went wrong — try again.</p>
      )}
    </form>
  );
}
