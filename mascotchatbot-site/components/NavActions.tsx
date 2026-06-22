"use client";

import { useCart } from "@/components/CartProvider";

function money(n: number) {
  return "$" + n.toLocaleString();
}

export default function NavActions() {
  const { items, remove, open, setOpen, monthlyTotal, oneTimeTotal } = useCart();
  const count = items.length;

  return (
    <div className="flex items-center gap-2">
      <button onClick={() => setOpen(!open)} aria-label="Cart"
        className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink transition hover:bg-ink hover:text-paper">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 6h15l-1.5 9h-12z" /><path d="M6 6 5 3H2" /><circle cx="9" cy="20" r="1.4" /><circle cx="18" cy="20" r="1.4" />
        </svg>
        {count > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#e3342b] px-1 text-[11px] font-bold text-white">{count}</span>
        )}
      </button>

      <a href="/account" aria-label="Your account"
        className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink transition hover:bg-ink hover:text-paper">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" />
        </svg>
      </a>

      {open && (
        <>
          <div className="fixed inset-0 z-[60] bg-black/40" onClick={() => setOpen(false)} aria-hidden="true" />
          <aside className="fixed right-0 top-0 z-[61] flex h-full w-full max-w-sm flex-col bg-paper text-ink shadow-2xl">
            <div className="flex items-center justify-between border-b-2 border-ink px-5 py-4">
              <span className="text-lg font-bold tracking-tight">Your order</span>
              <button onClick={() => setOpen(false)} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-ink/5 text-2xl leading-none">&times;</button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {count === 0 ? (
                <p className="mt-10 text-center text-smoke">Your cart is empty.<br />Add a plan to get started.</p>
              ) : (
                <ul className="space-y-3">
                  {items.map((it) => (
                    <li key={it.id} className="rounded-2xl border border-ink/10 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold">{it.name}</div>
                          {it.detail && <div className="text-xs text-smoke">{it.detail}</div>}
                        </div>
                        <button onClick={() => remove(it.id)} aria-label="Remove" className="text-smoke hover:text-ink">&times;</button>
                      </div>
                      <div className="mt-2 text-sm">
                        {it.monthly > 0 && <span className="font-semibold">{money(it.monthly)}/mo</span>}
                        {it.monthly > 0 && it.oneTime > 0 && <span className="text-smoke"> + </span>}
                        {it.oneTime > 0 && <span className="font-semibold">{money(it.oneTime)} one-time</span>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {count > 0 && (
              <div className="border-t-2 border-ink px-5 py-4">
                <div className="mb-1 flex justify-between text-sm"><span className="text-smoke">Monthly</span><span className="font-bold">{money(monthlyTotal)}/mo</span></div>
                <div className="mb-4 flex justify-between text-sm"><span className="text-smoke">One-time today</span><span className="font-bold">{money(oneTimeTotal)}</span></div>
                <a href="/checkout" onClick={() => setOpen(false)} className="block rounded-full bg-ink px-6 py-3.5 text-center font-semibold text-paper transition hover:opacity-90">Checkout →</a>
              </div>
            )}
          </aside>
        </>
      )}
    </div>
  );
}
