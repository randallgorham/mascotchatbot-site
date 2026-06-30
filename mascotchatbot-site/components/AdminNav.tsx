"use client";

// Shared admin navigation — identical on every /admin page, highlights the current one.
import { usePathname } from "next/navigation";

const TABS: { href: string; label: string }[] = [
  { href: "/admin", label: "Settings" },
  { href: "/admin/command", label: "Command Center" },
  { href: "/admin/fleet", label: "Fleet" },
];

export default function AdminNav() {
  const path = usePathname() || "";
  return (
    <header className="sticky top-0 z-50 border-b-2 border-neutral-900 bg-neutral-900 text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-5 py-3">
        <a href="/admin" className="mr-2 flex items-center gap-2 text-base font-extrabold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-white">
            <svg width="26" height="20" viewBox="100 52 182 138" aria-hidden="true">
              <rect x="104" y="104" width="14" height="40" rx="7" fill="#3a434f" />
              <rect x="262" y="104" width="14" height="40" rx="7" fill="#3a434f" />
              <rect x="115" y="58" width="150" height="116" rx="42" fill="#e4e9ef" stroke="#aab4c0" strokeWidth="3" />
              <ellipse cx="190" cy="118" rx="60" ry="44" fill="#2b333d" />
              <rect x="164" y="98" width="14" height="26" rx="7" fill="#2bc4e6" />
              <rect x="202" y="98" width="14" height="26" rx="7" fill="#2bc4e6" />
              <path d="M164 130 Q190 160 216 130 Z" fill="#2bc4e6" />
              <path d="M112 146 C 116 186, 150 194, 182 176" fill="none" stroke="#3a434f" strokeWidth="8" strokeLinecap="round" />
              <ellipse cx="184" cy="176" rx="10" ry="7" fill="#3a434f" />
            </svg>
          </span>
          <span>Mascot<span className="text-white/55">Chatbot</span> <span className="text-white/55">Admin</span></span>
        </a>
        <nav className="flex flex-wrap items-center gap-1.5">
          {TABS.map((t) => {
            const active = path === t.href;
            return (
              <a
                key={t.href}
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={
                  "rounded-full px-4 py-1.5 text-sm font-semibold transition " +
                  (active ? "bg-white text-neutral-900 shadow-sm" : "text-white/70 hover:bg-white/15 hover:text-white")
                }
              >
                {t.label}
              </a>
            );
          })}
        </nav>
        <a href="/" className="ml-auto text-sm font-medium text-white/70 transition hover:text-white">View site ↗</a>
      </div>
    </header>
  );
}
