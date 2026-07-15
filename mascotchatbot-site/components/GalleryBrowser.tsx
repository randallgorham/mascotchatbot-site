"use client";

import { useMemo, useState } from "react";

type Mascot = { img: string; niche: string };

const CATEGORIES: { label: string; keywords: string[] }[] = [
  {
    label: "Home & Trades",
    keywords: [
      "plumber", "electrician", "contractor", "roofer", "hvac", "painter", "mason",
      "concrete", "drywall", "welder", "flooring", "fencing", "garage-door", "solar",
      "pool", "insulation", "tile", "glazier", "ironworker", "sheet-metal", "demolition",
      "handyman", "landscaper", "framer", "deck", "epoxy", "foundation", "septic", "snow",
      "gutter", "pressure-wash", "window-clean", "junk", "mover", "sign-installer",
      "countertop", "cabinet", "arborist", "tree", "pest", "locksmith", "appliance",
      "security", "chimney", "fireplace", "awning", "turf", "holiday-lighting",
      "water-treatment", "low-voltage", "ev-charger", "smart-home", "cleaning-maid",
      "carpet", "home-inspector", "house-cleaner", "heavy-equipment",
    ],
  },
  {
    label: "Auto",
    keywords: ["mechanic", "auto-body", "tire", "oil-change", "car-wash", "tow-truck", "detailer"],
  },
  {
    label: "Beauty & Wellness",
    keywords: [
      "medspa", "esthetician", "lash", "brow", "makeup", "spray-tan", "waxing",
      "permanent-makeup", "spa-attendant", "hair", "nail", "barber", "massage", "tattoo",
      "fitness", "gym", "personal-trainer", "yoga", "pilates",
    ],
  },
  {
    label: "Health & Medical",
    keywords: [
      "doctor", "dentist", "nurse", "veterinarian", "optometrist", "orthodontist",
      "dermatolog", "pediatric", "physical-therapist", "dietitian", "pharmacist",
      "audiolog", "podiatr", "chiropractor", "acupuncturist", "home-caregiver", "therapist",
    ],
  },
  {
    label: "Pets",
    keywords: ["dog-groomer", "dog-trainer", "pet-sitter", "pet-boarding", "mobile-groomer", "dog-walker"],
  },
  {
    label: "Food & Drink",
    keywords: ["chef", "barista", "food-truck", "caterer", "bartender", "butcher", "brewer", "baker"],
  },
  {
    label: "Professional",
    keywords: [
      "realtor", "mortgage", "accountant", "attorney", "financial", "bookkeeper", "notary",
      "it-technician", "marketing", "recruiter", "consultant", "web-designer",
      "property-manager", "appraiser", "escrow", "insurance", "interior-designer",
      "home-stager", "copywriter", "social-media", "virtual-assistant", "life-coach", "podcast",
    ],
  },
  {
    label: "Events & Creative",
    keywords: ["photographer", "event-planner", "party-rental", "graphic-designer", "videographer", "-dj"],
  },
  {
    label: "Education",
    keywords: [
      "preschool", "tutor", "driving-instructor", "music-teacher", "dance-instructor",
      "swim-instructor", "martial-arts",
    ],
  },
];

function categoryOf(m: Mascot): string {
  const slug = m.img.toLowerCase();
  for (const c of CATEGORIES) {
    if (c.keywords.some((k) => slug.includes(k))) return c.label;
  }
  return "Other";
}

export default function GalleryBrowser({ mascots }: { mascots: Mascot[] }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState("All");

  const tagged = useMemo(
    () => mascots.map((m) => ({ ...m, cat: categoryOf(m) })),
    [mascots]
  );

  const chips = useMemo(() => {
    const counts: Record<string, number> = {};
    tagged.forEach((m) => (counts[m.cat] = (counts[m.cat] || 0) + 1));
    const ordered = [...CATEGORIES.map((c) => c.label), "Other"].filter((l) => counts[l]);
    return [{ label: "All", count: tagged.length }, ...ordered.map((l) => ({ label: l, count: counts[l] }))];
  }, [tagged]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tagged.filter((m) => {
      const matchCat = active === "All" || m.cat === active;
      const matchQ = !q || m.niche.toLowerCase().includes(q) || m.img.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [tagged, active, query]);

  return (
    <div>
      {/* Search */}
      <div className="mx-auto mt-10 max-w-xl">
        <div className="relative">
          <svg
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-smoke"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search 180+ mascots — plumber, dentist, yoga…"
            className="w-full rounded-full border border-ink/15 bg-white py-3.5 pl-12 pr-4 text-sm text-ink shadow-sm outline-none transition focus:border-ink/40"
            aria-label="Search mascots"
          />
        </div>
      </div>

      {/* Category chips */}
      <div className="mx-auto mt-6 flex max-w-4xl flex-wrap justify-center gap-2">
        {chips.map((c) => (
          <button
            key={c.label}
            onClick={() => setActive(c.label)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
              active === c.label
                ? "border-ink bg-ink text-paper"
                : "border-ink/15 bg-white text-ink hover:border-ink/40"
            }`}
          >
            {c.label} <span className="opacity-60">{c.count}</span>
          </button>
        ))}
      </div>

      {/* Result count */}
      <p className="mt-6 text-center text-sm text-smoke">
        Showing {filtered.length} {filtered.length === 1 ? "mascot" : "mascots"}
        {active !== "All" ? ` in ${active}` : ""}
        {query ? ` matching “${query}”` : ""}
      </p>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {filtered.map((m) => (
            <div
              key={m.img}
              className="group flex flex-col items-center rounded-2xl border border-ink/10 bg-white p-4 transition hover:-translate-y-1 hover:border-ink/30 hover:shadow-xl"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/mascots/${m.img}.png`}
                alt={m.niche + " mascot"}
                loading="lazy"
                className="h-40 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
              />
              <span className="mt-3 text-center text-sm font-medium text-ink">{m.niche}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-16 text-center">
          <p className="text-lg font-semibold text-ink">No mascots match that search.</p>
          <p className="mt-2 text-smoke">
            Don&apos;t see your trade? We&apos;ll design a custom character for your brand.
          </p>
          <button
            onClick={() => { setQuery(""); setActive("All"); }}
            className="mt-5 rounded-full border border-ink/20 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-ink/50"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
