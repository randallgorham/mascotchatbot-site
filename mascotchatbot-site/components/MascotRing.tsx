import OpenMascot from "@/components/OpenMascot";

// Five distinct mascots that orbit clockwise so visitors see the range of styles.
// Each says something cute on hover — "window shopping" for a mascot.
const RING = [
  { img: "01-realtor-female-classic", say: "Pick me!" },
  { img: "05-fitness-coach-male", say: "Ooh, pick me!" },
  { img: "08-electrician-male", say: "Pick me!" },
  { img: "15-medspa-female", say: "Choose me!" },
  { img: "20-attorney-male", say: "I'm your guy!" },
];

export default function MascotRing() {
  return (
    <div className="mcb-wrap relative mx-auto">
      <style>{CSS}</style>

      {/* soft glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e3342b]/10 blur-3xl" />

      {/* rotating ring */}
      <div className="mcb-ring absolute inset-0">
        {RING.map((m, i) => {
          const a = i * 72;
          return (
            <div key={m.img} className="absolute left-1/2 top-1/2" style={{ transform: `rotate(${a}deg) translateY(calc(-1 * var(--r)))` }}>
              <div style={{ transform: `translate(-50%, -50%) rotate(${-a}deg)` }}>
                <div className="mcb-face" tabIndex={0}>
                  <span className="mcb-bubble">{m.say}</span>
                  <img src={`/mascots/${m.img}.jpg`} alt="Mascot style option" loading="lazy" className="mcb-img object-contain mix-blend-multiply" />
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
.mcb-img{ width:150px; height:150px; transition: transform .25s ease; }
@media (min-width:768px){
  .mcb-wrap{ width:480px; height:480px; --r:170px; }
  .mcb-img{ width:210px; height:210px; }
}
.mcb-ring{ animation: mcbSpin 34s linear infinite; }
.mcb-face{ position:relative; cursor:pointer; outline:none; animation: mcbSpinR 34s linear infinite; }
@keyframes mcbSpin{ from{ transform: rotate(0deg);} to{ transform: rotate(360deg);} }
@keyframes mcbSpinR{ from{ transform: rotate(0deg);} to{ transform: rotate(-360deg);} }

/* hover/focus: grow the mascot */
.mcb-face:hover .mcb-img, .mcb-face:focus-visible .mcb-img{ transform: scale(1.09); }
.mcb-face:hover, .mcb-face:focus-visible{ z-index:6; }

/* cute thought cloud, floats above the mascot's head */
.mcb-bubble{
  position:absolute; left:50%; bottom:90%; z-index:7;
  transform: translate(-50%,8px) scale(.85);
  background:#fff; color:#0A0A0A; border:2px solid #0A0A0A; border-radius:16px;
  padding:5px 12px; font-size:13px; font-weight:800; white-space:nowrap;
  box-shadow:4px 4px 0 0 #e3342b; opacity:0; pointer-events:none;
  transition: opacity .18s ease, transform .24s cubic-bezier(.34,1.5,.5,1);
}
.mcb-bubble::after{ content:""; position:absolute; left:20px; bottom:-9px; width:9px; height:9px; border-radius:50%; background:#fff; border:2px solid #0A0A0A; }
.mcb-bubble::before{ content:""; position:absolute; left:11px; bottom:-19px; width:6px; height:6px; border-radius:50%; background:#fff; border:2px solid #0A0A0A; }
.mcb-face:hover .mcb-bubble, .mcb-face:focus-visible .mcb-bubble{ opacity:1; transform: translate(-50%,0) scale(1); }

/* freeze the whole carousel while a mascot is hovered/focused so the bubble is readable */
.mcb-ring:has(.mcb-face:hover), .mcb-ring:has(.mcb-face:focus-visible){ animation-play-state: paused; }
.mcb-ring:has(.mcb-face:hover) .mcb-face, .mcb-ring:has(.mcb-face:focus-visible) .mcb-face{ animation-play-state: paused; }

@media (prefers-reduced-motion: reduce){ .mcb-ring, .mcb-face{ animation: none; } }
`;
