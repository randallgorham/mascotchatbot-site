import type { Metadata } from "next";
import NavActions from "@/components/NavActions";

type Section = { h: string; ps: string[] };
type Post = {
  slug: string;
  title: string;
  desc: string;
  date: string; // ISO
  read: string; // e.g. "5 min read"
  intro: string;
  sections: Section[];
  takeaways: string[];
};

const SITE = "https://mascotchatbot.com";

export const POSTS: Record<string, Post> = {
  "do-ai-chatbots-work-for-service-businesses": {
    slug: "do-ai-chatbots-work-for-service-businesses",
    title: "Do AI chatbots actually work for service businesses?",
    desc: "A plain-English look at where AI chatbots help local and service businesses win more booked jobs — and where they fall flat.",
    date: "2026-06-10",
    read: "5 min read",
    intro:
      "Most local business owners have been burned by a clunky chat widget that sat in the corner doing nothing. So the question is fair: do AI chatbots actually move the needle for a plumber, dentist, or med-spa? The short answer is yes — but only when the bot is built to do one job well: turn a website visitor into a booked appointment.",
    sections: [
      {
        h: "The real problem isn't traffic — it's response speed",
        ps: [
          "Most service businesses already get visitors. What they lose is the lead who shows up at 9pm, has a quick question, and bounces because nobody answered. Studies of inbound leads consistently show that responding within the first few minutes dramatically increases the odds of winning the job.",
          "An AI chatbot answers instantly, every time, day or night. That alone recovers leads that used to leak out after hours and on weekends — exactly when an owner can't be at the keyboard.",
        ],
      },
      {
        h: "Where AI chatbots help the most",
        ps: [
          "They shine at the repetitive front-desk work: answering 'do you do X?', quoting ranges, explaining hours and service areas, and — most importantly — guiding the visitor to pick a time on the calendar. For high-intent local searches, that's most of the conversation.",
          "They also qualify. A good bot collects the visitor's name, number, and what they need, so the owner follows up with context instead of a cold callback.",
        ],
      },
      {
        h: "Where they fall flat",
        ps: [
          "Generic bots fail when they try to be everything, hide in a tiny corner bubble, or read like a robot reciting a manual. They also fail when they don't actually ask for the booking — a chatbot that answers questions but never closes is just expensive decoration.",
          "The fix is focus: a friendly, on-brand assistant with one north star on every reply — get the visitor booked.",
        ],
      },
      {
        h: "What 'good' looks like",
        ps: [
          "The best-performing setup greets visitors, sounds like a real person, knows your business facts, and always nudges toward a booking. A branded mascot takes it further by being impossible to ignore — it gives your site a face people actually want to talk to.",
        ],
      },
    ],
    takeaways: [
      "Speed-to-lead is the whole game; instant answers recover after-hours leads.",
      "Bots win when they qualify and book — not just chat.",
      "Focus beats features: one goal per reply, every time.",
    ],
  },
  "capture-after-hours-leads": {
    slug: "capture-after-hours-leads",
    title: "How to capture after-hours leads without hiring a night shift",
    desc: "Most leads arrive when you're closed. Here's how local businesses capture and book them automatically — overnight and on weekends.",
    date: "2026-06-14",
    read: "4 min read",
    intro:
      "A huge share of website visits happen evenings and weekends — right when the phones are off. For a service business, every one of those is a potential job quietly walking to a competitor who answered first. You don't need a night-shift receptionist to fix it. You need something on your site that never sleeps.",
    sections: [
      {
        h: "Why after-hours leads slip away",
        ps: [
          "When someone has a problem — a leak, a toothache, a last-minute event — they search now and contact the first business that responds. If your only options are a contact form and a voicemail, you've asked an urgent customer to wait until morning. Many won't.",
          "A form that emails you isn't capture; it's a delay. By the time you reply, they've often booked elsewhere.",
        ],
      },
      {
        h: "The fix: an always-on assistant that books",
        ps: [
          "An AI assistant on your site can greet the visitor, answer the urgent question, and put them straight onto your calendar — at 11pm, on a Sunday, while you sleep. The next morning you wake up to booked appointments instead of missed chances.",
          "Pair it with instant notifications so a hot lead pings your phone the moment they leave their details.",
        ],
      },
      {
        h: "Keep the lead warm automatically",
        ps: [
          "The moment a visitor shares their email, a good system fires off a friendly auto-reply confirming a human will follow up. That single email reassures the customer and keeps them from shopping around — no effort from you.",
        ],
      },
    ],
    takeaways: [
      "Most visits happen when you're closed; forms and voicemail lose those leads.",
      "An always-on assistant books appointments overnight and on weekends.",
      "Instant alerts + an auto-reply keep hot leads from drifting to competitors.",
    ],
  },
  "mascot-vs-chat-widget": {
    slug: "mascot-vs-chat-widget",
    title: "Mascot vs. plain chat widget: why a face converts better",
    desc: "The little grey chat bubble blends in. A talking mascot stands out, builds trust, and gets more visitors to start a conversation.",
    date: "2026-06-18",
    read: "4 min read",
    intro:
      "Every website has the same chat bubble in the bottom corner. It's so common that visitors have learned to ignore it. A branded, animated mascot does the opposite: it gets noticed, gives your brand personality, and invites people to interact. That difference shows up where it matters — how many visitors actually start a conversation.",
    sections: [
      {
        h: "Banner blindness is real",
        ps: [
          "People scroll right past the generic chat icon because it looks identical on every site they visit. A mascot breaks the pattern. Motion and a friendly face draw the eye and signal that there's a real, helpful presence here — not a support ticket queue.",
        ],
      },
      {
        h: "Personality builds trust",
        ps: [
          "Local businesses win on relationships. A mascot carries your brand's tone — warm, expert, a little fun — into the very first moment of contact. That human feel lowers the barrier to asking a question, which is the first step toward a booking.",
          "It also makes you memorable. Visitors remember the business with the talking character far longer than the one with a grey bubble.",
        ],
      },
      {
        h: "Same engine, better front door",
        ps: [
          "Under the hood, a mascot runs the same smart booking-focused AI as any chatbot. The difference is the front door: one that visitors actually want to open. You get the conversions of a great assistant plus the brand lift of a memorable character.",
        ],
      },
    ],
    takeaways: [
      "Generic chat bubbles get ignored; a mascot gets noticed.",
      "Personality lowers the barrier to that first question.",
      "Same booking-focused AI, a far more inviting front door.",
    ],
  },
};

export const POST_LIST: Post[] = Object.values(POSTS).sort((a, b) => (a.date < b.date ? 1 : -1));

function fmtDate(iso: string): string {
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return iso;
  }
}

export function blogIndexMeta(): Metadata {
  const title = "Blog — AI mascots & lead capture for local business | MascotChatbot";
  const desc = "Practical guides on AI chatbots, after-hours lead capture, and turning website visitors into booked appointments for service businesses.";
  return {
    title,
    description: desc,
    alternates: { canonical: "/blog" },
    openGraph: { title, description: desc, url: `${SITE}/blog`, images: ["/og.png"] },
  };
}

export function blogMeta(slug: string): Metadata {
  const p = POSTS[slug];
  if (!p) return {};
  const title = `${p.title} | MascotChatbot`;
  return {
    title,
    description: p.desc,
    alternates: { canonical: `/blog/${p.slug}` },
    openGraph: { type: "article", title, description: p.desc, url: `${SITE}/blog/${p.slug}`, images: ["/og.png"] },
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

const Header = () => (
  <header className="sticky top-0 z-50 border-b border-ink/10 bg-paper/70 backdrop-blur-xl">
    <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
      <Logo />
      <div className="flex items-center gap-3 md:gap-6">
        <nav className="hidden gap-7 text-sm font-medium text-smoke lg:flex">
          <a href="/#how" className="hover:text-ink">How it works</a>
          <a href="/#demos" className="hover:text-ink">Demos</a>
          <a href="/blog" className="hover:text-ink">Blog</a>
          <a href="/#pricing" className="hover:text-ink">Pricing</a>
        </nav>
        <a href="/#book" className="group hidden items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper shadow-[0_4px_14px_rgba(10,10,10,0.25)] transition-all duration-300 hover:-translate-y-0.5 md:inline-flex">
          Get your mascot<span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </a>
        <NavActions />
      </div>
    </div>
  </header>
);

const Foot = () => (
  <footer className="border-t-2 border-paper bg-ink text-paper">
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-smoke sm:flex-row">
      <Logo />
      <span>© {new Date().getFullYear()} MascotChatbot. All rights reserved.</span>
      <a href="/" className="hover:text-paper">← Back to home</a>
    </div>
  </footer>
);

const CTA = () => (
  <section className="border-t-2 border-ink bg-ink py-16 text-paper">
    <div className="mx-auto max-w-3xl px-5 text-center">
      <h2 className="text-3xl font-bold tracking-tightest md:text-4xl">Want a mascot that books jobs for you?</h2>
      <p className="mx-auto mt-3 max-w-xl text-smoke">We&apos;ll build a free talking demo of your own mascot — before you pay a cent.</p>
      <a href="/#book" className="mt-7 inline-flex items-center gap-2 rounded-full bg-paper px-7 py-3.5 font-semibold text-ink transition-all duration-300 hover:-translate-y-0.5">Book a free demo →</a>
    </div>
  </section>
);

export function BlogIndex() {
  const ld = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "MascotChatbot Blog",
    url: `${SITE}/blog`,
    blogPost: POST_LIST.map((p) => ({ "@type": "BlogPosting", headline: p.title, datePublished: p.date, url: `${SITE}/blog/${p.slug}` })),
  };
  return (
    <main className="min-h-screen bg-paper text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <Header />
      <section className="mx-auto max-w-5xl px-5 pb-8 pt-16">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-ink/15 bg-paper/70 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-widest shadow-sm">The MascotChatbot Blog</p>
        <h1 className="text-[12vw] font-bold leading-[0.9] tracking-tightest md:text-7xl">Win more booked jobs.</h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-smoke">Practical guides on AI chatbots, after-hours lead capture, and turning website visitors into customers.</p>
      </section>
      <section className="mx-auto max-w-5xl px-5 pb-24">
        <div className="grid gap-px border-2 border-ink bg-ink md:grid-cols-2">
          {POST_LIST.map((p) => (
            <a key={p.slug} href={`/blog/${p.slug}`} className="group flex flex-col bg-paper p-8 transition-colors hover:bg-paper/60">
              <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-smoke">{fmtDate(p.date)} · {p.read}</div>
              <h2 className="text-2xl font-bold leading-tight tracking-tight group-hover:underline">{p.title}</h2>
              <p className="mt-3 flex-1 leading-relaxed text-smoke">{p.desc}</p>
              <span className="mt-5 text-sm font-semibold">Read article →</span>
            </a>
          ))}
        </div>
      </section>
      <CTA />
      <Foot />
    </main>
  );
}

export function BlogPost({ slug }: { slug: string }) {
  const p = POSTS[slug];
  if (!p) return null;
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        headline: p.title,
        description: p.desc,
        datePublished: p.date,
        dateModified: p.date,
        author: { "@type": "Organization", name: "MascotChatbot" },
        publisher: { "@type": "Organization", name: "MascotChatbot", logo: { "@type": "ImageObject", url: `${SITE}/icon.svg` } },
        mainEntityOfPage: `${SITE}/blog/${p.slug}`,
        url: `${SITE}/blog/${p.slug}`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE}/blog` },
          { "@type": "ListItem", position: 3, name: p.title, item: `${SITE}/blog/${p.slug}` },
        ],
      },
    ],
  };
  return (
    <main className="min-h-screen bg-paper text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <Header />
      <article className="mx-auto max-w-3xl px-5 pb-20 pt-14">
        <a href="/blog" className="text-sm font-semibold text-smoke hover:text-ink">← All articles</a>
        <div className="mt-5 text-xs font-semibold uppercase tracking-widest text-smoke">{fmtDate(p.date)} · {p.read}</div>
        <h1 className="mt-3 text-4xl font-bold leading-[1.05] tracking-tightest md:text-5xl">{p.title}</h1>
        <p className="mt-6 text-xl leading-relaxed text-smoke">{p.intro}</p>

        <div className="mt-10 space-y-10">
          {p.sections.map((s) => (
            <section key={s.h}>
              <h2 className="mb-3 text-2xl font-bold tracking-tight">{s.h}</h2>
              <div className="space-y-4">
                {s.ps.map((para, i) => (
                  <p key={i} className="text-lg leading-relaxed text-ink/80">{para}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 rounded-3xl border-2 border-ink bg-paper p-8">
          <h2 className="mb-4 text-xl font-bold tracking-tight">Key takeaways</h2>
          <ul className="space-y-2.5">
            {p.takeaways.map((t) => (
              <li key={t} className="flex gap-3 leading-relaxed text-ink/80"><span className="mt-1 text-[#e3342b]">●</span><span>{t}</span></li>
            ))}
          </ul>
        </div>

        <div className="mt-12 border-t border-ink/10 pt-8">
          <div className="text-xs font-semibold uppercase tracking-widest text-smoke">Keep reading</div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {POST_LIST.filter((o) => o.slug !== p.slug).map((o) => (
              <a key={o.slug} href={`/blog/${o.slug}`} className="rounded-2xl border border-ink/15 p-5 transition-colors hover:bg-ink hover:text-paper">
                <div className="font-bold leading-tight">{o.title}</div>
              </a>
            ))}
          </div>
        </div>
      </article>
      <CTA />
      <Foot />
    </main>
  );
}
