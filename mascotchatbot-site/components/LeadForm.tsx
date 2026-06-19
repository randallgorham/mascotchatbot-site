"use client";

import { useState } from "react";

// Leads are sent to the MascotChatbot location in GoHighLevel via this inbound webhook.
const GHL_WEBHOOK =
  "https://services.leadconnectorhq.com/hooks/tdPvZCqogPax3pstSXA8/webhook-trigger/2fe7d360-4cc7-4101-bde1-b3588511d8eb";

export default function LeadForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = e.currentTarget;
    const fd = new FormData(form);
    const body = new URLSearchParams();
    body.set("email", String(fd.get("email") || ""));
    body.set("business", String(fd.get("business") || ""));
    body.set("source", "mascotchatbot.com");
    try {
      await fetch(GHL_WEBHOOK, { method: "POST", mode: "no-cors", body });
      setStatus("done");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <p className="mx-auto mt-10 max-w-md rounded-full border-2 border-paper px-6 py-4 text-center text-lg">
        Got it — we&apos;ll build your free demo and be in touch shortly. ⚡
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto mt-10 flex max-w-md flex-col gap-3 sm:flex-row">
      <input
        type="text"
        name="business"
        placeholder="Your business name"
        className="flex-1 rounded-full border-2 border-paper bg-transparent px-5 py-3 text-paper placeholder:text-smoke focus:outline-none"
      />
      <input
        type="email"
        name="email"
        required
        placeholder="you@business.com"
        className="flex-1 rounded-full border-2 border-paper bg-transparent px-5 py-3 text-paper placeholder:text-smoke focus:outline-none"
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-full bg-paper px-7 py-3 font-semibold text-ink transition hover:opacity-80 disabled:opacity-60"
      >
        {status === "sending" ? "Sending…" : "Get my free demo"}
      </button>
      {status === "error" && (
        <span className="text-sm text-smoke">Something went wrong — try again.</span>
      )}
    </form>
  );
}
