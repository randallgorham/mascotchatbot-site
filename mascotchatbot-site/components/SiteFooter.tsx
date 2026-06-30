import { INDUSTRIES } from "@/lib/industries";

const FooterLogo = () => (
  <a href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-paper">
    <svg width="34" height="26" viewBox="100 52 182 138" aria-hidden="true">
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

/** One footer used on every page so the site stays consistent. */
export default function SiteFooter() {
  const inds = Object.values(INDUSTRIES);
  return (
    <footer className="border-t-2 border-paper bg-ink text-paper">
      <div className="mx-auto max-w-7xl px-5 py-14">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1.7fr]">
          <div>
            <FooterLogo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-smoke">Animated AI mascots that talk to your visitors — answering questions, capturing leads, and booking appointments 24/7.</p>
            <a href="/#pricing" className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-paper px-5 py-2.5 text-sm font-semibold text-ink transition-all duration-300 hover:-translate-y-0.5">Get your mascot <span aria-hidden="true">→</span></a>
            <div className="mt-5 space-y-1.5 text-sm text-paper/80">
              <a href="tel:+18014337000" className="block transition hover:text-paper">Call us: (801) 433-7000</a>
              <a href="mailto:hello@mascotchatbot.com" className="block transition hover:text-paper">hello@mascotchatbot.com</a>
            </div>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-smoke">Product</div>
            <ul className="mt-3 space-y-2 text-sm text-paper/80">
              <li><a href="/#how" className="hover:text-paper">How it works</a></li>
              <li><a href="/#demos" className="hover:text-paper">Demos</a></li>
              <li><a href="/#pricing" className="hover:text-paper">Pricing</a></li>
              <li><a href="/#faq" className="hover:text-paper">FAQ</a></li>
              <li><a href="/account" className="hover:text-paper">Account</a></li>
            </ul>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-smoke">Mascots for every business</div>
            <div className="mt-3 grid grid-cols-2 gap-x-5 gap-y-2 text-sm text-paper/80 sm:grid-cols-3">
              {inds.map((i) => (
                <a key={i.slug} href={`/industry/${i.slug}`} className="hover:text-paper">{i.label}</a>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-paper/15 pt-6 text-sm text-smoke sm:flex-row">
          <span>© {new Date().getFullYear()} MascotChatbot · a THNK company.</span>
          <a href="#top" className="hover:text-paper">Back to top ↑</a>
        </div>
      </div>
    </footer>
  );
}
