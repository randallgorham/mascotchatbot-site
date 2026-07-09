"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/components/CartProvider";

export type Mascot = { img: string; name: string; niche: string; say?: string; ext?: string };

const CSS = `
@keyframes mcMarq{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@keyframes mcbBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
@keyframes mcbWiggle{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}
@keyframes mcbSway{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-6px) rotate(3deg)}}
@keyframes mcbNod{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-3px) scale(1.06)}}
.mc-marq-track{display:flex;width:max-content;align-items:flex-end;animation:mcMarq 200s linear infinite}
.mc-marq-strip:hover .mc-marq-track{animation-play-state:paused}
@media (prefers-reduced-motion:reduce){.mc-marq-track{animation:none}}
`;

const MODAL_CSS = `
@keyframes mcModalIn{from{opacity:0;transform:translateY(14px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
.mc-modal-card{animation:mcModalIn .28s cubic-bezier(.2,.7,.2,1) both}
@media (prefers-reduced-motion:reduce){.mc-modal-card{animation:none}}
`;

// Price of the "predesigned mascot" tier (Step 1 option 1).
const PREDESIGNED_PRICE = 499;

function srcOf(m: Mascot) {
  return `/mascots/${m.img}.${m.ext || "png"}`;
}

// Scroll to the pricing section reliably. Fire a few times to clear the brief
// scroll-lock that happens right after the modal closes.
function goToPricing() {
  const doScroll = () => {
    const el = document.getElementById("pricing");
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.pageYOffset - 8;
    window.scrollTo({ top: y, behavior: "smooth" });
  };
  window.setTimeout(doScroll, 200);
  window.setTimeout(doScroll, 550);
  window.setTimeout(doScroll, 850);
  try {
    history.replaceState(null, "", "#pricing");
  } catch {
    /* ignore */
  }
}

function MascotModal({ mascot, onClose }: { mascot: Mascot | null; onClose: () => void }) {
  const { add } = useCart();

  useEffect(() => {
    if (!mascot) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [mascot, onClose]);

  if (!mascot) return null;

  function buy() {
    if (mascot) {
      // Picking a ready-made character = Step 1, option 1 (predesigned, $499).
      add({
        id: "mascot",
        kind: "mascot",
        name: "Predesigned mascot",
        detail: mascot.niche + " — ready-made character",
        monthly: 0,
        oneTime: PREDESIGNED_PRICE,
        tier: "predesigned",
        img: mascot.img,
      });
    }
    onClose();
    goToPricing();
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${mascot.niche} mascot`}
    >
      <style>{MODAL_CSS}</style>
      <div className="mc-modal-card relative w-full max-w-md overflow-hidden rounded-3xl border-2 border-ink bg-paper shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 border-ink bg-paper text-lg font-bold transition hover:bg-ink hover:text-paper"
        >
          ✕
        </button>
        <div className="flex items-center justify-center border-b-2 border-ink bg-[#f3f4f6] px-6 pb-4 pt-8">
          <img src={srcOf(mascot)} alt={`${mascot.niche} mascot`} className="h-52 w-52 object-contain mix-blend-multiply" />
        </div>
        <div className="p-6">
          <div className="text-[11px] font-bold uppercase tracking-widest text-smoke">Predesigned mascot</div>
          <h3 className="mt-1 text-2xl font-bold tracking-tight">The {mascot.niche} mascot</h3>
          <p className="mt-3 text-sm leading-relaxed text-smoke">
            A ready-made animated {mascot.niche.toLowerCase()} character that lives on your site, greets every visitor, answers their
            questions in your voice, and books the job — 24/7, hosted and maintained by us.
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {["Rigged to move, blink & talk", "Trained on your business", "Captures leads & books jobs 24/7", "One line of code — we host it"].map((f) => (
              <li key={f} className="flex items-start gap-2">
                <span className="mt-0.5 text-ink">✓</span>
                {f}
              </li>
            ))}
          </ul>
          <p className="mt-4 rounded-2xl border border-ink/15 bg-paper px-4 py-3 text-sm text-smoke">
            <b className="text-ink">$499 one-time</b> for a predesigned mascot — then pick your monthly plan on the next step.
          </p>
          <button
            onClick={buy}
            className="mt-5 w-full rounded-full bg-ink px-6 py-3.5 text-center font-semibold text-paper shadow-[0_8px_22px_rgba(10,10,10,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(10,10,10,0.35)]"
          >
            Pick this mascot →
          </button>
          <button onClick={onClose} className="mt-2 w-full rounded-full px-6 py-2.5 text-center text-sm font-semibold text-smoke transition hover:text-ink">
            Keep looking
          </button>
        </div>
      </div>
    </div>
  );
}

export function MascotMarquee({ mascots }: { mascots: Mascot[] }) {
  const [sel, setSel] = useState<Mascot | null>(null);
  const anims = ["mcbBob", "mcbWiggle", "mcbSway", "mcbNod"];
  return (
    <section className="relative overflow-hidden border-t-2 border-ink bg-paper">
      <style>{CSS}</style>
      {/* solid black bar behind the names */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-11 border-t-2 border-ink bg-ink" />
      <div className="mc-marq-strip relative">
        <div className="mc-marq-track pt-9">
          {[...mascots, ...mascots].map((c, i) => {
            const a = anims[i % anims.length];
            return (
              <button
                key={i}
                type="button"
                onClick={() => setSel(c)}
                title={`${c.niche} — click to pick`}
                className="group mx-4 flex w-28 shrink-0 cursor-pointer flex-col items-center sm:w-36"
              >
                <span className="mb-2 flex h-[100px] w-[100px] items-center justify-center transition-transform duration-200 group-hover:scale-[1.08] sm:h-[120px] sm:w-[120px]">
                  <img
                    src={srcOf(c)}
                    alt={`${c.niche} mascot`}
                    loading="lazy"
                    className="h-full w-full object-contain mix-blend-multiply"
                    style={{ animation: `${a} ${(2.4 + (i % 5) * 0.35).toFixed(2)}s ease-in-out infinite`, animationDelay: `${((i % 7) * 0.2).toFixed(2)}s`, willChange: "transform" }}
                  />
                </span>
                <span className="relative z-10 flex h-11 items-center justify-center whitespace-nowrap text-sm font-bold tracking-tight text-paper group-hover:underline">{c.niche}</span>
              </button>
            );
          })}
        </div>
      </div>
      <MascotModal mascot={sel} onClose={() => setSel(null)} />
    </section>
  );
}

export function MascotRoster({ mascots }: { mascots: Mascot[] }) {
  const [sel, setSel] = useState<Mascot | null>(null);
  return (
    <>
      <div className="grid grid-cols-2 gap-px border-2 border-ink bg-ink sm:grid-cols-3 lg:grid-cols-6">
        {mascots.map((c) => (
          <button
            type="button"
            key={c.img}
            id={`mascot-${c.img}`}
            onClick={() => setSel(c)}
            className="group relative flex aspect-[3/4] scroll-mt-28 cursor-pointer flex-col overflow-hidden bg-paper p-3 text-left"
          >
            <span className="text-[10px] font-semibold uppercase tracking-widest text-smoke">{c.niche}</span>
            <span className="pointer-events-none absolute left-1/2 top-1 z-20 -translate-x-1/2 translate-y-1 opacity-0 transition-all duration-200 ease-out group-hover:-translate-y-1 group-hover:opacity-100">
              <span className="relative block whitespace-nowrap rounded-2xl border-2 border-ink bg-paper px-3 py-1.5 text-xs font-extrabold text-ink shadow-[3px_3px_0_0_#e3342b]">
                Pick me!
                <span className="absolute -bottom-1.5 left-4 h-2 w-2 rounded-full border-2 border-ink bg-paper" />
                <span className="absolute -bottom-[11px] left-2 h-1.5 w-1.5 rounded-full border-2 border-ink bg-paper" />
              </span>
            </span>
            <span className="flex flex-1 items-center justify-center overflow-hidden py-1">
              <img
                src={srcOf(c)}
                alt={`${c.niche} mascot`}
                loading="lazy"
                className="h-full w-full object-contain mix-blend-multiply transition-transform duration-300 ease-out group-hover:scale-[1.08]"
              />
            </span>
            <span className="text-base font-bold">{c.name}</span>
          </button>
        ))}
      </div>
      <MascotModal mascot={sel} onClose={() => setSel(null)} />
    </>
  );
}
