import SiteHeader from "@/components/SiteHeader";
import type { Metadata } from "next";
import NavActions from "@/components/NavActions";

export const metadata: Metadata = {
  title: "Affiliate program — earn 20% cash per referral | MascotChatbot",
  description:
    "Refer local businesses to MascotChatbot and earn 20% cash on every paying customer. Open to customers, agencies, and partners. Get your link in minutes.",
  alternates: { canonical: "/affiliate" },
  openGraph: { title: "MascotChatbot Affiliate Program — earn 20% cash", description: "Earn 20% cash on every paying customer you refer.", url: "https://mascotchatbot.com/affiliate", images: ["/og.png"] },
};

const STEPS = [
  { n: "01", t: "Grab your link", d: "Create a free account and get a unique referral link from your dashboard. Customers and outside partners both qualify." },
  { n: "02", t: "Share it", d: "Send it to local business owners, post it, or add it to your agency's stack. We track every signup that comes from your link." },
  { n: "03", t: "Get paid", d: "When someone you referred becomes a paying customer, you earn 20% of their first payment — in cash, paid out monthly." },
];

export default function Affiliate() {
  const ld = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "MascotChatbot Affiliate Program",
    description: "Earn 20% cash on every paying customer you refer to MascotChatbot.",
    url: "https://mascotchatbot.com/affiliate",
  };
  return (
    <main className="min-h-screen bg-paper text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <SiteHeader />

      <section className="relative overflow-hidden border-b-2 border-ink">
        <div className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full opacity-70 blur-3xl" style={{ background: "radial-gradient(closest-side, rgba(43,196,230,0.18), rgba(43,196,230,0) 70%)" }} />
        <div className="relative mx-auto max-w-3xl px-5 py-20 text-center">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-ink/15 bg-paper/70 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest shadow-sm">Affiliate &amp; partner program</p>
          <h1 className="text-[12vw] font-bold leading-[0.9] tracking-tightest md:text-7xl">Earn 20% cash<br />on every referral.</h1>
          <p className="mx-auto mt-7 max-w-xl text-lg leading-relaxed text-smoke">
            Send local businesses our way. When they become paying customers, you pocket 20% of their first payment — in cash. Open to customers, agencies, consultants, and creators.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <a href="/account" className="rounded-full bg-ink px-7 py-3.5 font-semibold text-paper shadow-[0_8px_22px_rgba(10,10,10,0.28)] transition-all duration-300 hover:-translate-y-0.5">Get my referral link →</a>
            <a href="/#demos" className="rounded-full border-2 border-ink bg-paper/60 px-7 py-3.5 font-semibold backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:bg-ink hover:text-paper">See the product</a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20">
        <h2 className="mb-12 text-3xl font-bold tracking-tightest md:text-5xl">How it works.</h2>
        <div className="grid gap-px border-2 border-ink bg-ink md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="bg-paper p-8">
              <div className="text-sm font-bold text-smoke">{s.n}</div>
              <h3 className="mt-2 text-xl font-bold tracking-tight">{s.t}</h3>
              <p className="mt-2 leading-relaxed text-smoke">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t-2 border-ink bg-ink text-paper">
        <div className="mx-auto max-w-3xl px-5 py-20 text-center">
          <h2 className="text-3xl font-bold tracking-tightest md:text-5xl">Start earning today.</h2>
          <p className="mx-auto mt-4 max-w-xl text-smoke">It takes two minutes to grab your link. There&apos;s no cost and no cap on what you can earn.</p>
          <a href="/account" className="mt-8 inline-block rounded-full bg-paper px-7 py-3.5 font-semibold text-ink transition-all duration-300 hover:-translate-y-0.5">Get my referral link →</a>
        </div>
      </section>

      <footer className="border-t-2 border-paper bg-ink text-paper">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-smoke sm:flex-row">
          <a href="/" className="text-2xl font-bold tracking-tightest">Mascot<span className="text-smoke">Chatbot</span></a>
          <span>© {new Date().getFullYear()} MascotChatbot. All rights reserved.</span>
          <a href="/" className="hover:text-paper">← Back to home</a>
        </div>
      </footer>
    </main>
  );
}
