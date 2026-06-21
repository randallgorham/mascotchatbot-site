import OpenMascot from "@/components/OpenMascot";

// Five distinct mascots that orbit clockwise so visitors see the range of styles.
const RING = [
  "01-realtor-female-classic",
  "05-fitness-coach-male",
  "08-electrician-male",
  "15-medspa-female",
  "20-attorney-male",
];

export default function MascotRing() {
  return (
    <div className="mcb-wrap relative mx-auto">
      <style>{CSS}</style>

      {/* soft glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e3342b]/10 blur-3xl" />

      {/* rotating ring */}
      <div className="mcb-ring absolute inset-0">
        {RING.map((img, i) => {
          const a = i * 72;
          return (
            <div key={img} className="absolute left-1/2 top-1/2" style={{ transform: `rotate(${a}deg) translateY(calc(-1 * var(--r)))` }}>
              <div style={{ transform: `translate(-50%, -50%) rotate(${-a}deg)` }}>
                <div className="mcb-face">
                  <img src={`/mascots/${img}.jpg`} alt="Mascot style option" loading="lazy" className="mcb-img object-contain mix-blend-multiply" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* static center — click to talk to the live demo */}
      <OpenMascot className="absolute left-1/2 top-1/2 z-10 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-2 border-ink bg-ink text-center text-paper shadow-[5px_5px_0_0_#e3342b] transition hover:scale-105">
        <svg width="38" height="38" viewBox="0 0 200 200" aria-hidden="true">
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
.mcb-wrap{ width:340px; height:340px; --r:118px; }
.mcb-img{ width:150px; height:150px; }
@media (min-width:768px){
  .mcb-wrap{ width:480px; height:480px; --r:170px; }
  .mcb-img{ width:210px; height:210px; }
}
.mcb-ring{ animation: mcbSpin 34s linear infinite; }
.mcb-face{ animation: mcbSpinR 34s linear infinite; }
@keyframes mcbSpin{ from{ transform: rotate(0deg);} to{ transform: rotate(360deg);} }
@keyframes mcbSpinR{ from{ transform: rotate(0deg);} to{ transform: rotate(-360deg);} }
@media (prefers-reduced-motion: reduce){ .mcb-ring, .mcb-face{ animation: none; } }
`;
