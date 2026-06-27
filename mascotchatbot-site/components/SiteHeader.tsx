import MobileNav from "@/components/MobileNav";
import NavActions from "@/components/NavActions";

/** Shared site logo — robot icon + MascotChatbot wordmark. Links home. */
export const Logo = () => (
  <a href="/" className="group flex items-center gap-2.5 text-2xl font-bold tracking-tightest">
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
);

/** One header used on every page so the site is visually consistent. */
export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-paper/70 backdrop-blur-xl">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
        <Logo />
        <div className="flex items-center gap-3 md:gap-6">
          <nav className="hidden gap-7 text-sm font-medium text-smoke lg:flex">
            <a href="/#how" className="group relative py-1 transition-colors hover:text-ink">How it works<span className="absolute -bottom-0.5 left-0 h-[2px] w-full origin-left scale-x-0 rounded-full bg-ink transition-transform duration-300 ease-out group-hover:scale-x-100" /></a>
            <a href="/#demos" className="group relative py-1 transition-colors hover:text-ink">Demos<span className="absolute -bottom-0.5 left-0 h-[2px] w-full origin-left scale-x-0 rounded-full bg-ink transition-transform duration-300 ease-out group-hover:scale-x-100" /></a>
            <a href="/#pricing" className="group relative py-1 transition-colors hover:text-ink">Pricing<span className="absolute -bottom-0.5 left-0 h-[2px] w-full origin-left scale-x-0 rounded-full bg-ink transition-transform duration-300 ease-out group-hover:scale-x-100" /></a>
            <a href="/#faq" className="group relative py-1 transition-colors hover:text-ink">FAQ<span className="absolute -bottom-0.5 left-0 h-[2px] w-full origin-left scale-x-0 rounded-full bg-ink transition-transform duration-300 ease-out group-hover:scale-x-100" /></a>
          </nav>
          <a href="/#pricing" className="group hidden items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper shadow-[0_4px_14px_rgba(10,10,10,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(10,10,10,0.32)] md:inline-flex">
            Get your mascot<span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </a>
          <MobileNav />
          <NavActions />
        </div>
      </div>
    </header>
  );
}
