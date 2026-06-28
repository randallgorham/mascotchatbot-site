import NavActions from "@/components/NavActions";
import Pricing from "@/components/Pricing";
import SiteFooter from "@/components/SiteFooter";
import { INDUSTRIES, industryMeta } from "@/lib/industries";

export { INDUSTRIES, industryMeta };

const BOOKING = "https://api.leadconnectorhq.com/widget/booking/bYPWHLo2QmfN4WVHqVr1";

const TALK_CSS = `
@keyframes mcShine{0%{background-position:120% 0}100%{background-position:-120% 0}}
@keyframes mcEq{0%,100%{transform:scaleY(.22)}50%{transform:scaleY(1)}}
.mc-talk{background-image:linear-gradient(90deg,#0a0a0a 0%,#0a0a0a 42%,#2bc4e6 50%,#0a0a0a 58%,#0a0a0a 100%);background-size:250% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;animation:mcShine 2.6s linear infinite}
.mc-eq{display:inline-flex;align-items:flex-end;gap:.045em;height:.5em;margin-left:.16em;vertical-align:baseline}
.mc-eq i{width:.09em;min-width:3px;height:100%;background:#2bc4e6;border-radius:2px;transform-origin:bottom;animation:mcEq .9s ease-in-out infinite}
@media (prefers-reduced-motion:reduce){.mc-talk{animation:none;background:none;-webkit-text-fill-color:currentColor;color:inherit}.mc-eq i{animation:none}}
`;

const Eq = () => (
  <span className="mc-eq" aria-hidden="true"><i style={{ animationDelay: "0s" }} /><i style={{ animationDelay: ".15s" }} /><i style={{ animationDelay: ".3s" }} /><i style={{ animationDelay: ".2s" }} /></span>
);

function Headline({ text }: { text: string }) {
  const idx = text.toLowerCase().lastIndexOf("talking");
  if (idx < 0) return <>{text}</>;
  return (<>{text.slice(0, idx)}<span className="mc-talk">{"talking" + text.slice(idx + 7)}</span><Eq /></>);
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

  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: `AI Mascot Chatbot for ${ind.label}`,
        serviceType: "AI chatbot and lead capture",
        description: ind.sub,
        provider: { "@type": "Organization", name: "MascotChatbot", url: "https://mascotchatbot.com", logo: "https://mascotchatbot.com/icon.svg" },
        areaServed: "United States",
        audience: { "@type": "Audience", audienceType: ind.role },
        url: `https://mascotchatbot.com/industry/${ind.slug}`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://mascotchatbot.com/" },
          { "@type": "ListItem", position: 2, name: ind.label, item: `https://mascotchatbot.com/industry/${ind.slug}` },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen bg-paper text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
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
            <style dangerouslySetInnerHTML={{ __html: TALK_CSS }} />
            <h1 className="text-[12vw] font-bold leading-[0.9] tracking-tightest md:text-[5.5rem]"><Headline text={ind.headline} /></h1>
            <p className="mt-7 max-w-md text-lg leading-relaxed text-smoke">{ind.sub}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#book" className="group inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 font-semibold text-paper shadow-[0_8px_22px_rgba(10,10,10,0.28)] transition-all duration-300 hover:-translate-y-0.5">Book a free demo <span className="transition-transform duration-300 group-hover:translate-x-1">→</span></a>
              <a href="/#demos" className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-paper/60 px-7 py-3.5 font-semibold backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:bg-ink hover:text-paper">See the mascots</a>
            </div>
          </div>
          <div className="flex justify-center md:justify-end">
            <div className="relative w-full max-w-[300px]">
              <div className="pointer-events-none absolute left-1/2 top-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e3342b]/5 blur-3xl" />
              <img src={`/mascots/${ind.img}`} alt={`${ind.name} — mascot for ${ind.role}`} className="relative mx-auto w-full max-w-[240px] mix-blend-multiply drop-shadow-[0_18px_28px_rgba(10,10,10,0.16)]" />
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-hidden border-y-2 border-ink bg-ink py-4 text-paper">
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

      <SiteFooter />
    </main>
  );
}
