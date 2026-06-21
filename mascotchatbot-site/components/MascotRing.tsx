import OpenMascot from "@/components/OpenMascot";

// Five distinct mascots that orbit clockwise so visitors see the range of styles.
const RING = [
  "01-realtor-female-classic",
  "05-fitness-coach-male",
  "08-electrician-male",
  "15-medspa-female",
  "20-attorney-male",
];

const R = 122; // orbit radius (px)

export default function MascotRing() {
  return (
    <div className="relative mx-auto h-[330px] w-[330px] md:h-[400px] md:w-[400px]">
      <style>{CSS}</style>

      {/* soft glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e3342b]/10 blur-3xl" />

      {/* rotating ring */}
      <div className="mcb-ring absolute inset-0">
        {RING.map((img, i) => {
          const a = i * 72;
          return (
            <div key={img} className="absolute left-1/2 top-1/2" style={{ transform: `rotate(${a}deg) translateY(-${R}px)` }}>
              <div style={{ transform: `translate(-50%, -50%) rotate(${-a}deg)` }}>
                <div className="mcb-face">
                  <span className="flex h-[92px] w-[92px] items-center justify-center overflow-hidden rounded-full border-2 border-ink bg-paper shadow-[4px_4px_0_0_#0A0A0A] md:h-[112px] md:w-[112px]">
                    <img src={`/mascots/${img}.jpg`} alt="Mascot style option" loading="lazy" className="h-full w-full scale-110 object-contain mix-blend-multiply" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* static center — click to talk to the live demo */}
      <OpenMascot className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-2 border-ink bg-ink text-center text-paper transition hover:scale-105 md:h-28 md:w-28">
        <svg width="40" height="40" viewBox="0 0 200 200" aria-hidden="true">
          <line x1="100" y1="22" x2="100" y2="6" stroke="#fff" strokeWidth="9" strokeLinecap="round" />
          <circle cx="100" cy="5" r="9" fill="#fff" />
          <rect x="20" y="22" width="160" height="126" rx="36" fill="#fff" />
          <circle cx="74" cy="76" r="13" fill="#0A0A0A" />
          <circle cx="128" cy="76" r="13" fill="#0A0A0A" />
          <path d="M70 104 q31 26 62 0" stroke="#0A0A0A" strokeWidth="11" fill="none" strokeLinecap="round" />
        </svg>
        <span className="mt-1 text-[10px] font-bold uppercase tracking-widest">Talk to me</span>
      </OpenMascot>
    </div>
  );
}

const CSS = `
.mcb-ring{ animation: mcbSpin 30s linear infinite; }
.mcb-face{ animation: mcbSpinR 30s linear infinite; }
@keyframes mcbSpin{ from{ transform: rotate(0deg);} to{ transform: rotate(360deg);} }
@keyframes mcbSpinR{ from{ transform: rotate(0deg);} to{ transform: rotate(-360deg);} }
@media (prefers-reduced-motion: reduce){ .mcb-ring, .mcb-face{ animation: none; } }
`;
