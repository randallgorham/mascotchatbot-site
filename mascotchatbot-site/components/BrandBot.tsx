"use client";

import { useEffect, useRef } from "react";

/** The MascotChatbot brand bot "Robo" — the original logo robot head/face/eyes/smile/
 *  headset mic boom reproduced EXACTLY (from public/icon.svg), with a body built beneath
 *  it. Head, body, and each arm are separate groups so they animate independently. */
function RobotSVG({ idPrefix }: { idPrefix: string }) {
  const p = idPrefix;
  return (
    <svg className="bot-svg" viewBox="94 40 192 264" aria-hidden="true">
      <g className="bot-arm-l">
        <rect x="124" y="200" width="15" height="48" rx="7.5" fill="#e4e9ef" stroke="#aab4c0" strokeWidth="3" />
      </g>
      <g className="bot-arm-r">
        <rect x="241" y="200" width="15" height="48" rx="7.5" fill="#e4e9ef" stroke="#aab4c0" strokeWidth="3" />
      </g>
      <g className="bot-torso">
        <rect x="146" y="190" width="88" height="82" rx="28" fill="#e4e9ef" stroke="#aab4c0" strokeWidth="3" />
        <circle cx="190" cy="226" r="10" fill="#2bc4e6" className="bot-core" />
        <rect x="173" y="250" width="34" height="7" rx="3.5" fill="#cbd3dc" />
      </g>
      <g className="bot-head">
        <rect x="104" y="104" width="14" height="40" rx="7" fill="#3a434f" />
        <rect x="262" y="104" width="14" height="40" rx="7" fill="#3a434f" />
        <rect x="115" y="58" width="150" height="116" rx="42" fill="#e4e9ef" stroke="#aab4c0" strokeWidth="3" />
        <ellipse cx="190" cy="118" rx="60" ry="44" fill="#2b333d" />
        <rect id={`${p}-eye-l`} className="bot-eye" x="164" y="98" width="14" height="26" rx="7" fill="#2bc4e6" />
        <rect id={`${p}-eye-r`} className="bot-eye bot-eye-r" x="202" y="98" width="14" height="26" rx="7" fill="#2bc4e6" />
        <path id={`${p}-mouth`} className="bot-mouth" d="M164 130 Q190 160 216 130 Z" fill="#2bc4e6" />
        <path d="M112 146 C 116 186, 150 194, 182 176" fill="none" stroke="#3a434f" strokeWidth="8" strokeLinecap="round" />
        <ellipse cx="184" cy="176" rx="10" ry="7" fill="#3a434f" />
      </g>
    </svg>
  );
}

/** Big animated logo for the hero — clicking it opens the floating widget. */
export function HeroBot() {
  return (
    <div className="relative mx-auto w-full max-w-[440px]">
      <style>{CSS}</style>
      <div className="pointer-events-none absolute left-1/2 top-[42%] h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#2bc4e6]/15 blur-3xl" />
      <button
        type="button"
        className="hb group relative mx-auto block w-[320px] max-w-full cursor-pointer border-0 bg-transparent"
        aria-label="Talk to our mascot"
        onClick={() => {
          const el = document.querySelector("#bot-stage") as HTMLElement | null;
          el?.click();
        }}
      >
        <span className="hb-bubble">Hi! I'm Robo — your 24/7 mascot. Ask me anything 👋</span>
        <span className="hb-stage"><RobotSVG idPrefix="hero" /></span>
        <span className="hb-shadow" />
        <span className="hb-pill"><span className="hb-dot" /> LIVE — TALK TO ME</span>
      </button>
    </div>
  );
}

/** Floating, click-to-talk MascotChatbot brand bot "Robo" (site-wide). */
export default function BrandBot() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const r = root.current;
    if (!r) return;
    const $ = (s: string) => r.querySelector(s) as HTMLElement | null;

    const CFG = {
      greeting:
        "Hi, I'm Robo — the MascotChatbot! 👋 I'm a live example of exactly what we build for your business: a talking mascot that greets visitors, answers questions, and books appointments 24/7. And the best part — you don't have to type a thing. Just tap the mic and talk to me, and I'll answer any question you've got!",
      quick: ["What is this?", "Pricing", "Book a demo"],
      answers: [
        { k: ["what", "this", "who", "explain", "how", "work", "mascot", "chatbot", "do"], a: "I'm Robo — a MascotChatbot. I'm a custom animated mascot that lives on your website, talks to every visitor, answers their questions 24/7, captures leads, and books appointments. Basically a salesperson that never sleeps. Want a free demo?" },
        { k: ["price", "pricing", "cost", "how much", "plan", "plans", "rates"], a: "Plans start at $99/mo flat — no per-message fees — with a one-time setup (waived if you prepay). We design it, host it, and keep it sharp. Want me to book you a quick demo to walk through it?" },
        { k: ["book", "demo", "call", "talk", "human", "start", "appointment", "schedule", "get one", "sign up"], a: "Love it — let's get you a free demo! Drop your name and email in the form on this page, or head to the pricing section to get started. 🚀" },
        { k: ["industry", "business", "work for", "fit", "niche"], a: "We build mascots for any business — electricians, dentists, realtors, gyms, salons, restaurants and more. If you've got a website, we've got a mascot for it. Want a free demo?" },
        { k: ["hi", "hey", "hello", "yo", "sup"], a: "Hey there! 👋 I'm Robo, the MascotChatbot mascot. Ask me what we do, our pricing, or say 'book a demo' and I'll get you set up!" },
      ],
      fallback: "Great question! I'm Robo, a MascotChatbot demo — I answer visitors 24/7 and book appointments. Want one like me for your site? Drop your email in the form or book a free demo. 🚀",
    };

    const W = r;
    const STAGE = $("#bot-stage"), BODY = $("#bot-body"),
      MOUTH = $("#float-mouth"), SAY = $("#bot-say"), YOU = $("#bot-you"),
      QUICK = $("#bot-quick"), FORM = $("#bot-form") as HTMLFormElement | null,
      TEXT = $("#bot-text") as HTMLInputElement | null, MUTE = $("#bot-mute"),
      MIC = $("#bot-mic"), HINT = $("#bot-hint");
    let started = false, muted = false, speaking = false, listening = false, hintTimer: number;
    const history: { role: string; content: string }[] = [];

    let audioCtx: AudioContext | null = null, analyser: AnalyserNode | null = null, curAudio: HTMLAudioElement | null = null;
    function ensureCtx() {
      try {
        const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (AC && !audioCtx) audioCtx = new AC();
        if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
      } catch {}
    }
    function stopAudio() { if (curAudio) { try { curAudio.pause(); } catch {} curAudio = null; } }

    function setMouth(open: number) { if (MOUTH) MOUTH.style.transform = "scaleY(" + (1 + Math.max(0, Math.min(1, open)) * 0.55).toFixed(2) + ")"; }
    let lipOn = false;
    function lipLoop() {
      if (!speaking || !analyser) { lipOn = false; return; }
      const data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(data);
      let sum = 0; for (let i = 0; i < data.length; i++) sum += data[i];
      setMouth((sum / data.length - 6) / 70);
      requestAnimationFrame(lipLoop);
    }
    function startLip() { if (lipOn) return; lipOn = true; lipLoop(); }
    function loopMouth() {
      if (!speaking) { setMouth(0); return; }
      setMouth(0.15 + Math.random() * 0.7);
      window.setTimeout(loopMouth, 70 + Math.random() * 70);
    }
    function nod() { BODY?.classList.remove("bot-nodding"); void BODY?.offsetWidth; BODY?.classList.add("bot-nodding"); window.setTimeout(() => BODY?.classList.remove("bot-nodding"), 620); }

    let voice: SpeechSynthesisVoice | null = null;
    function pickVoice() {
      const vs = window.speechSynthesis ? speechSynthesis.getVoices() : [];
      if (!vs.length) return null;
      for (const p of ["Google US English", "Samantha", "Microsoft", "female"]) for (const v of vs) if (v.name.toLowerCase().includes(p.toLowerCase()) && v.lang.startsWith("en")) return v;
      return vs.find((v) => v.lang.startsWith("en")) || vs[0];
    }
    if (window.speechSynthesis) { voice = pickVoice(); speechSynthesis.onvoiceschanged = () => { voice = pickVoice(); }; }

    // ===== streaming speech engine =====
    // Each enqueued sentence kicks off its own TTS fetch immediately (parallel), and a
    // single worker plays them strictly in order — so Robo starts on sentence 1 while the
    // rest are still being rendered. spkSeq lets a new turn cancel an in-flight one.
    let spkItems: { text: string; buf: Promise<ArrayBuffer | null> }[] = [];
    let spkRunning = false;
    let spkSeq = 0;
    function resetSpeak() {
      spkSeq++; spkItems = []; stopAudio();
      if (window.speechSynthesis) { try { speechSynthesis.cancel(); } catch {} }
      speaking = false; BODY?.classList.remove("bot-talking"); setMouth(0);
    }
    function fetchTTS(text: string): Promise<ArrayBuffer | null> {
      if (muted) return Promise.resolve(null);
      return fetch("/api/tts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, speed: 1.2 }) })
        .then((res) => (!res.ok || res.status === 204) ? null : res.arrayBuffer())
        .then((b) => (b && b.byteLength >= 200) ? b : null)
        .catch(() => null);
    }
    function flapAwait(text: string) {
      return new Promise<void>((res) => { loopMouth(); window.setTimeout(res, Math.max(500, text.length * 32)); });
    }
    function speakBrowserAwait(text: string) {
      return new Promise<void>((res) => {
        if (!window.speechSynthesis) { flapAwait(text).then(res); return; }
        try {
          const u = new SpeechSynthesisUtterance(text);
          if (voice) u.voice = voice; u.rate = 1.2; u.pitch = 1.1;
          u.onstart = () => loopMouth(); u.onend = () => res(); u.onerror = () => res();
          speechSynthesis.speak(u);
        } catch { flapAwait(text).then(res); }
      });
    }
    function playBuf(buf: ArrayBuffer, seq: number) {
      return new Promise<void>((resolve) => {
        if (seq !== spkSeq) { resolve(); return; }
        const url = URL.createObjectURL(new Blob([buf], { type: "audio/mpeg" }));
        const a = new Audio(url); curAudio = a; a.crossOrigin = "anonymous";
        try {
          ensureCtx();
          if (audioCtx) { const src = audioCtx.createMediaElementSource(a); analyser = audioCtx.createAnalyser(); analyser.fftSize = 256; src.connect(analyser); analyser.connect(audioCtx.destination); }
        } catch { analyser = null; }
        a.onplay = () => { BODY?.classList.add("bot-talking"); if (analyser) startLip(); else loopMouth(); };
        a.onended = () => { URL.revokeObjectURL(url); resolve(); };
        a.onerror = () => { resolve(); };
        a.play().catch(() => resolve());
      });
    }
    async function runSpeak(seq: number) {
      spkRunning = true;
      speaking = true; BODY?.classList.add("bot-talking");
      while (spkItems.length) {
        if (seq !== spkSeq) break;
        const it = spkItems.shift()!;
        let buf: ArrayBuffer | null = null;
        try { buf = await it.buf; } catch { buf = null; }
        if (seq !== spkSeq) break;
        if (buf) await playBuf(buf, seq);
        else if (muted) await flapAwait(it.text);
        else await speakBrowserAwait(it.text);
      }
      spkRunning = false;
      if (seq === spkSeq) { speaking = false; BODY?.classList.remove("bot-talking"); setMouth(0); relisten(); }
    }
    function enqueueSpeak(text: string) {
      text = (text || "").trim(); if (!text) return;
      spkItems.push({ text, buf: fetchTTS(text) });
      if (!spkRunning) runSpeak(spkSeq);
    }
    function speakAll(text: string) {
      resetSpeak();
      const parts = String(text).match(/[^.!?\n]+[.!?\n]*/g) || [String(text)];
      parts.forEach((p) => enqueueSpeak(p));
    }
    function say(text: string) { if (SAY) SAY.textContent = text; nod(); speakAll(text); }

    function open() {
      if (W.getAttribute("data-state") === "open") return;
      W.setAttribute("data-state", "open");
      ensureCtx();
      window.clearTimeout(hintTimer); if (HINT) HINT.style.opacity = "0";
      BODY?.classList.remove("bot-intro"); void BODY?.offsetWidth; BODY?.classList.add("bot-intro");
      try { if (sessionStorage.getItem("mcb_mic")) convo = true; } catch {}
      if (!started) { started = true; renderQuick(); window.setTimeout(() => say(CFG.greeting), 380); }
      window.setTimeout(() => TEXT?.focus(), 360);
    }
    function close() { W.setAttribute("data-state", "idle"); resetSpeak(); }

    function renderQuick() {
      if (!QUICK) return; QUICK.innerHTML = "";
      CFG.quick.forEach((q) => {
        const b = document.createElement("button"); b.className = "bot-chip"; b.textContent = q;
        if (/book|demo|appointment|schedule/i.test(q)) b.addEventListener("click", () => { try { window.location.href = "/#book"; } catch {} });
        else if (/pricing|price/i.test(q)) b.addEventListener("click", () => { try { window.location.href = "/#pricing"; } catch {} send(q); });
        else b.addEventListener("click", () => send(q));
        QUICK.appendChild(b);
      });
    }
    function offlineReply(text: string) {
      const q = " " + text.toLowerCase().replace(/[^a-z0-9\s]/g, " ") + " ";
      for (const s of CFG.answers) for (const k of s.k) if (q.includes(" " + k + " ")) return s.a;
      return CFG.fallback;
    }

    // pull complete sentences out of the streaming buffer and queue them for speech
    let sayBuf = "";
    function pumpSentences(end: boolean) {
      for (;;) {
        let cut = -1;
        for (let i = 0; i < sayBuf.length; i++) {
          const c = sayBuf[i], nxt = sayBuf[i + 1];
          if (c === "\n" || ((c === "." || c === "!" || c === "?") && (nxt === undefined || nxt === " " || nxt === "\n"))) { cut = i + 1; break; }
        }
        if (cut === -1) break;
        let j = cut; while (j < sayBuf.length && (sayBuf[j] === " " || sayBuf[j] === "\n")) j++;
        const sent = sayBuf.slice(0, j).trim();
        sayBuf = sayBuf.slice(j);
        if (sent) enqueueSpeak(sent);
      }
      if (end) { const rest = sayBuf.trim(); sayBuf = ""; if (rest) enqueueSpeak(rest); }
    }

    async function send(text: string) {
      text = (text || "").trim(); if (!text) return;
      if (YOU) YOU.textContent = "You: " + text; if (SAY) SAY.textContent = "…"; if (TEXT) TEXT.value = "";
      history.push({ role: "user", content: text });
      ensureCtx(); resetSpeak(); nod(); sayBuf = "";
      let full = "";
      try {
        const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: history, persona: "brand", stream: true }) });
        if (!res.ok || !res.body) throw new Error("bad");
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let first = true;
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = dec.decode(value, { stream: true });
          if (!chunk) continue;
          if (first) { first = false; if (SAY) SAY.textContent = ""; }
          full += chunk; sayBuf += chunk;
          if (SAY) SAY.textContent = full;
          pumpSentences(false);
        }
        pumpSentences(true);
        if (!full.trim()) { const off = offlineReply(text); if (SAY) SAY.textContent = off; speakAll(off); full = off; }
        history.push({ role: "assistant", content: full });
      } catch {
        const off = offlineReply(text); if (SAY) SAY.textContent = off; nod(); speakAll(off);
        history.push({ role: "assistant", content: off });
      }
    }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    let recog: any = null, convo = false;
    function startListening() {
      if (!SR || listening || speaking) return;
      ensureCtx();
      try {
        recog = new SR(); recog.lang = "en-US"; recog.interimResults = false; recog.maxAlternatives = 1;
        recog.onstart = () => { listening = true; MIC?.classList.add("bot-live"); try { sessionStorage.setItem("mcb_mic", "1"); } catch {} };
        recog.onresult = (e: any) => { const t = e.results[0][0].transcript; if (t) send(t); };
        recog.onerror = () => { listening = false; MIC?.classList.remove("bot-live"); };
        recog.onend = () => { listening = false; MIC?.classList.remove("bot-live"); };
        recog.start();
      } catch { listening = false; }
    }
    // Hands-free: once the visitor has used the mic, reopen it after Robo finishes talking.
    function relisten() {
      if (!convo || muted || !SR) return;
      if (W.getAttribute("data-state") !== "open") return;
      window.setTimeout(() => { if (!speaking && !listening) startListening(); }, 300);
    }
    function toggleMic() {
      if (!SR) { say("Voice input isn't supported in this browser — just type to me instead!"); return; }
      if (listening) { convo = false; try { recog && recog.stop(); } catch {} return; }
      convo = true;
      startListening();
    }

    STAGE?.addEventListener("click", open);
    $(".bot-x")?.addEventListener("click", (e) => { e.stopPropagation(); close(); });
    FORM?.addEventListener("submit", (e) => { e.preventDefault(); if (TEXT) send(TEXT.value); });
    MIC?.addEventListener("click", toggleMic);
    MUTE?.addEventListener("click", () => {
      muted = !muted; MUTE.classList.toggle("bot-off", muted); MUTE.innerHTML = muted ? "&#128263;" : "&#128266;";
      if (muted) resetSpeak();
    });
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    hintTimer = window.setTimeout(() => { if (W.getAttribute("data-state") !== "open" && HINT) HINT.style.opacity = "1"; }, 3500);
    // Auto-greet visitors when they land (once per browser session)
    let greetTimer = 0;
    try {
      if (!sessionStorage.getItem("mcb_greeted")) {
        greetTimer = window.setTimeout(() => {
          try { sessionStorage.setItem("mcb_greeted", "1"); } catch {}
          if (W.getAttribute("data-state") !== "open") open();
        }, 1600);
      }
    } catch {
      greetTimer = window.setTimeout(() => { if (W.getAttribute("data-state") !== "open") open(); }, 1600);
    }
    // Periodic "hey, look at me" — wave + wink every several seconds (skips while talking)
    const attnTimer = window.setInterval(() => {
      if (speaking) return;
      BODY?.classList.remove("bot-attn"); void BODY?.offsetWidth; BODY?.classList.add("bot-attn");
      window.setTimeout(() => BODY?.classList.remove("bot-attn"), 1600);
    }, 6500);
    return () => { window.clearTimeout(greetTimer); window.clearInterval(attnTimer); document.removeEventListener("keydown", onKey); resetSpeak(); };
  }, []);

  return (
    <div id="bot" ref={root} data-state="idle" aria-live="polite">
      <style>{CSS}</style>
      <div className="bot-panel">
        <button className="bot-x" aria-label="Close chat">&times;</button>
        <div className="bot-bubble">
          <button className="bot-mute" id="bot-mute" aria-label="Mute voice">&#128266;</button>
          <span className="bot-you" id="bot-you"></span>
          <span className="bot-say" id="bot-say"></span>
          <span className="bot-tail"></span>
        </div>
        <div className="bot-quick" id="bot-quick"></div>
        <form className="bot-input" id="bot-form" autoComplete="off">
          <input id="bot-text" type="text" placeholder="Ask Robo…" aria-label="Ask Robo" />
          <button type="button" className="bot-mic" id="bot-mic" aria-label="Talk to the mascot">
            <svg viewBox="0 0 24 24" width="17" height="17"><path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3z" fill="currentColor" /><path d="M19 11a7 7 0 0 1-14 0M12 18v3" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>
          </button>
          <button type="submit" className="bot-send" aria-label="Send">
            <svg viewBox="0 0 24 24" width="18" height="18"><path d="M3 11.5 21 3l-8.5 18-2.2-7.3z" fill="currentColor" /></svg>
          </button>
        </form>
      </div>

      <div className="bot-body" id="bot-body">
        <button className="bot-stage" id="bot-stage" aria-label="Talk to our mascot">
          <span className="bot-aura"></span>
          <span className="bot-puppet"><RobotSVG idPrefix="float" /></span>
          <span className="bot-shadow"></span>
        </button>
        <span className="bot-hint" id="bot-hint">Click me 👋</span>
      </div>
    </div>
  );
}

const CSS = `
#bot{ --cy:#2bc4e6; --cy-d:#1597b4; --char:#14171c; --ink:#1d2127; position:fixed; right:20px; bottom:16px; z-index:60; font-family:ui-sans-serif,system-ui,Arial,sans-serif; transition:bottom .32s cubic-bezier(.34,1.4,.5,1); will-change:transform; transform:translateZ(0); backface-visibility:hidden; }
#bot[data-state="open"]{ bottom:58px; }
#bot *{ box-sizing:border-box; }
.bot-body{ position:relative; width:150px; height:208px; }
.bot-stage{ position:absolute; inset:0; width:100%; height:100%; border:none; background:none; padding:0; cursor:pointer; animation:botBreathe 4.6s ease-in-out infinite, botSway 7s ease-in-out infinite; transform-origin:50% 100%; will-change:transform; }
.bot-body.bot-intro .bot-stage{ animation:botIntro .9s cubic-bezier(.2,1.35,.4,1) both, botBreathe 4.6s ease-in-out 1s infinite, botSway 7s ease-in-out 1s infinite; }
.bot-puppet,.bot-svg{ position:absolute; inset:0; width:100%; height:100%; }
.bot-svg{ overflow:visible; will-change:transform; }
.bot-eye{ transform-box:fill-box; transform-origin:center; animation:botBlink 5.2s infinite; }
@keyframes botBlink{0%,3.4%,100%{transform:scaleY(1)}1.4%,2.2%{transform:scaleY(.08)}}
.bot-mouth{ transform-box:fill-box; transform-origin:center; transition:transform .05s linear; }
.bot-head{ transform-box:fill-box; transform-origin:50% 97%; animation:botHeadIdle 6s ease-in-out infinite; }
.bot-body.bot-talking .bot-head{ animation:botHeadTalk .9s ease-in-out infinite; }
@keyframes botHeadIdle{0%,100%{transform:rotate(-1.6deg)}50%{transform:rotate(1.6deg)}}
.bot-body.bot-nodding .bot-head{ animation:botNod .6s cubic-bezier(.3,1.4,.5,1); }
@keyframes botHeadTalk{0%{transform:rotate(0)}25%{transform:rotate(1.6deg) translateY(-2px)}60%{transform:rotate(-1.4deg) translateY(1px)}100%{transform:rotate(0)}}
@keyframes botNod{0%,100%{transform:rotate(0)}45%{transform:rotate(2.4deg) translateY(3px)}}
.bot-core{ animation:botCore 2.4s ease-in-out infinite; transform-box:fill-box; transform-origin:center; }
@keyframes botCore{0%,100%{opacity:.6;transform:scale(.9)}50%{opacity:1;transform:scale(1.12)}}
.bot-bulb{ animation:botCore 2s ease-in-out infinite; }
.bot-arm-l,.bot-arm-r{ transform-box:fill-box; transform-origin:50% 8%; }
.bot-body.bot-talking .bot-arm-l{ animation:botWaveL .62s ease-in-out infinite; }
.bot-body.bot-talking .bot-arm-r{ animation:botWaveR .62s ease-in-out infinite; }
@keyframes botWaveL{0%,100%{transform:rotate(0)}50%{transform:rotate(16deg)}}
@keyframes botWaveR{0%,100%{transform:rotate(0)}50%{transform:rotate(-18deg)}}
.bot-body.bot-attn .bot-arm-r{ animation:botWaveR .53s ease-in-out 3; }
.bot-body.bot-attn .bot-eye-r{ animation:botWink .9s ease-in-out; }
@keyframes botWink{0%,100%{transform:scaleY(1)}28%,52%{transform:scaleY(.08)}}
.bot-aura{ position:absolute; left:50%; top:46%; width:140px; height:140px; transform:translate(-50%,-50%); background:radial-gradient(circle,rgba(43,196,230,.22),transparent 62%); z-index:0; animation:botAura 3.4s ease-in-out infinite; }
@keyframes botAura{0%,100%{opacity:.5;transform:translate(-50%,-50%) scale(.95)}50%{opacity:.9;transform:translate(-50%,-50%) scale(1.08)}}
.bot-shadow{ position:absolute; left:50%; bottom:-6px; width:96px; height:13px; transform:translateX(-50%); background:radial-gradient(50% 100% at 50% 50%,rgba(0,0,0,.38),transparent 70%); z-index:0; }
.bot-hint{ position:absolute; left:50%; top:-14px; transform:translateX(-50%); background:var(--char); color:#fff; font-size:12px; font-weight:600; padding:5px 11px; border-radius:14px; white-space:nowrap; box-shadow:0 6px 16px rgba(0,0,0,.25); transition:opacity .3s; }
.bot-hint::after{ content:""; position:absolute; left:50%; bottom:-5px; transform:translateX(-50%) rotate(45deg); width:9px; height:9px; background:var(--char); }
#bot[data-state="open"] .bot-hint{ display:none; }
@keyframes botBreathe{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-5px) scale(1.012)}}
@keyframes botSway{0%,100%{transform:rotate(-1deg)}50%{transform:rotate(1deg)}}
@keyframes botIntro{0%{transform:translateY(150px) scale(.7);opacity:0}60%{transform:translateY(-12px) scale(1.03)}100%{transform:translateY(0) scale(1);opacity:1}}
.bot-panel{ position:absolute; right:130px; bottom:6px; width:280px; max-width:74vw; display:flex; flex-direction:column; align-items:flex-start; gap:9px; opacity:0; transform:translateY(10px) scale(.96); transform-origin:bottom right; pointer-events:none; transition:opacity .28s ease, transform .34s cubic-bezier(.34,1.4,.5,1); }
#bot[data-state="open"] .bot-panel{ opacity:1; transform:none; pointer-events:auto; }
.bot-x{ align-self:flex-end; width:26px; height:26px; border:none; border-radius:50%; cursor:pointer; background:var(--char); color:#fff; font-size:16px; line-height:1; box-shadow:0 4px 12px rgba(0,0,0,.25); }
.bot-bubble{ position:relative; background:#fff; color:var(--ink); border:2px solid var(--char); border-radius:16px; padding:13px 15px 14px; font-size:14.5px; line-height:1.42; width:100%; box-shadow:0 14px 34px rgba(0,0,0,.16); min-height:20px; }
.bot-mute{ position:absolute; top:8px; right:9px; border:none; background:none; cursor:pointer; font-size:14px; opacity:.55; line-height:1; } .bot-mute:hover{opacity:1} .bot-mute.bot-off{opacity:.3;text-decoration:line-through}
.bot-you{ display:block; font-size:12px; color:#9aa3ad; margin-bottom:4px; } .bot-you:empty{display:none}
.bot-say{ display:block; font-weight:500; }
.bot-tail{ position:absolute; right:-12px; bottom:20px; width:0; height:0; border-top:9px solid transparent; border-bottom:9px solid transparent; border-left:13px solid var(--char); }
.bot-tail::after{ content:""; position:absolute; right:3px; top:-7px; border-top:7px solid transparent; border-bottom:7px solid transparent; border-left:10px solid #fff; }
.bot-quick{ display:flex; flex-wrap:wrap; gap:6px; width:100%; }
.bot-chip{ border:1.5px solid #d9dee5; background:#fff; color:var(--ink); font-size:12px; font-weight:600; padding:6px 10px; border-radius:16px; cursor:pointer; transition:all .16s; box-shadow:0 3px 10px rgba(0,0,0,.06); }
.bot-chip:hover{ border-color:var(--cy); color:var(--cy-d); transform:translateY(-1px); }
.bot-input{ display:flex; gap:6px; width:100%; background:#fff; border:1.5px solid #d9dee5; border-radius:24px; padding:5px 5px 5px 14px; box-shadow:0 8px 22px rgba(0,0,0,.12); align-items:center; }
#bot-text{ flex:1; border:none; outline:none; font-size:14px; background:none; color:var(--ink); }
.bot-mic{ width:34px; height:34px; flex:0 0 auto; border:1.5px solid #d9dee5; border-radius:50%; cursor:pointer; color:var(--ink); background:#fff; display:grid; place-items:center; transition:all .18s; }
.bot-mic:hover{ border-color:var(--cy); color:var(--cy-d); }
.bot-mic.bot-live{ background:var(--cy); color:#fff; border-color:var(--cy); animation:botMic 1s ease-in-out infinite; }
@keyframes botMic{0%,100%{box-shadow:0 0 0 0 rgba(43,196,230,.5)}50%{box-shadow:0 0 0 7px rgba(43,196,230,0)}}
.bot-send{ width:36px; height:36px; flex:0 0 auto; border:none; border-radius:50%; cursor:pointer; color:#fff; background:linear-gradient(160deg,var(--cy),var(--cy-d)); display:grid; place-items:center; transition:transform .2s; box-shadow:0 4px 11px rgba(43,196,230,.4); }
.bot-send:hover{ transform:scale(1.08) rotate(8deg); }
@media (max-width:560px){ #bot{right:12px;bottom:10px} .bot-body{width:112px;height:156px} .bot-panel{right:104px;width:62vw} }
@media (prefers-reduced-motion:reduce){ #bot .bot-stage,#bot .bot-head,#bot .bot-eye,#bot .bot-eye-r,#bot .bot-core,#bot .bot-bulb,#bot .bot-arm-l,#bot .bot-arm-r{animation:none!important} }

/* hero variant */
.hb{ display:block; }
.hb-stage{ position:relative; display:block; width:320px; max-width:100%; margin:0 auto; animation:botBreathe 4.6s ease-in-out infinite, botSway 7s ease-in-out infinite; transform-origin:50% 100%; will-change:transform; }
.hb-stage .bot-svg{ position:relative; inset:auto; width:100%; height:auto; will-change:transform; }
.hb-stage .bot-eye{ transform-box:fill-box; transform-origin:center; animation:botBlink 5.2s infinite; }
.hb-bubble{ position:absolute; left:50%; top:-14px; transform:translateX(-50%); background:#fff; border:2px solid var(--char,#14171c); color:#1d2127; font-size:13px; font-weight:600; padding:8px 13px; border-radius:16px; box-shadow:0 10px 26px rgba(0,0,0,.14); white-space:nowrap; max-width:92vw; z-index:5; }
.hb-shadow{ position:absolute; left:50%; bottom:30px; width:180px; height:20px; transform:translateX(-50%); background:radial-gradient(50% 100% at 50% 50%,rgba(0,0,0,.16),transparent 70%); }
.hb-pill{ display:inline-flex; align-items:center; gap:7px; margin-top:14px; background:#14171c; color:#fff; font-size:12px; font-weight:700; letter-spacing:.04em; padding:7px 14px; border-radius:999px; }
.hb-dot{ width:8px; height:8px; border-radius:50%; background:#22e07a; box-shadow:0 0 0 0 rgba(34,224,122,.6); animation:botMic 1.6s infinite; }
`;
