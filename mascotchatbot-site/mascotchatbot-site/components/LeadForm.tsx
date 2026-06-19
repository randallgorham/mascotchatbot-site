"use client";

import { useState } from "react";

// 1) Go to https://web3forms.com, enter your email, copy the Access Key.
// 2) Paste it here. Submissions will be emailed to that address. No account/login needed.
const ACCESS_KEY = "REPLACE_WITH_YOUR_WEB3FORMS_ACCESS_KEY";

export default function LeadForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = e.currentTarget;
    const data = new FormData(form);
    data.append("access_key", ACCESS_KEY);
    data.append("subject", "New MascotChatbot demo request");
    data.append("from_name", "MascotChatbot website");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: data,
      });
      const json = await res.json();
      setStatus(json.success ? "done" : "error");
      if (json.success) form.reset();
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
        <span className="text-sm text-smoke">Something went wrong — try again or email us.</span>
      )}
    </form>
  );
}
