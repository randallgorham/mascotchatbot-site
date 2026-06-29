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
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#2bc4e6] font-black text-neutral-900">M</span>
          Admin
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
