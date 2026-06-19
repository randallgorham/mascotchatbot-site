import MascotMock from "@/components/MascotMock";
import LeadForm from "@/components/LeadForm";
import OpenMascot from "@/components/OpenMascot";

const NICHES = [
  "Electricians","Realtors","HVAC","Dentists","Law firms","Med-spas",
  "Plumbers","Roofers","Auto repair","Gyms","Contractors","Clinics",
];

const STEPS = [
  { n: "01", t: "We design the mascot", d: "Your character or one we create — rigged to move, blink, and talk fluidly." },
  { n: "02", t: "We give it a brain", d: "Trained on your business so it answers accurately, in your voice." },
  { n: "03", t: "We host it on your site", d: "One line of code. It captures leads and books jobs 24/7. You do nothing." },
];

const DEMOS = [
  { name: "Mr Amp", tag: "Electrician" },
  { name: "Ava", tag: "Realtor" },
  { name: "Dr. Bright", tag: "Dental" },
  { name: "Coach Rex", tag: "Fitness" },
];

const TIERS = [
  { name: "Starter", setup: "$1,000+", price: "$300", feats: ["Branded mascot", "Text chat", "FAQ brain", "Lead capture to email", "1 website"] },
  { name: "Pro", setup: "$2,500+", price: "$600", feats: ["Custom animated mascot", "Booking + calendar", "CRM / SMS routing", "Monthly tuning + report", "Priority build"], featured: true },
  { name: "Voice", setup: "$4,500+", price: "$1,100", feats: ["Talking voice mascot", "Multi-page knowledge", "Custom integrations", "A/B tuning", "Priority support"] },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      {/* NAV */}
      <header className="sticky top-0 z-50 border-b-2 border-ink bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <a href="#top" className="flex items-center gap-3 text-2xl font-bold tracking-tightest">
            <svg width="60" height="60" viewBox="0 0 200 200" aria-hidden="true">
              <line x1="100" y1="22" x2="100" y2="6" stroke="#0A0A0A" strokeWidth="8" strokeLinecap="round" />
              <circle cx="100" cy="5" r="8" fill="#0A0A0A" />
              <rect x="20" y="22" width="160" height="126" rx="36" fill="#0A0A0A" />
              <path d="M50 134 L50 180 L94 140 Z" fill="#0A0A0A" />
              <circle cx="74" cy="76" r="13" fill="#fff" />
              <circle cx="128" cy="76" r="13" fill="#fff" />
              <path d="M70 104 q31 26 62 0" stroke="#fff" strokeWidth="11" fill="none" strokeLinecap="round" />
            </svg>
            <span>Mascot<span className="text-smoke">Chatbot</span></span>
          </a>
          <nav className="hidden gap-8 text-sm font-medium md:flex">
            <a href="#demos" className="hover:opacity-60">Demos</a>
            <a href="#how" className="hover:opacity-60">How it works</a>
            <a href="#pricing" className="hover:opacity-60">Pricing</a>
          </nav>
          <a href="#cta" className="rounded-full border-2 border-ink bg-ink px-5 py-2 text-sm font-semibold text-paper transition hover:bg-paper hover:text-ink">
            Book a demo
          </a>
        </div>
      </header>

      {/* HERO */}
      <section id="top" className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-20 pt-16 md:grid-cols-[1.15fr_0.85fr] md:pt-24">
        <div>
          <p className="mb-6 inline-block border-2 border-ink px-3 py-1 text-xs font-semibold uppercase tracking-widest">
            Animated AI mascots for websites
          </p>
          <h1 className="text-[15vw] font-bold leading-[0.86] tracking-tightest md:text-[7.5rem]">
            Your brand,<br />talking.
          </h1>
          <p className="mt-7 max-w-md text-lg leading-relaxed text-smoke">
            We build a custom animated mascot that lives on your website, talks to your
            visitors, answers their questions, and books the job — 24/7. Done for you. Hosted by us.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <a href="#cta" className="rounded-full bg-ink px-7 py-3 font-semibold text-paper transition hover:opacity-80">
              Get your mascot →
            </a>
            <OpenMascot className="rounded-full border-2 border-ink px-7 py-3 font-semibold transition hover:bg-ink hover:text-paper">
              See it talk
            </OpenMascot>
          </div>
        </div>
        <div className="flex justify-center md:justify-end">
          <MascotMock />
        </div>
      </section>

      {/* MARQUEE */}
      <section className="overflow-hidden border-y-2 border-ink bg-ink py-4 text-paper">
        <div className="flex w-max animate-marquee whitespace-nowrap">
          {[...NICHES, ...NICHES].map((n, i) => (
            <span key={i} className="mx-6 text-2xl font-bold tracking-tight">
              {n} <span className="mx-2 text-smoke">/</span>
            </span>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="mx-auto max-w-7xl px-5 py-24">
        <h2 className="mb-14 max-w-2xl text-4xl font-bold tracking-tightest md:text-6xl">
          A salesperson that never sleeps.
        </h2>
        <div className="grid gap-px border-2 border-ink bg-ink md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="bg-paper p-8">
              <div className="mb-6 text-sm font-bold text-smoke">{s.n}</div>
              <h3 className="mb-3 text-2xl font-bold tracking-tight">{s.t}</h3>
              <p className="text-smoke leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DEMOS */}
      <section id="demos" className="border-t-2 border-ink bg-paper">
        <div className="mx-auto max-w-7xl px-5 py-24">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-4xl font-bold tracking-tightest md:text-6xl">Meet a few.</h2>
            <p className="max-w-sm text-smoke"><b className="text-ink">Mr Amp is live right now</b> — click him in the bottom-right corner (turn your sound on), or tap his card. Every mascot is custom to your brand, voice, and business.</p>
          </div>
          <div className="grid gap-px border-2 border-ink bg-ink sm:grid-cols-2 lg:grid-cols-4">
            {DEMOS.map((d) => {
              const live = d.name === "Mr Amp";
              const inner = (
                <>
                  <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-smoke group-hover:text-paper">
                    {d.tag}
                    {live && <span className="rounded-full bg-[#e3342b] px-2 py-0.5 text-[10px] text-paper">LIVE</span>}
                  </span>
                  <span className="flex flex-1 items-center justify-center">
                    <span className="h-24 w-24 rounded-full border-2 border-current animate-floaty" />
                  </span>
                  <span className="flex items-center justify-between">
                    <span className="text-xl font-bold">{d.name}</span>
                    <span className="text-sm opacity-60">{live ? "talk →" : "soon"}</span>
                  </span>
                </>
              );
              const cls = "group flex aspect-[3/4] w-full flex-col justify-between bg-paper p-6 text-left transition hover:bg-ink hover:text-paper";
              return live ? (
                <OpenMascot key={d.name} className={cls}>{inner}</OpenMascot>
              ) : (
                <div key={d.name} className={cls + " opacity-70"}>{inner}</div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="border-t-2 border-ink">
        <div className="mx-auto max-w-7xl px-5 py-24">
          <h2 className="mb-3 text-4xl font-bold tracking-tightest md:text-6xl">Simple pricing.</h2>
          <p className="mb-14 max-w-lg text-smoke">A one-time build, then a flat monthly to host, monitor, and keep it sharp. Cancel anytime.</p>
          <div className="grid gap-px border-2 border-ink bg-ink md:grid-cols-3">
            {TIERS.map((t) => (
              <div key={t.name} className={`flex flex-col bg-paper p-8 ${t.featured ? "md:-my-4 md:border-2 md:border-ink md:shadow-[10px_10px_0_0_#0a0a0a]" : ""}`}>
                {t.featured && <span className="mb-4 inline-block w-fit bg-ink px-3 py-1 text-xs font-bold uppercase tracking-widest text-paper">Most popular</span>}
                <h3 className="text-2xl font-bold tracking-tight">{t.name}</h3>
                <div className="mt-4 flex items-end gap-1">
                  <span className="text-5xl font-bold tracking-tightest">{t.price}</span>
                  <span className="mb-1 text-smoke">/mo</span>
                </div>
                <p className="mt-1 text-sm text-smoke">{t.setup} setup</p>
                <ul className="mt-6 flex-1 space-y-3 text-sm">
                  {t.feats.map((f) => (
                    <li key={f} className="flex gap-2"><span className="font-bold">—</span>{f}</li>
                  ))}
                </ul>
                <a href="#cta" className={`mt-8 rounded-full px-6 py-3 text-center font-semibold transition ${t.featured ? "bg-ink text-paper hover:opacity-80" : "border-2 border-ink hover:bg-ink hover:text-paper"}`}>
                  Choose {t.name}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="bg-ink text-paper">
        <div className="mx-auto max-w-7xl px-5 py-28 text-center">
          <h2 className="mx-auto max-w-4xl text-5xl font-bold leading-[0.9] tracking-tightest md:text-8xl">
            Put a mascot on your site.
          </h2>
          <p className="mx-auto mt-7 max-w-xl text-lg text-smoke">
            Tell us your business. We'll build a talking demo of your own mascot — free — before you pay a cent.
          </p>
          <LeadForm />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t-2 border-paper bg-ink text-paper">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-smoke sm:flex-row">
          <span className="text-base font-bold tracking-tight text-paper">MASCOTCHATBOT</span>
          <span>© {new Date().getFullYear()} MascotChatbot. All rights reserved.</span>
          <a href="#top" className="hover:text-paper">Back to top ↑</a>
        </div>
      </footer>
    </main>
  );
}
