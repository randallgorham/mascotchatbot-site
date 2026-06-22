import OpenMascot from "@/components/OpenMascot";

// A single, usable hero mascot — click to talk to the live demo.
export default function HeroMascot() {
  return (
    <div className="relative mx-auto w-full max-w-[440px]">
      <style>{CSS}</style>
      {/* soft brand glow */}
      <div className="pointer-events-none absolute left-1/2 top-[46%] h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e3342b]/10 blur-3xl" />
      <OpenMascot className="hm group relative mx-auto block w-full max-w-[400px] text-left">
        <span className="hm-bubble">Hi! Ask me anything <span aria-hidden>👋</span></span>
        <span className="hm-stage">
          <img src="/mascots/dr-volt-1.png" alt="Mr Amp — the live talking mascot demo" className="hm-img" />
          <span className="hm-shadow" />
        </span>
        <span className="hm-pill"><span className="hm-dot" /> LIVE — TALK TO ME</span>
      </OpenMascot>
    </div>
  );
}

const CSS = `
.hm-stage{ position:relative; display:block; }
.hm-img{ position:relative; z-index:2; display:block; width:100%; margin:0 auto; filter: drop-shadow(0 22px 34px rgba(10,10,10,.18)); animation: hmFloat 6s ease-in-out infinite; }
.hm-shadow{ position:absolute; z-index:1; left:50%; bottom:5%; width:56%; height:24px; transform:translateX(-50%); background:radial-gradient(closest-side, rgba(10,10,10,.22), rgba(10,10,10,0) 75%); filter:blur(2px); animation: hmShadow 6s ease-in-out infinite; }
@keyframes hmFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
@keyframes hmShadow{0%,100%{transform:translateX(-50%) scale(1);opacity:.5}50%{transform:translateX(-50%) scale(.9);opacity:.35}}
.hm{ transition: transform .35s cubic-bezier(.2,.7,.2,1); }
.hm:hover{ transform: translateY(-4px); }

.hm-bubble{ position:absolute; top:3%; right:-4px; z-index:3; background:#fff; color:#0A0A0A; border:2px solid #0A0A0A; border-radius:18px; padding:8px 14px; font-size:14px; font-weight:800; white-space:nowrap; box-shadow:5px 5px 0 0 #e3342b; animation: hmBob 4s ease-in-out infinite; }
.hm-bubble::after{ content:""; position:absolute; right:26px; bottom:-8px; width:10px; height:10px; background:#fff; border-right:2px solid #0A0A0A; border-bottom:2px solid #0A0A0A; transform: rotate(45deg); }
@keyframes hmBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}

.hm-pill{ position:absolute; left:50%; bottom:-8px; z-index:4; transform:translateX(-50%); display:inline-flex; align-items:center; gap:8px; white-space:nowrap; background:#0A0A0A; color:#fff; border-radius:9999px; padding:9px 16px; font-size:11px; font-weight:800; letter-spacing:.12em; box-shadow:0 10px 24px rgba(10,10,10,.3); transition: transform .3s ease, box-shadow .3s ease; }
.hm:hover .hm-pill{ transform: translateX(-50%) translateY(-2px); box-shadow:0 14px 30px rgba(10,10,10,.4); }
.hm-dot{ width:8px; height:8px; border-radius:50%; background:#22c55e; animation: hmPulse 1.8s infinite; }
@keyframes hmPulse{0%{box-shadow:0 0 0 0 rgba(34,197,94,.6)}70%{box-shadow:0 0 0 8px rgba(34,197,94,0)}100%{box-shadow:0 0 0 0 rgba(34,197,94,0)}}

@media (prefers-reduced-motion: reduce){ .hm-img,.hm-shadow,.hm-bubble,.hm-dot{ animation:none } }
`;
