import type { Metadata } from "next";
import NavActions from "@/components/NavActions";
import Pricing from "@/components/Pricing";

type Ind = {
  slug: string; label: string; role: string; img: string; name: string;
  headline: string; sub: string; pains: { t: string; d: string }[];
};

const BOOKING = "https://api.leadconnectorhq.com/widget/booking/bYPWHLo2QmfN4WVHqVr1";

export const INDUSTRIES: Record<string, Ind> = {
  electricians: {
    slug: "electricians", label: "Electricians", role: "electrical company", img: "dr-volt-1.png", name: "Dr. Volt",
    headline: "Your electrical company, talking.",
    sub: "A friendly mascot that answers wiring questions, calms emergencies, and books service calls — 24/7, even after hours.",
    pains: [
      { t: "Catch after-hours emergencies", d: "Sparking outlet at 9pm? Your mascot triages it and books the call instead of sending them to a competitor." },
      { t: "Answer the same questions", d: "Panel upgrades, EV chargers, pricing ranges — answered instantly so your phone rings less." },
      { t: "Book jobs while you're on a ladder", d: "Every visitor gets greeted and guided onto your calendar without you lifting a finger." },
    ],
  },
  hvac: {
    slug: "hvac", label: "HVAC", role: "HVAC company", img: "hvac.png", name: "Reggie",
    headline: "Your HVAC business, talking.",
    sub: "A mascot that handles no-heat and no-cool calls, explains maintenance plans, and books service the moment a visitor lands.",
    pains: [
      { t: "Never miss a no-heat call", d: "Peak season floods your phone. Your mascot captures and books every after-hours emergency." },
      { t: "Sell maintenance plans", d: "It explains tune-ups and memberships in plain English and nudges visitors to sign up." },
      { t: "Fill the schedule", d: "Turns website traffic into booked installs and service calls around the clock." },
    ],
  },
  plumbers: {
    slug: "plumbers", label: "Plumbers", role: "plumbing company", img: "06-plumber-home-services-male.jpg", name: "Max",
    headline: "Your plumbing business, talking.",
    sub: "A mascot that calms leaks-and-floods panic, gives quick guidance, and books the truck — day or night.",
    pains: [
      { t: "Capture emergency leaks", d: "Burst pipe at midnight? Your mascot books it before they call the next plumber on Google." },
      { t: "Pre-qualify the job", d: "It gathers what's wrong and where, so you roll up prepared." },
      { t: "Stop missed calls", d: "Every visitor is greeted and guided onto your schedule, even when you're under a sink." },
    ],
  },
  dentists: {
    slug: "dentists", label: "Dentists", role: "dental practice", img: "04-dentist-male.jpg", name: "Dr. Bright",
    headline: "Your dental practice, talking.",
    sub: "A warm mascot that answers insurance and new-patient questions and books cleanings while your front desk is busy.",
    pains: [
      { t: "Book new patients 24/7", d: "Most people search for a dentist after hours — your mascot turns them into appointments." },
      { t: "Answer insurance questions", d: "Plans accepted, new-patient specials, what to expect — handled instantly." },
      { t: "Reduce front-desk load", d: "Routine questions get answered automatically so your team focuses on patients." },
    ],
  },
  realtors: {
    slug: "realtors", label: "Realtors", role: "real estate agent", img: "01-realtor-female-classic.jpg", name: "Ava",
    headline: "Your real estate brand, talking.",
    sub: "A mascot that engages buyers and sellers, answers listing questions, and books showings and valuations instantly.",
    pains: [
      { t: "Capture every lead", d: "Buyers browse late at night — your mascot greets them and books the showing." },
      { t: "Qualify buyers and sellers", d: "It gathers budget, timeline, and area, then routes hot leads to you." },
      { t: "Book valuations", d: "Turns 'what's my home worth?' visitors into booked listing appointments." },
    ],
  },
  "med-spas": {
    slug: "med-spas", label: "Med-spas", role: "med-spa", img: "15-medspa-female.jpg", name: "Skye",
    headline: "Your med-spa, talking.",
    sub: "An on-brand mascot that explains treatments, answers pricing, and books consultations around the clock.",
    pains: [
      { t: "Book consultations 24/7", d: "Botox, fillers, facials — your mascot guides interest into booked appointments." },
      { t: "Answer treatment questions", d: "Downtime, pricing ranges, packages — answered instantly and on-brand." },
      { t: "Fill slow days", d: "Promote specials and memberships to every visitor automatically." },
    ],
  },
  "law-firms": {
    slug: "law-firms", label: "Law firms", role: "law firm", img: "20-attorney-male.jpg", name: "Vance",
    headline: "Your law firm, talking.",
    sub: "A professional mascot that screens cases, answers common questions, and books consultations 24/7.",
    pains: [
      { t: "Capture cases after hours", d: "People search for a lawyer in a crisis — your mascot books the consult immediately." },
      { t: "Pre-screen matters", d: "It gathers case type and details so you only spend time on the right clients." },
      { t: "Never miss an inquiry", d: "Every visitor is greeted and guided to schedule, even mid-trial." },
    ],
  },
  gyms: {
    slug: "gyms", label: "Gyms", role: "gym", img: "18-gym-instructor-female-blonde.jpg", name: "Brooke",
    headline: "Your gym, talking.",
    sub: "An energetic mascot that answers membership questions, books tours, and signs up new members 24/7.",
    pains: [
      { t: "Sign up members 24/7", d: "New Year's resolutions don't wait for business hours — your mascot books the tour." },
      { t: "Answer membership questions", d: "Plans, classes, hours, day passes — handled instantly." },
      { t: "Book tours and trials", d: "Turns curious visitors into booked walk-throughs and free trials." },
    ],
  },
  salons: {
    slug: "salons", label: "Salons", role: "salon", img: "hair.png", name: "Gigi",
    headline: "Your salon, talking.",
    sub: "A stylish mascot that answers service and pricing questions and books appointments while you're behind the chair.",
    pains: [
      { t: "Book while you style", d: "You can't answer the phone mid-color — your mascot books the next client for you." },
      { t: "Answer service questions", d: "Pricing, stylists, availability — answered instantly, on-brand." },
      { t: "Fill the chair", d: "Turns every website visit into a booked cut, color, or treatment." },
    ],
  },
  veterinary: {
    slug: "veterinary", label: "Veterinary clinics", role: "veterinary clinic", img: "vet.png", name: "Bella",
    headline: "Your vet clinic, talking.",
    sub: "A caring mascot that calms worried pet parents, answers questions, and books visits 24/7.",
    pains: [
      { t: "Help worried pet parents", d: "After-hours concerns get a calm, helpful answer and a booked appointment." },
      { t: "Answer the basics", d: "Hours, services, new-patient info, what to bring — handled instantly." },
      { t: "Fill the schedule", d: "Turns anxious late-night searches into booked wellness and sick visits." },
    ],
  },
};

export function industryMeta(slug: string): Metadata {
  const ind = INDUSTRIES[slug];
  if (!ind) return { title: "Industry" };
  const title = `AI Mascot Chatbot for ${ind.label} — ${ind.headline}`;
  return {
    title, description: ind.sub,
    alternates: { canonical: `/industry/${ind.slug}` },
    openGraph: { title, description: ind.sub, url: `https://mascotchatbot.com/industry/${ind.slug}`, images: ["/og.png"] },
  };
}

const Logo = () => (
  <a href="/" className="group flex items-center gap-2.5 text-2xl font-bold tracking-tightest">
    <svg width="48" height="36" viewBox="100 52 182 138" aria-hidden="true" className="transition-transform duration-300 group-hover:scale-105">
      <rect x="104" y="104" width="14" height="40" rx="7" fill="#3a434f" /><rect x="262" y="104" width="14" height="40" rx="7" fill="#3a434f" />
      <rect x="115" y="58" width="150" height="116" rx="42" fill="#e4e9ef" stroke="#aab4c0" strokeWidth="3" />
      <ellipse cx="190" cy="118" rx="60" ry="44" fill="#2b333d" />
      <rect x="164" y="98" width="14" height="26" rx="7" fill="#2bc4e6" /><rect x="202" y="98" width="14" height="26" rx="7" fill="#2bc4e6" />
      <path d="M164 130 Q190 160 216 130 Z" fill="#2bc4e6" />
      <path d="M112 146 C 116 186, 150 194, 182 176" fill="none" stroke="#3a434f" strokeWidth="8" strokeLinecap="round" /><ellipse cx="184" cy="176" rx="10" ry="7" fill="#3a434f" />
    </svg>
    <span>Mascot<span className="text-smoke">Chatbot</span></span>
  </a>
);

export default function IndustryLanding({ slug }: { slug: string }) {
  const ind = INDUSTRIES[slug];
  if (!ind) return null;

  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-50 border-b border-ink/10 bg-paper/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
          <Logo />
          <div className="flex items-center gap-3 md:gap-6">
            <nav className="hidden gap-7 text-sm font-medium text-smoke lg:flex">
              <a href="/#how" className="hover:text-ink">How it works</a>
              <a href="/#demos" className="hover:text-ink">Demos</a>
              <a href="/#pricing" className="hover:text-ink">Pricing</a>
            </nav>
            <a href="#book" className="group hidden items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper shadow-[0_4px_14px_rgba(10,10,10,0.25)] transition-all duration-300 hover:-translate-y-0.5 md:inline-flex">
              Get your mascot<span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </a>
            <NavActions />
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(#0A0A0A 1.2px, transparent 1.2px)", backgroundSize: "22px 22px" }} />
        <div className="pointer-events-none absolute -top-32 left-1/2 h-[460px] w-[760px] -translate-x-1/2 rounded-full opacity-70 blur-3xl" style={{ background: "radial-gradient(closest-side, rgba(227,52,43,0.16), rgba(227,52,43,0) 70%)" }} />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-14 md:grid-cols-[1.05fr_0.95fr] md:pt-20">
          <div>
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-ink/15 bg-paper/70 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest shadow-sm backdrop-blur">
              <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#e3342b] opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-[#e3342b]" /></span>
              AI mascots for {ind.label.toLowerCase()}
            </p>
            <h1 className="text-[12vw] font-bold leading-[0.9] tracking-tightest md:text-[5.5rem]">{ind.headline}</h1>
            <p className="mt-7 max-w-md text-lg leading-relaxed text-smoke">{ind.sub}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#book" className="group inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 font-semibold text-paper shadow-[0_8px_22px_rgba(10,10,10,0.28)] transition-all duration-300 hover:-translate-y-0.5">Book a free demo <span className="transition-transform duration-300 group-hover:translate-x-1">→</span></a>
              <a href="/#demos" className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-paper/60 px-7 py-3.5 font-semibold backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:bg-ink hover:text-paper">See the mascots</a>
            </div>
          </div>
          <div className="flex justify-center md:justify-end">
            <div className="relative w-full max-w-[380px]">
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e3342b]/10 blur-3xl" />
              <img src={`/mascots/${ind.img}`} alt={`${ind.name} — mascot for ${ind.role}`} className="relative mx-auto w-full max-w-[340px] drop-shadow-[0_22px_34px_rgba(10,10,10,0.18)]" />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y-2 border-ink bg-ink py-4 text-paper">
        <div className="flex w-max animate-marquee whitespace-nowrap">
          {[0, 1].map((k) => (
            <span key={k} className="mx-6 text-2xl font-bold tracking-tight">Built for {ind.label.toLowerCase()} <span className="mx-2 text-smoke">/</span> 24/7 booking <span className="mx-2 text-smoke">/</span> Done for you <span className="mx-2 text-smoke">/</span></span>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20">
        <h2 className="mb-12 max-w-2xl text-3xl font-bold tracking-tightest md:text-5xl">What it does for your {ind.role}.</h2>
        <div className="grid gap-px border-2 border-ink bg-ink md:grid-cols-3">
          {ind.pains.map((p) => (
            <div key={p.t} className="bg-paper p-8">
              <h3 className="mb-3 text-xl font-bold tracking-tight">{p.t}</h3>
              <p className="leading-relaxed text-smoke">{p.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="scroll-mt-24 border-t-2 border-ink"><Pricing /></section>

      <section id="book" className="scroll-mt-24 border-t-2 border-ink bg-ink py-20 text-paper">
        <div className="mx-auto max-w-3xl px-5 text-center">
          <h2 className="text-3xl font-bold tracking-tightest md:text-5xl">Book a free demo</h2>
          <p className="mx-auto mt-4 max-w-xl text-smoke">We&apos;ll build a talking demo of your own {ind.role} mascot — free, before you pay a cent.</p>
          <div className="mt-8 overflow-hidden rounded-2xl border-2 border-paper bg-white">
            <iframe src={BOOKING} className="h-[680px] w-full" title="Book a demo" />
          </div>
        </div>
      </section>

      <footer className="border-t-2 border-paper bg-ink text-paper">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-smoke sm:flex-row">
          <Logo />
          <span>© {new Date().getFullYear()} MascotChatbot. All rights reserved.</span>
          <a href="/" className="hover:text-paper">← Back to home</a>
        </div>
      </footer>
    </main>
  );
}
