"use client";

import { useEffect, useState } from "react";

const LINES = [
  "Hey! Need a hand? Ask me anything ⚡",
  "Want a quote? I can have one to you in a minute.",
  "I can book you in for tomorrow at 9am — sound good?",
  "Looking for a realtor in your area? I got you.",
];

export default function MascotMock() {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState("");
  const [talking, setTalking] = useState(true);

  useEffect(() => {
    const full = LINES[idx];
    setText("");
    setTalking(true);
    let i = 0;
    const type = setInterval(() => {
      i++;
      setText(full.slice(0, i));
      if (i >= full.length) {
        clearInterval(type);
        setTalking(false);
        setTimeout(() => setIdx((p) => (p + 1) % LINES.length), 2200);
      }
    }, 32);
    return () => clearInterval(type);
  }, [idx]);

  return (
    <div className="relative flex items-end justify-center">
      {/* speech bubble */}
      <div className="absolute -top-2 right-2 max-w-[230px] sm:max-w-[260px] rounded-2xl rounded-br-sm border-2 border-ink bg-paper px-4 py-3 text-[13px] leading-snug shadow-[6px_6px_0_0_#0a0a0a]">
        {text}
        <span className="ml-0.5 inline-block h-3 w-[2px] translate-y-[2px] bg-ink animate-pulse" />
      </div>

      {/* character */}
      <div className="animate-floaty">
        <svg width="190" height="230" viewBox="0 0 190 230" fill="none" aria-hidden>
          {/* body */}
          <rect x="45" y="120" width="100" height="92" rx="34" fill="#0A0A0A" />
          {/* head */}
          <circle cx="95" cy="78" r="62" fill="#0A0A0A" />
          <circle cx="95" cy="78" r="62" fill="none" stroke="#0A0A0A" strokeWidth="2" />
          {/* face plate */}
          <circle cx="95" cy="78" r="50" fill="#FFFFFF" />
          {/* eyes */}
          <g className="origin-center animate-blink" style={{ transformBox: "fill-box" } as React.CSSProperties}>
            <circle cx="76" cy="70" r="8" fill="#0A0A0A" />
            <circle cx="114" cy="70" r="8" fill="#0A0A0A" />
          </g>
          {/* talking mouth (bars) */}
          <g transform="translate(95 100)">
            {[-18, -6, 6, 18].map((x, n) => (
              <rect
                key={x}
                x={x - 3}
                y={-12}
                width="6"
                height="24"
                rx="3"
                fill="#0A0A0A"
                className={talking ? "origin-center animate-talk" : ""}
                style={{
                  transformBox: "fill-box",
                  transformOrigin: "center",
                  animationDelay: `${n * 0.08}s`,
                  transform: talking ? undefined : "scaleY(0.18)",
                } as React.CSSProperties}
              />
            ))}
          </g>
          {/* antenna spark */}
          <line x1="95" y1="16" x2="95" y2="2" stroke="#0A0A0A" strokeWidth="3" />
          <circle cx="95" cy="2" r="4" fill="#0A0A0A" />
        </svg>
      </div>
    </div>
  );
}
