"use client";

import { useState } from "react";
import OpenMascot from "@/components/OpenMascot";

// Selectable hero showcase — pick a character, then click to talk to the live demo.
const CHARS = [
  { img: "vet", name: "Bella", role: "Veterinary", say: "Hi! Ask me anything 👋" },
  { img: "hvac", name: "Reggie", role: "HVAC", say: "Need a hand? Ask away!" },
  { img: "chef", name: "Theo", role: "Restaurant", say: "Hungry for details? Ask me!" },
  { img: "hair", name: "Gigi", role: "Hair Salon", say: "Let's chat — ask me anything!" },
  { img: "nail", name: "Priya", role: "Nail Salon", say: "Got a question? Ask me!" },
  { img: "landscaper", name: "Diego", role: "Landscaping", say: "Ask me anything 👋" },
];

export default function HeroMascot() {
  const [i, setI] = useState(0);
  const c = CHARS[i];
  return (
    <div className="relative mx-auto w-full max-w-[440px]">
      <style>{CSS}</style>
      <div className="pointer-events-none absolute left-1/2 top-[42%] h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#e3342b]/10 blur-3xl" />

      <OpenMascot className="hm group relative mx-auto block w-full max-w-[390px] text-left">
        <span className="hm-bubble" key={`b-${c.img}`}>{c.say}</span>
        <span className="hm-stage">
          <img key={c.img} src={`/mascots/${c.img}.png`} alt={`${c.name} — ${c.role} mascot. Click to chat.`} className="hm-img" />
          <span className="hm-shadow" />
        </span>
        <span className="hm-pill"><span className="hm-dot" /> LIVE — TALK TO ME</span>
      </OpenMascot>

      <div className="hm-pick" role="tablist" aria-label="Choose a mascot">
        {CHARS.map((m, idx) => (
          <button
            key={m.img}
            type="button"
            role="tab"
            aria-selected={idx === i}
            aria-label={`Show ${m.name}, ${m.role}`}
            onClick={() => setI(idx)}
            className={`hm-thumb ${idx === i ? "is-active" : ""}`}
          >
            <img src={`/mascots/${m.img}.png`} alt="" loading="lazy" />
          </button>
        ))}
      </div>
      <p className="mt-3 text-center text-xs font-medium text-smoke">Pick a face — they each talk. <span className="text-ink">Click to chat.</span></p>
    </div>
  );
}

const CSS = `
.hm-stage{ position:relative; display:block; animation: hmFloat 6s ease-in-out infinite; }
.hm-img{ position:relative; z-index:2; display:block; width:100%; margin:0 auto; filter: drop-shadow(0 22px 34px rgba(10,10,10,.18)); animation: hmSwap .45s cubic-bezier(.2,.7,.2,1) both; }
.hm-shadow{ position:absolute; z-index:1; left:50%; bottom:5%; width:54%; height:24px; transform:translateX(-50%); background:radial-gradient(closest-side, rgba(10,10,10,.22), rgba(10,10,10,0) 75%); filter:blur(2px); }
@keyframes hmFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
@keyframes hmSwap{from{opacity:0;transform:translateY(10px) scale(.97)}to{opacity:1;transform:none}}
.hm{ transition: transform .35s cubic-bezier(.2,.7,.2,1); }
.hm:hover{ transform: translateY(-4px); }

.hm-bubble{ position:absolute; top:2%; right:-4px; z-index:3; background:#fff; color:#0A0A0A; border:2px solid #0A0A0A; border-radius:18px; padding:8px 14px; font-size:14px; font-weight:800; white-space:nowrap; box-shadow:5px 5px 0 0 #e3342b; animation: hmSwap .4s ease both; }
.hm-bubble::after{ content:""; position:absolute; right:26px; bottom:-8px; width:10px; height:10px; background:#fff; border-right:2px solid #0A0A0A; border-bottom:2px solid #0A0A0A; transform: rotate(45deg); }

.hm-pill{ position:absolute; left:50%; bottom:-6px; z-index:4; transform:translateX(-50%); display:inline-flex; align-items:center; gap:8px; white-space:nowrap; background:#0A0A0A; color:#fff; border-radius:9999px; padding:9px 16px; font-size:11px; font-weight:800; letter-spacing:.12em; box-shadow:0 10px 24px rgba(10,10,10,.3); transition: transform .3s ease, box-shadow .3s ease; }
.hm:hover .hm-pill{ transform: translateX(-50%) translateY(-2px); box-shadow:0 14px 30px rgba(10,10,10,.4); }
.hm-dot{ width:8px; height:8px; border-radius:50%; background:#22c55e; animation: hmPulse 1.8s infinite; }
@keyframes hmPulse{0%{box-shadow:0 0 0 0 rgba(34,197,94,.6)}70%{box-shadow:0 0 0 8px rgba(34,197,94,0)}100%{box-shadow:0 0 0 0 rgba(34,197,94,0)}}

.hm-pick{ display:flex; flex-wrap:wrap; justify-content:center; gap:10px; margin-top:30px; }
.hm-thumb{ position:relative; width:58px; height:58px; border-radius:16px; border:2px solid rgba(10,10,10,.12); background:rgba(10,10,10,.05); overflow:hidden; cursor:pointer; padding:0; transition: transform .25s ease, border-color .25s ease, box-shadow .25s ease; }
.hm-thumb img{ width:135%; height:135%; max-width:none; object-fit:cover; object-position:top center; margin-left:-17.5%; }
.hm-thumb:hover{ transform:translateY(-3px); border-color:rgba(10,10,10,.45); }
.hm-thumb.is-active{ border-color:#0A0A0A; box-shadow:0 0 0 3px rgba(227,52,43,.25), 0 8px 18px rgba(10,10,10,.18); transform:translateY(-3px); }

@media (prefers-reduced-motion: reduce){ .hm-stage,.hm-img,.hm-bubble,.hm-dot{ animation:none } }
`;
