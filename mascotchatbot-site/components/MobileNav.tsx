"use client";

import { useState } from "react";

const LINKS: [string, string][] = [
  ["#how", "How it works"],
  ["#demos", "Demos"],
  ["#pricing", "Pricing"],
  ["#faq", "FAQ"],
];

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink transition hover:bg-ink hover:text-paper"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
          {open ? (
            <>
              <path d="M6 6l12 12" />
              <path d="M18 6L6 18" />
            </>
          ) : (
            <>
              <path d="M4 7h16" />
              <path d="M4 12h16" />
              <path d="M4 17h16" />
            </>
          )}
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute right-5 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border-2 border-ink bg-paper p-2 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.4)]">
            {LINKS.map(([href, label]) => (
              <a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-4 py-3 text-sm font-medium transition hover:bg-ink hover:text-paper"
              >
                {label}
              </a>
            ))}
            <a
              href="#cta"
              onClick={() => setOpen(false)}
              className="mt-1 block rounded-xl bg-ink px-4 py-3 text-center text-sm font-semibold text-paper transition hover:opacity-90"
            >
              Book a demo
            </a>
          </div>
        </>
      )}
    </div>
  );
}
