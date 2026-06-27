"use client";

import SiteHeader from "@/components/SiteHeader";
import { useState } from "react";
import NavActions from "@/components/NavActions";

const MASCOTS = [
  { img: "vet", name: "Bella" },
  { img: "hvac", name: "Reggie" },
  { img: "chef", name: "Theo" },
  { img: "hair", name: "Gigi" },
  { img: "tattoo", name: "Ink" },
  { img: "landscaper", name: "Diego" },
];

function cleanDomain(raw: string): string {
  let d = raw.trim().replace(/^https?:\/\//i, "").replace(/\/.*$/, "").replace(/^www\./i, "");
  if (!d) d = "yourbusiness.com";
  return d;
}

export default function PreviewPage() {
  const [url, setUrl] = useState("");
  const [shown, setShown] = useState("");
  const [pick, setPick] = useState(0);
  const domain = cleanDomain(shown || "yourbusiness.com");
  const m = MASCOTS[pick];

  return (
    <main className="min-h-screen bg-paper text-ink">
      <SiteHeader />

      <section className="mx-auto max-w-5xl px-5 pb-24 pt-14 text-center">
        <h1 className="text-4xl font-bold tracking-tightest md:text-6xl">See your mascot in action.</h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-smoke">Type your website and watch a talking mascot come to life on it — exactly how your visitors would see it.</p>

        <form onSubmit={(e) => { e.preventDefault(); setShown(url); }} className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="yourbusiness.com" aria-label="Your website"
            className="flex-1 rounded-full border-2 border-ink px-5 py-3.5 text-base outline-none focus:ring-2 focus:ring-[#e3342b]/40" />
          <button type="submit" className="rounded-full bg-ink px-7 py-3.5 font-semibold text-paper shadow-[0_8px_22px_rgba(10,10,10,0.28)] transition hover:-translate-y-0.5">Show me →</button>
        </form>

        {/* mascot picker */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
          {MASCOTS.map((c, i) => (
            <button key={c.img} onClick={() => setPick(i)} aria-label={`Show ${c.name}`}
              className={"h-12 w-12 overflow-hidden rounded-xl border-2 transition " + (i === pick ? "border-ink ring-2 ring-[#e3342b]/30" : "border-ink/15 hover:border-ink/40")}>
              <img src={`/mascots/${c.img}.png`} alt="" className="h-full w-full scale-[1.35] object-cover object-top" />
            </button>
          ))}
        </div>

        {/* browser mock */}
        <div className="relative mx-auto mt-10 overflow-hidden rounded-2xl border-2 border-ink bg-white text-left shadow-[0_30px_80px_-20px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-2 border-b-2 border-ink bg-paper px-4 py-3">
            <span className="h-3 w-3 rounded-full bg-[#e3342b]" /><span className="h-3 w-3 rounded-full bg-[#f5b301]" /><span className="h-3 w-3 rounded-full bg-[#16a34a]" />
            <span className="ml-3 flex-1 truncate rounded-full bg-white px-4 py-1.5 text-sm text-smoke ring-1 ring-ink/10">https://{domain}</span>
          </div>

          <div className="relative h-[460px] overflow-hidden bg-gradient-to-b from-neutral-50 to-neutral-100">
            {/* faux site wireframe */}
            <div className="flex items-center justify-between px-8 py-5">
              <div className="h-5 w-32 rounded bg-neutral-300" />
              <div className="flex gap-3">{[0,1,2,3].map((i)=>(<div key={i} className="h-3 w-12 rounded bg-neutral-200" />))}</div>
            </div>
            <div className="px-8 pt-10">
              <div className="h-9 w-2/3 rounded bg-neutral-300" />
              <div className="mt-3 h-9 w-1/2 rounded bg-neutral-300" />
              <div className="mt-6 h-3 w-3/5 rounded bg-neutral-200" />
              <div className="mt-2 h-3 w-2/5 rounded bg-neutral-200" />
              <div className="mt-7 h-11 w-40 rounded-full bg-neutral-800" />
              <div className="mt-10 grid grid-cols-3 gap-4">{[0,1,2].map((i)=>(<div key={i} className="h-24 rounded-xl bg-white ring-1 ring-neutral-200" />))}</div>
            </div>

            {/* the mascot popping up */}
            <div className="absolute bottom-4 right-4 flex flex-col items-end">
              <div className="mb-2 max-w-[230px] rounded-2xl rounded-br-sm border-2 border-ink bg-white px-4 py-2.5 text-sm font-semibold shadow-[5px_5px_0_0_#e3342b]">
                Hi! 👋 Welcome to {domain} — how can I help you today?
              </div>
              <img src={`/mascots/${m.img}.png`} alt={`${m.name} mascot`} className="h-56 w-auto drop-shadow-[0_18px_28px_rgba(0,0,0,0.28)]" />
            </div>
          </div>
        </div>

        <div className="mt-10">
          <a href="/#pricing" className="inline-flex items-center gap-2 rounded-full bg-ink px-8 py-4 text-lg font-semibold text-paper shadow-[0_10px_26px_rgba(10,10,10,0.3)] transition hover:-translate-y-0.5">Put {m.name} on {domain} →</a>
          <p className="mt-4 text-sm text-smoke">This is a preview mockup. We&apos;ll build a real talking demo on your site — free.</p>
        </div>
      </section>
    </main>
  );
}
