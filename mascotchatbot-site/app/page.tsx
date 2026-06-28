import { HeroBot } from "@/components/BrandBot";
import LeadForm from "@/components/LeadForm";
import OpenMascot from "@/components/OpenMascot";
import MobileNav from "@/components/MobileNav";
import NavActions from "@/components/NavActions";
import Pricing from "@/components/Pricing";
import SiteFooter from "@/components/SiteFooter";
import { getSetting } from "@/lib/vault";

export const dynamic = "force-dynamic";

const TALK_CSS = `
@keyframes mcShine{0%{background-position:120% 0}100%{background-position:-120% 0}}
@keyframes mcEq{0%,100%{transform:scaleY(.22)}50%{transform:scaleY(1)}}
.mc-talk{background-image:linear-gradient(90deg,#0a0a0a 0%,#0a0a0a 42%,#2bc4e6 50%,#0a0a0a 58%,#0a0a0a 100%);background-size:250% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;animation:mcShine 2.6s linear infinite}
.mc-eq{display:inline-flex;align-items:flex-end;gap:.045em;height:.5em;margin-left:.16em;vertical-align:baseline}
.mc-eq i{width:.09em;min-width:3px;height:100%;background:#2bc4e6;border-radius:2px;transform-origin:bottom;animation:mcEq .9s ease-in-out infinite}
@media (prefers-reduced-motion:reduce){.mc-talk{animation:none;background:none;-webkit-text-fill-color:currentColor;color:inherit}.mc-eq i{animation:none}}
`;

const NICHES = [
  "Electricians","Realtors","HVAC","Dentists","Law firms","Med-spas",
  "Plumbers","Roofers","Auto repair","Gyms","Contractors","Clinics",
];

const STEPS = [
  { n: "01", t: "We design the mascot", d: "Your character or one we create — rigged to move, blink, and talk fluidly." },
  { n: "02", t: "We give it a brain", d: "Trained on your business so it answers accurately, in your voice." },
  { n: "03", t: "We host it on your site", d: "One line of code. It captures leads and books jobs 24/7. You do nothing." },
];

// Full character roster shown in the gallery. Robo is the live, click-to-talk demo.
const CHARACTERS: { img: string; name: string; niche: string; say: string; ext?: string }[] = [
  { img: "dr-volt-1", name: "Dr. Volt", niche: "Electrical", say: "Pick me!", ext: "png" },
  { img: "tattoo", name: "Ink", niche: "Tattoo Studio", say: "Pick me!", ext: "png" },
  { img: "massage", name: "Willow", niche: "Massage Therapy", say: "Pick me!", ext: "png" },
  { img: "barber", name: "Al", niche: "Barbershop", say: "Next chair's yours!", ext: "png" },
  { img: "florist", name: "Rosie", niche: "Florist", say: "Pick me!", ext: "png" },
  { img: "vet", name: "Bella", niche: "Veterinary", say: "Pick me!", ext: "png" },
  { img: "hvac", name: "Reggie", niche: "HVAC", say: "Pick me!", ext: "png" },
  { img: "chef", name: "Theo", niche: "Restaurant", say: "Pick me!", ext: "png" },
  { img: "hair", name: "Gigi", niche: "Hair Salon", say: "Pick me!", ext: "png" },
  { img: "nail", name: "Priya", niche: "Nail Salon", say: "Pick me!", ext: "png" },
  { img: "therapist", name: "Dr. Joan", niche: "Counseling", say: "Pick me!", ext: "png" },
  { img: "landscaper", name: "Diego", niche: "Landscaping", say: "Pick me!", ext: "png" },
  { img: "realtor", name: "Ava", niche: "Realtor", say: "Pick me!", ext: "svg" },
  { img: "02-realtor-female-glam", name: "Bianca", niche: "Realtor", say: "Choose me!", ext: "png" },
  { img: "03-realtor-male", name: "Marcus", niche: "Realtor", say: "I'll sell it!", ext: "png" },
  { img: "dentist", name: "Dr. Bright", niche: "Dental", say: "Pick me!", ext: "svg" },
  { img: "12-dentist-female", name: "Dr. Dana", niche: "Dental", say: "Pick me!", ext: "png" },
  { img: "10-doctor-male", name: "Dr. Cole", niche: "Medical", say: "Pick me!", ext: "png" },
  { img: "13-doctor-female", name: "Dr. Maya", niche: "Medical", say: "I'm in!", ext: "png" },
  { img: "17-nurse-female-v2", name: "Nina", niche: "Nursing", say: "Pick me!", ext: "png" },
  { img: "medspa", name: "Skye", niche: "Med-spa", say: "Choose me!", ext: "svg" },
  { img: "05-fitness-coach-male", name: "Coach Rex", niche: "Fitness", say: "Pick me!", ext: "png" },
  { img: "14-fitness-coach-female", name: "Coach Tara", niche: "Fitness", say: "Let's go!", ext: "png" },
  { img: "gym", name: "Brooke", niche: "Gym", say: "Pick me!", ext: "svg" },
  { img: "plumber", name: "Max", niche: "Home Services", say: "Pick me!", ext: "svg" },
  { img: "08-electrician-male", name: "Sparky", niche: "Electrician", say: "Pick me!", ext: "png" },
  { img: "19-mechanic-male", name: "Gus", niche: "Auto Repair", say: "Pick me!", ext: "png" },
  { img: "09-contractor-male-cap-vest", name: "Bo", niche: "Contractor", say: "Pick me!", ext: "png" },
  { img: "11-general-contractor-male", name: "Hank", niche: "General Contractor", say: "I'll build it!", ext: "png" },
  { img: "attorney", name: "Vance", niche: "Law Firm", say: "I'm your guy!", ext: "svg" },
];

const STATS = [
  { n: "24/7", l: "Always answering" },
  { n: "<2s", l: "Average reply time" },
  { n: "100%", l: "Of visitors greeted" },
  { n: "0", l: "Leads missed after hours" },
];

const CHAT_CONS = ["Sits silent until someone clicks it", "Looks like every other website", "Feels like tech support", "Easy to scroll past and ignore"];
const MASCOT_PROS = ["Greets and talks to every visitor", "100% your brand and personality", "Feels like a real person", "Impossible to miss — and asks for the booking"];

const TESTIMONIALS = [
  { q: "It booked three jobs the first weekend — while we were closed. Paid for itself before Monday.", a: "Marcus T.", b: "Roofing company", r: "+3 jobs, weekend one" },
  { q: "Like having a receptionist who never clocks out or calls in sick. Every lead gets answered in seconds.", a: "Dana R.", b: "Real estate", r: "~40% more inquiries replied" },
  { q: "Zero effort on our end. They built it, host it, and keep it sharp. We just take the booked calls.", a: "Priya S.", b: "Med-spa", r: "Set up in under a week" },
];
const PROOF_BAND = [
  { n: "24/7", l: "Answers every visitor, day or night" },
  { n: "< 5 sec", l: "Average reply speed" },
  { n: "5★", l: "Owners rate the hands-off setup" },
];

const FAQS = [
  { q: "How much does it cost?", a: "Plans start at $99/mo, flat — no per-message credits or surprise overage bills. A one-time $500 setup covers the build (waived when you prepay 3 years). We host it, monitor it, and keep it sharp. Cancel anytime." },
  { q: "How long until it's live on my site?", a: "About a week. We design the mascot, train it on your business, and hand you one line of code to drop in — or we add it for you." },
  { q: "Do I have to do anything?", a: "No. It's fully done-for-you. We build it, host it, monitor it, and tune it every month. You just collect the leads." },
  { q: "Can it use my own mascot or logo?", a: "Yes — bring your own character, or we design one that fits your brand. Either way it's uniquely yours." },
  { q: "What if it answers something wrong?", a: "It's trained only on your business, so answers stay accurate. We monitor conversations and tune it monthly, and it always offers a human handoff when needed." },
  { q: "Where do the leads go?", a: "Straight to you the moment they come in — email, text, or your CRM — and booked right onto your calendar." },
];

export default async function Home() {
  const bookingUrl = await getSetting("ghl_calendar_url", "https://api.leadconnectorhq.com/widget/booking/bYPWHLo2QmfN4WVHqVr1");
  return (
    <main className="min-h-screen bg-paper text-ink">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                name: "MascotChatbot",
                url: "https://mascotchatbot.com",
                logo: "https://mascotchatbot.com/icon.svg",
                description: "Custom animated AI mascots that greet website visitors, answer their questions, and book jobs 24/7.",
              },
              { "@type": "WebSite", name: "MascotChatbot", url: "https://mascotchatbot.com" },
              {
                "@type": "FAQPage",
                mainEntity: FAQS.map((f) => ({
                  "@type": "Question",
                  name: f.q,
                  acceptedAnswer: { "@type": "Answer", text: f.a },
                })),
              },
            ],
          }),
        }}
      />
      <style>{`
@keyframes heroFadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
.fade-up{animation:heroFadeUp .75s cubic-bezier(.2,.7,.2,1) both}
@keyframes heroFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
.hero-float{animation:heroFloat 7s ease-in-out infinite}
@media (prefers-reduced-motion: reduce){.fade-up,.hero-float{animation:none}}
`}</style>
      {/* NAV */}
      <header className="sticky top-0 z-50 border-b border-ink/10 bg-paper/70 backdrop-blur-xl">
        <div className="relative mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
          <a href="#top" className="group flex items-center gap-2.5 text-2xl font-bold tracking-tightest">
            <svg width="48" height="36" viewBox="100 52 182 138" aria-hidden="true" className="transition-transform duration-300 group-hover:scale-105">
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
            <span>Mascot<span className="text-smoke">Chatbot</span></span>
          </a>
          <div className="flex items-center gap-3 md:gap-6">
            <nav className="hidden gap-7 text-sm font-medium text-smoke lg:flex">
              <a href="#how" className="group relative py-1 transition-colors hover:text-ink">How it works<span className="absolute -bottom-0.5 left-0 h-[2px] w-full origin-left scale-x-0 rounded-full bg-ink transition-transform duration-300 ease-out group-hover:scale-x-100" /></a>
              <a href="#demos" className="group relative py-1 transition-colors hover:text-ink">Demos<span className="absolute -bottom-0.5 left-0 h-[2px] w-full origin-left scale-x-0 rounded-full bg-ink transition-transform duration-300 ease-out group-hover:scale-x-100" /></a>
              <a href="#pricing" className="group relative py-1 transition-colors hover:text-ink">Pricing<span className="absolute -bottom-0.5 left-0 h-[2px] w-full origin-left scale-x-0 rounded-full bg-ink transition-transform duration-300 ease-out group-hover:scale-x-100" /></a>
              <a href="#faq" className="group relative py-1 transition-colors hover:text-ink">FAQ<span className="absolute -bottom-0.5 left-0 h-[2px] w-full origin-left scale-x-0 rounded-full bg-ink transition-transform duration-300 ease-out group-hover:scale-x-100" /></a>
            </nav>
            <a href="#pricing" className="group hidden items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper shadow-[0_4px_14px_rgba(10,10,10,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(10,10,10,0.32)] md:inline-flex">
              Get your mascot<span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </a>
            <MobileNav />
            <NavActions />
          </div>
        </div>
      </header>

      {/* HERO */}
      <section id="top" className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(#0A0A0A 1.2px, transparent 1.2px)", backgroundSize: "22px 22px" }} />
        <div className="pointer-events-none absolute -top-32 left-1/2 h-[460px] w-[760px] -translate-x-1/2 rounded-full opacity-70 blur-3xl" style={{ background: "radial-gradient(closest-side, rgba(227,52,43,0.16), rgba(227,52,43,0) 70%)" }} />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-16 md:grid-cols-[1.05fr_0.95fr] md:pt-20">
          <div>
            <p className="fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-ink/15 bg-paper/70 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest shadow-sm backdrop-blur" style={{ animationDelay: "0ms" }}>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#e3342b] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#e3342b]" />
              </span>
              Animated AI mascots for websites
            </p>
            <style dangerouslySetInnerHTML={{ __html: TALK_CSS }} />
            <h1 className="fade-up text-[15vw] font-bold leading-[0.84] tracking-tightest md:text-[7.5rem]" style={{ animationDelay: "80ms" }}>
              Your brand,<br />
              <span className="mc-talk">talking.</span><span className="mc-eq" aria-hidden="true"><i style={{ animationDelay: "0s" }} /><i style={{ animationDelay: ".15s" }} /><i style={{ animationDelay: ".3s" }} /><i style={{ animationDelay: ".2s" }} /></span>
            </h1>
            <p className="fade-up mt-8 max-w-md text-lg leading-relaxed text-smoke" style={{ animationDelay: "160ms" }}>
              We build a custom animated mascot that lives on your site, talks to visitors, answers questions, and books the job — <b className="text-ink">24/7, done for you, hosted by us.</b>
            </p>
            <p className="fade-up mt-4 max-w-md text-base font-semibold leading-relaxed text-ink" style={{ animationDelay: "200ms" }}>
              Your 24/7 digital salesman — setting appointments, answering questions, and assisting your clients.
            </p>
            <div className="fade-up mt-9 flex flex-wrap gap-3" style={{ animationDelay: "240ms" }}>
              <a href="/account" className="group inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 font-semibold text-paper shadow-[0_8px_22px_rgba(10,10,10,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(10,10,10,0.35)]">
                Start free <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </a>
              <OpenMascot className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-paper/60 px-7 py-3.5 font-semibold backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:bg-ink hover:text-paper">
                ▶ See it talk
              </OpenMascot>
              <a href="#book" className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-paper/60 px-7 py-3.5 font-semibold backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:bg-ink hover:text-paper">
                Book a call
              </a>
            </div>
            <div className="fade-up mt-8 flex flex-wrap items-center gap-x-6 gap-y-3" style={{ animationDelay: "320ms" }}>
              <span className="flex items-center gap-2 text-sm font-medium text-smoke"><span className="tracking-tight text-[#e3342b]">★★★★★</span> Loved by local service businesses</span>
              <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-smoke">
                {["No code", "Done-for-you", "Live in ~a week", "Cancel anytime"].map((t) => (
                  <li key={t} className="flex items-center gap-1.5"><span className="text-ink">✓</span>{t}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="fade-up flex justify-center md:justify-end" style={{ animationDelay: "200ms" }}>
            <HeroBot />
          </div>
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
      <section id="how" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-24">
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

      {/* WHY A MASCOT */}
      <section id="why" className="scroll-mt-24 border-t-2 border-ink bg-paper">
        <div className="mx-auto max-w-7xl px-5 py-24">
          <h2 className="mb-3 max-w-3xl text-4xl font-bold tracking-tightest md:text-6xl">
            A mascot converts. A chat box doesn&apos;t.
          </h2>
          <p className="mb-14 max-w-2xl text-lg leading-relaxed text-smoke">
            Most visitors never click the little chat bubble in the corner — it blends in and feels like tech support. A mascot greets them, talks, and asks for the booking. Engaged visitors are the ones who convert, so more of your traffic turns into actual leads and booked jobs.
          </p>

          <div className="grid gap-px overflow-hidden rounded-3xl border-2 border-ink bg-ink md:grid-cols-2">
            {/* Plain chat */}
            <div className="bg-paper p-8 md:p-10">
              <div className="mb-6 text-xs font-bold uppercase tracking-widest text-smoke">A plain chat window</div>
              <ul className="space-y-4">
                {CHAT_CONS.map((c) => (
                  <li key={c} className="flex items-start gap-3 text-smoke">
                    <svg width="20" height="20" viewBox="0 0 20 20" className="mt-0.5 shrink-0" aria-hidden="true">
                      <circle cx="10" cy="10" r="9" fill="none" stroke="#9a9a9a" strokeWidth="1.5" />
                      <path d="M7 7l6 6M13 7l-6 6" stroke="#9a9a9a" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
            {/* Mascot */}
            <div className="bg-ink p-8 text-paper md:p-10">
              <div className="mb-6 text-xs font-bold uppercase tracking-widest text-paper/60">Your talking mascot</div>
              <ul className="space-y-4">
                {MASCOT_PROS.map((c) => (
                  <li key={c} className="flex items-start gap-3">
                    <svg width="20" height="20" viewBox="0 0 20 20" className="mt-0.5 shrink-0" aria-hidden="true">
                      <circle cx="10" cy="10" r="10" fill="#ffffff" />
                      <path d="M5.5 10.5l2.8 2.8 6-6.4" fill="none" stroke="#0A0A0A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* DEMOS / GALLERY */}
      <section id="demos" className="scroll-mt-24 border-t-2 border-ink bg-paper">
        <div className="mx-auto max-w-7xl px-5 py-24">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-4xl font-bold tracking-tightest md:text-6xl">Meet the family.</h2>
            <p className="max-w-sm text-smoke"><b className="text-ink">Robo is live right now</b> — click him in the bottom-right corner (turn your sound on), or tap his card. Every mascot below is custom to a brand, voice, and business.</p>
          </div>

          {/* Robo — live demo */}
          <OpenMascot className="group mb-10 flex w-full items-center gap-6 rounded-3xl border-2 border-ink bg-ink p-6 text-left text-paper transition hover:opacity-90 md:p-8">
            <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-paper">
              <svg width="74" height="56" viewBox="100 52 182 138" aria-hidden="true">
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
            <span className="flex-1">
              <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-smoke">
                MascotChatbot <span className="rounded-full bg-[#e3342b] px-2 py-0.5 text-[10px] text-paper">LIVE</span>
              </span>
              <span className="mt-1 block text-3xl font-bold tracking-tight">Robo</span>
              <span className="mt-1 block text-smoke">Our own talking mascot — click to chat with him live.</span>
            </span>
            <span className="hidden shrink-0 text-lg font-semibold md:block">talk to Robo →</span>
          </OpenMascot>

          {/* Full roster */}
          <div className="grid grid-cols-2 gap-px border-2 border-ink bg-ink sm:grid-cols-3 lg:grid-cols-6">
            {CHARACTERS.map((c) => (
              <div key={c.img} className="group relative flex aspect-[3/4] flex-col overflow-hidden bg-paper p-3 text-left">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-smoke">{c.niche}</span>
                <span className="pointer-events-none absolute left-1/2 top-1 z-20 -translate-x-1/2 translate-y-1 opacity-0 transition-all duration-200 ease-out group-hover:-translate-y-1 group-hover:opacity-100">
                  <span className="relative block whitespace-nowrap rounded-2xl border-2 border-ink bg-paper px-3 py-1.5 text-xs font-extrabold text-ink shadow-[3px_3px_0_0_#e3342b]">
                    {c.say}
                    <span className="absolute -bottom-1.5 left-4 h-2 w-2 rounded-full border-2 border-ink bg-paper" />
                    <span className="absolute -bottom-[11px] left-2 h-1.5 w-1.5 rounded-full border-2 border-ink bg-paper" />
                  </span>
                </span>
                <span className="flex flex-1 items-center justify-center overflow-hidden py-1">
                  <img
                    src={`/mascots/${c.img}.${c.ext || "jpg"}`}
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

      {/* STATS */}
      <section className="border-t-2 border-ink bg-ink text-paper">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.l} className="px-5 py-12 text-center">
              <div className="text-5xl font-bold tracking-tightest md:text-6xl">{s.n}</div>
              <div className="mt-2 text-sm text-smoke">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <Pricing />

      {/* SOCIAL PROOF */}
      <section className="border-t-2 border-ink bg-paper">
        <div className="mx-auto max-w-7xl px-5 py-24">
          <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <h2 className="max-w-2xl text-4xl font-bold tracking-tightest md:text-6xl">
              Built to win you business.
            </h2>
            <div className="flex items-center gap-2 rounded-full border border-ink/15 bg-paper px-4 py-2 text-sm">
              <span className="text-lg leading-none" style={{ color: "#e3342b" }} aria-hidden="true">★★★★★</span>
              <span className="font-semibold">Loved by local business owners</span>
            </div>
          </div>

          <div className="mb-10 grid grid-cols-1 gap-px overflow-hidden rounded-3xl border border-ink/15 bg-ink/10 sm:grid-cols-3">
            {PROOF_BAND.map((p) => (
              <div key={p.n} className="bg-paper px-6 py-8 text-center">
                <div className="text-4xl font-bold tracking-tightest md:text-5xl">{p.n}</div>
                <div className="mt-2 text-sm text-smoke">{p.l}</div>
              </div>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure key={t.q} className="flex flex-col rounded-3xl border border-ink/15 bg-paper p-8 shadow-sm">
                <div className="mb-3 text-lg leading-none" style={{ color: "#e3342b" }} aria-hidden="true">★★★★★</div>
                <blockquote className="flex-1 text-lg leading-relaxed">{t.q}</blockquote>
                <span className="mt-5 inline-flex w-fit rounded-full bg-ink px-3 py-1 text-xs font-semibold text-paper">{t.r}</span>
                <figcaption className="mt-5 border-t border-ink/10 pt-4 text-sm">
                  <span className="font-bold">{t.a}</span>
                  <span className="text-smoke"> · {t.b}</span>
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-8 text-xs text-smoke">Illustrative results from early customers. Your mileage will vary by traffic and offer.</p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-24 border-t-2 border-ink bg-paper">
        <div className="mx-auto max-w-3xl px-5 py-24">
          <h2 className="mb-14 text-4xl font-bold tracking-tightest md:text-6xl">Questions, answered.</h2>
          <div className="divide-y divide-ink/10 border-y border-ink/10">
            {FAQS.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-lg font-semibold marker:content-none">
                  {f.q}
                  <span className="shrink-0 text-2xl font-normal text-smoke transition-transform duration-200 group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 max-w-2xl leading-relaxed text-smoke">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* BOOK */}
      <section id="book" className="scroll-mt-24 border-t-2 border-ink bg-paper">
        <div className="mx-auto max-w-3xl px-5 py-24">
          <h2 className="text-4xl font-bold tracking-tightest md:text-5xl">Book an appointment</h2>
          <p className="mt-3 max-w-xl text-lg text-smoke">Grab a time that works for you and we&apos;ll take it from there. ⚡</p>
          {bookingUrl ? (
            <iframe
              src={bookingUrl}
              title="Book an appointment"
              className="mt-8 w-full rounded-2xl border-2 border-ink bg-white"
              style={{ minHeight: 760 }}
            />
          ) : (
            <div className="mt-8 rounded-2xl border-2 border-ink bg-white p-8 text-center">
              <p className="text-lg font-semibold text-ink">Online booking is being set up.</p>
              <p className="mt-2 text-smoke">In the meantime, drop your details just below and we&apos;ll reach out to schedule you right away.</p>
              <a href="#cta" className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-ink px-6 py-3 font-semibold text-paper shadow-[0_8px_22px_rgba(10,10,10,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(10,10,10,0.35)]">Get in touch →</a>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="scroll-mt-24 bg-ink text-paper">
        <div className="mx-auto max-w-7xl px-5 py-28 text-center">
          <h2 className="mx-auto max-w-4xl text-5xl font-bold leading-[0.9] tracking-tightest md:text-8xl">
            Put a mascot on your site.
          </h2>
          <p className="mx-auto mt-7 max-w-xl text-lg text-smoke">
            Tell us your business. We&apos;ll build a talking demo of your own mascot — free — before you pay a cent.
          </p>
          <LeadForm />
          <p className="mt-6 text-sm text-smoke">Prefer to talk? <a href="#book" className="font-semibold text-paper underline underline-offset-4 hover:opacity-80">Book a call →</a></p>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
