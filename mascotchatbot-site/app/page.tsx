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

// Full character roster shown in the gallery. Mr Amp is the live, click-to-talk demo.
const CHARACTERS = [
  { img: "01-realtor-female-classic", name: "Ava", niche: "Realtor" },
  { img: "02-realtor-female-glam", name: "Bianca", niche: "Realtor" },
  { img: "03-realtor-male", name: "Marcus", niche: "Realtor" },
  { img: "04-dentist-male", name: "Dr. Bright", niche: "Dental" },
  { img: "12-dentist-female", name: "Dr. Dana", niche: "Dental" },
  { img: "10-doctor-male", name: "Dr. Cole", niche: "Medical" },
  { img: "13-doctor-female", name: "Dr. Maya", niche: "Medical" },
  { img: "16-nurse-female", name: "Nina", niche: "Nursing" },
  { img: "15-medspa-female", name: "Skye", niche: "Med-spa" },
  { img: "05-fitness-coach-male", name: "Coach Rex", niche: "Fitness" },
  { img: "14-fitness-coach-female", name: "Coach Tara", niche: "Fitness" },
  { img: "18-gym-instructor-female-blonde", name: "Brooke", niche: "Gym" },
  { img: "06-plumber-home-services-male", name: "Max", niche: "Home Services" },
  { img: "08-electrician-male", name: "Sparky", niche: "Electrician" },
  { img: "19-mechanic-male", name: "Gus", niche: "Auto Repair" },
  { img: "09-contractor-male-cap-vest", name: "Bo", niche: "Contractor" },
  { img: "11-general-contractor-male", name: "Hank", niche: "General Contractor" },
  { img: "20-attorney-male", name: "Vance", niche: "Law Firm" },
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

      {/* DEMOS / GALLERY */}
      <section id="demos" className="border-t-2 border-ink bg-paper">
        <div className="mx-auto max-w-7xl px-5 py-24">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-4xl font-bold tracking-tightest md:text-6xl">Meet the family.</h2>
            <p className="max-w-sm text-smoke"><b className="text-ink">Mr Amp is live right now</b> — click him in the bottom-right corner (turn your sound on), or tap his card. Every mascot below is custom to a brand, voice, and business.</p>
          </div>

          {/* Mr Amp — live demo */}
          <OpenMascot className="group mb-10 flex w-full items-center gap-6 rounded-3xl border-2 border-ink bg-ink p-6 text-left text-paper transition hover:opacity-90 md:p-8">
            <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-[#e3342b]">
              <svg width="58" height="58" viewBox="0 0 200 200" aria-hidden="true">
                <line x1="100" y1="22" x2="100" y2="6" stroke="#fff" strokeWidth="8" strokeLinecap="round" />
                <circle cx="100" cy="5" r="8" fill="#fff" />
                <rect x="20" y="22" width="160" height="126" rx="36" fill="#fff" />
                <path d="M50 134 L50 180 L94 140 Z" fill="#fff" />
                <circle cx="74" cy="76" r="13" fill="#e3342b" />
                <circle cx="128" cy="76" r="13" fill="#e3342b" />
                <path d="M70 104 q31 26 62 0" stroke="#e3342b" strokeWidth="11" fill="none" strokeLinecap="round" />
              </svg>
            </span>
            <span className="flex-1">
              <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-smoke">
                Electrician <span className="rounded-full bg-[#e3342b] px-2 py-0.5 text-[10px] text-paper">LIVE</span>
              </span>
              <span className="mt-1 block text-3xl font-bold tracking-tight">Mr Amp</span>
              <span className="mt-1 block text-smoke">The fully animated, talking demo — click to hear him pitch.</span>
            </span>
            <span className="hidden shrink-0 text-lg font-semibold md:block">talk to him →</span>
          </OpenMascot>

          {/* Full roster */}
          <div className="grid grid-cols-2 gap-px border-2 border-ink bg-ink sm:grid-cols-3 lg:grid-cols-6">
            {CHARACTERS.map((c) => (
              <div key={c.img} className="group flex aspect-[3/4] flex-col overflow-hidden bg-paper p-3 text-left">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-smoke">{c.niche}</span>
                <span className="flex flex-1 items-center justify-center overflow-hidden py-1">
                  <img
                    src={`/mascots/${c.img}.jpg`}
                    alt={`${c.name} — ${c.niche} mascot`}
                    loading="lazy"
                    className="h-full w-full object-contain mix-blend-multiply transition-transform duration-300 ease-out group-hover:scale-110"
                  />
                </span>
                <span className="text-base font-bold">{c.name}</span>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-smoke">Don&apos;t see your industry? We build any character for any business — that&apos;s the whole point.</p>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="border-t-2 border-ink">
        <div className="mx-auto max-w-7xl px-5 py-24">
          <h2 className="mb-3 text-4xl font-bold tracking-tightest md:text-6xl">Simple pricing.</h2>
          <p className="mb-14 max-w-lg text-smoke">A one-time build, then a flat monthly to host, monitor, and keep it sharp. Cancel anytime.</p>
          <div className="grid items-start gap-6 md:grid-cols-3">
            {TIERS.map((t) => (
              <div key={t.name} className={`flex h-full flex-col rounded-3xl border p-8 transition ${t.featured ? "border-ink bg-ink text-paper shadow-xl md:-mt-3 md:scale-[1.03]" : "border-ink/15 bg-paper shadow-sm hover:-translate-y-1 hover:shadow-md"}`}>
                {t.featured
                  ? <span className="mb-4 inline-block w-fit rounded-full bg-paper px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-ink">Most popular</span>
                  : <span className="mb-4 inline-block w-fit rounded-full border border-ink/15 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-smoke">{t.name === "Starter" ? "Get started" : "Premium"}</span>}
                <h3 className="text-2xl font-bold tracking-tight">{t.name}</h3>
                <div className="mt-4 flex items-end gap-1">
                  <span className="text-6xl font-bold tracking-tightest">{t.price}</span>
                  <span className={`mb-2 ${t.featured ? "text-paper/60" : "text-smoke"}`}>/mo</span>
                </div>
                <p className={`mt-1 text-sm ${t.featured ? "text-paper/60" : "text-smoke"}`}>{t.setup} one-time setup</p>
                <div className={`my-6 h-px w-full ${t.featured ? "bg-paper/20" : "bg-ink/10"}`} />
                <ul className="flex-1 space-y-3.5 text-sm">
                  {t.feats.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <svg width="18" height="18" viewBox="0 0 20 20" className="mt-0.5 shrink-0" aria-hidden="true">
                        <circle cx="10" cy="10" r="10" fill={t.featured ? "#ffffff" : "#0A0A0A"} />
                        <path d="M5.5 10.5l2.8 2.8 6-6.4" fill="none" stroke={t.featured ? "#0A0A0A" : "#ffffff"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="#cta" className={`mt-8 rounded-full px-6 py-3.5 text-center font-semibold transition ${t.featured ? "bg-paper text-ink hover:opacity-90" : "bg-ink text-paper hover:opacity-90"}`}>
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
            Tell us your business. We&apos;ll build a talking demo of your own mascot — free — before you pay a cent.
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
