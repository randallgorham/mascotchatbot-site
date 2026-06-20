"use client";

import { useEffect, useRef } from "react";

export default function MrAmp() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const r = root.current;
    if (!r) return;
    const $ = (s: string) => r.querySelector(s) as HTMLElement | null;

    const CFG = {
      greeting:
        "Hey! I'm Mr Amp — a live MascotChatbot demo. This is exactly what we put on your site: a talking mascot that answers visitors and books jobs. Ask me anything!",
      quick: ["What is this?", "How much?", "How does it work?", "Book a demo"],
      // Offline fallback answers (used only if the AI brain can't be reached)
      answers: [
        { k: ["what", "this", "who are you", "explain"], a: "We design a custom animated mascot for your brand, give it an AI brain trained on your business, and host it on your site. It chats with visitors 24/7, captures leads, and books appointments — done for you." },
        { k: ["how much", "price", "pricing", "cost", "rates"], a: "Plans start around $300 a month with a one-time setup. Most businesses pick the Pro plan at about $600 a month. One extra booked job usually covers it." },
        { k: ["how", "work", "works", "build", "setup"], a: "Three steps: we design the mascot, train it on your business so answers are accurate, then drop it on your site with one line of code. You do nothing." },
        { k: ["book", "demo", "call", "talk to", "human", "contact", "start"], a: "Love it. Scroll down and drop your email in the form — we'll build a free talking demo of YOUR mascot before you pay a cent. ⚡" },
        { k: ["hi", "hey", "hello", "yo"], a: "Hey there! ⚡ Ask me what we do, pricing, or how to get one." },
      ],
      fallback: "Good question! I can tell you what MascotChatbot does, pricing, how it works, or get you a free demo. What would you like?",
    };

    const W = r;
    const STAGE = $("#amp-stage"), BODY = $("#amp-body"), JAW = $("#amp-jaw"),
      SAY = $("#amp-say"), YOU = $("#amp-you"),
      QUICK = $("#amp-quick"), FORM = $("#amp-form") as HTMLFormElement | null,
      TEXT = $("#amp-text") as HTMLInputElement | null, MUTE = $("#amp-mute"),
      MIC = $("#amp-mic"), LIDR = $("#amp-lid-r"), HINT = $("#amp-hint");
    let started = false, muted = false, speaking = false, listening = false, hintTimer: number;
    let voice: SpeechSynthesisVoice | null = null;
    const history: { role: string; content: string }[] = [];

    // ---- audio + lip sync ----
    let audioCtx: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let curAudio: HTMLAudioElement | null = null;
    function ensureCtx() {
      try {
        const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
        if (AC && !audioCtx) audioCtx = new AC();
        if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
      } catch {}
    }
    function stopAudio() {
      if (curAudio) { try { curAudio.pause(); } catch {} curAudio = null; }
    }
    function lipLoop() {
      if (!speaking || !analyser) return;
      const data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(data);
      let sum = 0; for (let i = 0; i < data.length; i++) sum += data[i];
      const avg = sum / data.length;
      const open = Math.max(0, Math.min(13, (avg - 6) / 9));
      if (JAW) JAW.style.transform = "translateY(" + open.toFixed(1) + "px)";
      requestAnimationFrame(lipLoop);
    }

    function pickVoice() {
      const vs = window.speechSynthesis ? speechSynthesis.getVoices() : [];
      if (!vs.length) return null;
      const pref = ["Daniel", "Alex", "Google US English", "Microsoft David", "male"];
      for (const p of pref) for (const v of vs) if (v.name.toLowerCase().includes(p.toLowerCase()) && v.lang.startsWith("en")) return v;
      return vs.find((v) => v.lang.startsWith("en")) || vs[0];
    }
    if (window.speechSynthesis) { voice = pickVoice(); speechSynthesis.onvoiceschanged = () => { voice = pickVoice(); }; }

    function loopJaw() {
      if (!speaking) { if (JAW) JAW.style.transform = "translateY(0)"; return; }
      const open = 3 + Math.random() * 8;
      if (JAW) JAW.style.transform = "translateY(" + open.toFixed(1) + "px)";
      window.setTimeout(loopJaw, 65 + Math.random() * 70);
    }
    function talkJaw(on: boolean) {
      if (on) { speaking = true; BODY?.classList.add("amp-talking"); }
      else { speaking = false; BODY?.classList.remove("amp-talking"); if (JAW) JAW.style.transform = "translateY(0)"; }
    }
    function wink() { LIDR?.classList.add("amp-winking"); window.setTimeout(() => LIDR?.classList.remove("amp-winking"), 230); }
    function nod() { BODY?.classList.remove("amp-nodding"); void BODY?.offsetWidth; BODY?.classList.add("amp-nodding"); window.setTimeout(() => BODY?.classList.remove("amp-nodding"), 620); }

    function flapFor(t: string) { talkJaw(true); loopJaw(); window.setTimeout(() => talkJaw(false), Math.max(900, t.length * 42)); }

    function speakBrowser(text: string) {
      if (!window.speechSynthesis) { flapFor(text); return; }
      try {
        speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        if (voice) u.voice = voice; u.rate = 1.04;
        u.onstart = () => { talkJaw(true); loopJaw(); }; u.onend = () => talkJaw(false); u.onerror = () => talkJaw(false);
        speechSynthesis.speak(u);
      } catch { flapFor(text); }
    }

    async function say(text: string) {
      if (SAY) SAY.textContent = text; nod();
      if (/thanks|anytime|love it|hey there|let's/i.test(text)) window.setTimeout(wink, 260);
      if (muted) { flapFor(text); return; }
      ensureCtx();
      try {
        const res = await fetch("/api/tts", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }),
        });
        if (!res.ok || res.status === 204) { speakBrowser(text); return; }
        const buf = await res.arrayBuffer();
        if (!buf || buf.byteLength < 200) { speakBrowser(text); return; }
        stopAudio();
        const url = URL.createObjectURL(new Blob([buf], { type: "audio/mpeg" }));
        const a = new Audio(url); curAudio = a; a.crossOrigin = "anonymous";
        try {
          ensureCtx();
          if (audioCtx) {
            const src = audioCtx.createMediaElementSource(a);
            analyser = audioCtx.createAnalyser(); analyser.fftSize = 256;
            src.connect(analyser); analyser.connect(audioCtx.destination);
          }
        } catch { analyser = null; }
        a.onplay = () => { speaking = true; BODY?.classList.add("amp-talking"); if (analyser) lipLoop(); else loopJaw(); };
        a.onended = () => { talkJaw(false); URL.revokeObjectURL(url); };
        a.onerror = () => { talkJaw(false); speakBrowser(text); };
        await a.play();
      } catch { speakBrowser(text); }
    }

    function open() {
      if (W.getAttribute("data-state") === "open") return;
      W.setAttribute("data-state", "open");
      ensureCtx();
      window.clearTimeout(hintTimer); if (HINT) HINT.style.opacity = "0";
      BODY?.classList.remove("amp-intro"); void BODY?.offsetWidth; BODY?.classList.add("amp-intro");
      if (!started) { started = true; renderQuick(); window.setTimeout(() => say(CFG.greeting), 380); }
      window.setTimeout(() => TEXT?.focus(), 360);
    }
    function close() { W.setAttribute("data-state", "idle"); if (window.speechSynthesis) speechSynthesis.cancel(); stopAudio(); talkJaw(false); }

    function renderQuick() {
      if (!QUICK) return; QUICK.innerHTML = "";
      CFG.quick.forEach((q) => {
        const b = document.createElement("button"); b.className = "amp-chip"; b.textContent = q;
        b.addEventListener("click", () => send(q)); QUICK.appendChild(b);
      });
    }
    function offlineReply(text: string) {
      const q = " " + text.toLowerCase().replace(/[^a-z0-9\s]/g, " ") + " ";
      for (const s of CFG.answers) for (const k of s.k) if (q.includes(" " + k + " ")) return s.a;
      return CFG.fallback;
    }
    async function send(text: string) {
      text = (text || "").trim(); if (!text) return;
      if (YOU) YOU.textContent = "You: " + text; if (SAY) SAY.textContent = "…"; if (TEXT) TEXT.value = "";
      history.push({ role: "user", content: text });
      ensureCtx();
      try {
        const res = await fetch("/api/chat", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: history }),
        });
        if (!res.ok) throw new Error("bad");
        const data = await res.json();
        const reply = (data && data.reply) ? String(data.reply) : offlineReply(text);
        history.push({ role: "assistant", content: reply });
        say(reply);
      } catch {
        say(offlineReply(text));
      }
    }

    // ---- mic / speech-to-text ----
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    let recog: any = null;
    function toggleMic() {
      if (!SR) { say("Voice input isn't supported in this browser — just type to me instead!"); return; }
      if (listening && recog) { try { recog.stop(); } catch {} return; }
      ensureCtx();
      recog = new SR(); recog.lang = "en-US"; recog.interimResults = false; recog.maxAlternatives = 1;
      recog.onstart = () => { listening = true; MIC?.classList.add("amp-live"); };
      recog.onresult = (e: any) => { const t = e.results[0][0].transcript; if (t) send(t); };
      recog.onerror = () => { listening = false; MIC?.classList.remove("amp-live"); };
      recog.onend = () => { listening = false; MIC?.classList.remove("amp-live"); };
      try { recog.start(); } catch {}
    }

    STAGE?.addEventListener("click", open);
    $(".amp-x")?.addEventListener("click", (e) => { e.stopPropagation(); close(); });
    FORM?.addEventListener("submit", (e) => { e.preventDefault(); if (TEXT) send(TEXT.value); });
    MIC?.addEventListener("click", toggleMic);
    MUTE?.addEventListener("click", () => {
      muted = !muted; MUTE.classList.toggle("amp-off", muted); MUTE.innerHTML = muted ? "&#128263;" : "&#128266;";
      if (muted) { if (window.speechSynthesis) speechSynthesis.cancel(); stopAudio(); talkJaw(false); }
    });
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    hintTimer = window.setTimeout(() => { if (W.getAttribute("data-state") !== "open" && HINT) HINT.style.opacity = "1"; }, 3500);

    return () => { document.removeEventListener("keydown", onKey); if (window.speechSynthesis) speechSynthesis.cancel(); stopAudio(); };
  }, []);

  return (
    <div id="amp" ref={root} data-state="idle" aria-live="polite">
      <style>{CSS}</style>
      <div className="amp-panel">
        <button className="amp-x" aria-label="Close chat">&times;</button>
        <div className="amp-bubble" id="amp-bubble">
          <button className="amp-mute" id="amp-mute" aria-label="Mute voice">&#128266;</button>
          <span className="amp-you" id="amp-you"></span>
          <span className="amp-say" id="amp-say"></span>
          <span className="amp-tail"></span>
        </div>
        <div className="amp-quick" id="amp-quick"></div>
        <form className="amp-input" id="amp-form" autoComplete="off">
          <input id="amp-text" type="text" placeholder="Ask the mascot…" aria-label="Ask the mascot" />
          <button type="button" className="amp-mic" id="amp-mic" aria-label="Talk to the mascot">
            <svg viewBox="0 0 24 24" width="17" height="17"><path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3z" fill="currentColor" /><path d="M19 11a7 7 0 0 1-14 0M12 18v3" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>
          </button>
          <button type="submit" className="amp-send" aria-label="Send">
            <svg viewBox="0 0 24 24" width="18" height="18"><path d="M3 11.5 21 3l-8.5 18-2.2-7.3z" fill="currentColor" /></svg>
          </button>
        </form>
      </div>

      <div className="amp-body" id="amp-body">
        <button className="amp-stage" id="amp-stage" aria-label="Talk to Mr Amp">
          <span className="amp-aura"></span>
          <span className="amp-bodyimg"></span>
          <span className="amp-rarm" id="amp-rarm">
            <span className="amp-glow"></span>
            <span className="amp-spark k1"></span><span className="amp-spark k2"></span>
            <span className="amp-spark k3"></span><span className="amp-spark k4"></span>
          </span>
          <span className="amp-head" id="amp-head">
            <span className="amp-headbase"></span>
            <span className="amp-mouthint"></span>
            <span className="amp-jaw" id="amp-jaw"></span>
            <span className="amp-lid l" id="amp-lid-l"></span><span className="amp-lid r" id="amp-lid-r"></span>
          </span>
          <span className="amp-shadow"></span>
        </button>
        <span className="amp-hint" id="amp-hint">Click me ⚡</span>
      </div>
    </div>
  );
}

const CSS = `
#amp{ --red:#e3342b; --red-d:#b41f17; --char:#14171c; --ink:#1d2127; --skin:#ecbb90;
  position:fixed; right:20px; bottom:14px; z-index:60; font-family:ui-sans-serif,system-ui,Arial,sans-serif; }
#amp *{ box-sizing:border-box; }
.amp-body{ position:relative; width:150px; height:262px; }
.amp-stage{ position:absolute; inset:0; width:100%; height:100%; border:none; background:none; padding:0; cursor:pointer;
  animation:ampBreathe 4.6s ease-in-out infinite, ampSway 7s ease-in-out infinite; transform-origin:50% 100%; }
.amp-body.amp-intro .amp-stage{ animation:ampIntro .9s cubic-bezier(.2,1.35,.4,1) both, ampBreathe 4.6s ease-in-out 1s infinite, ampSway 7s ease-in-out 1s infinite; }
.amp-bodyimg,.amp-rarm,.amp-head,.amp-headbase,.amp-mouthint,.amp-jaw,.amp-lid{ position:absolute; inset:0; width:100%; height:100%; background-repeat:no-repeat; background-position:center bottom; background-size:contain; pointer-events:none; }
.amp-bodyimg{ background-image:url(/mascot/o_body.png); filter:drop-shadow(0 12px 11px rgba(0,0,0,.42)); z-index:2; }
.amp-rarm{ background-image:url(/mascot/o_rarm.png); z-index:3; transform-origin:68.8% 29.3%; }
.amp-body.amp-talking .amp-rarm{ animation:ampPump .52s ease-in-out infinite; }
@keyframes ampPump{0%,100%{transform:rotate(0) translateY(0)}50%{transform:rotate(-6deg) translateY(-3px)}}
.amp-head{ z-index:4; transform-origin:47.7% 28.8%; animation:ampHeadIdle 6.5s ease-in-out infinite; }
.amp-headbase{ background-image:url(/mascot/o_head.png); filter:drop-shadow(0 7px 6px rgba(0,0,0,.28)); }
.amp-mouthint{ background-image:url(/mascot/o_mouthint.png); }
.amp-jaw{ background-image:url(/mascot/o_jaw.png); transition:transform .04s linear; }
.amp-body.amp-talking .amp-head{ animation:ampHeadTalk .92s ease-in-out infinite; }
.amp-body.amp-nodding .amp-head{ animation:ampHeadNod .6s cubic-bezier(.3,1.4,.5,1); }
@keyframes ampHeadIdle{0%,100%{transform:rotate(0) translateY(0)}50%{transform:rotate(-1deg) translateY(-1px)}}
@keyframes ampHeadTalk{0%{transform:rotate(0)}22%{transform:rotate(1.7deg) translateY(-2px)}55%{transform:rotate(-1.5deg) translateY(1px)}100%{transform:rotate(0)}}
@keyframes ampHeadNod{0%,100%{transform:rotate(0)}45%{transform:rotate(2.4deg) translateY(3px)}}
.amp-lid{ background:var(--skin); border-radius:0 0 60% 60%/0 0 100% 100%; height:3%; transform:scaleY(0); transform-origin:top; animation:ampBlink 5.2s infinite; }
.amp-lid.l{ left:44%; top:13.5%; width:7.4%; } .amp-lid.r{ left:53.2%; top:13.8%; width:6.6%; }
.amp-lid.amp-winking{ animation:none; transform:scaleY(1); }
@keyframes ampBlink{0%,3.6%,100%{transform:scaleY(0)}1.4%,2.2%{transform:scaleY(1)}}
.amp-aura{ position:absolute; left:52%; top:42%; width:140px; height:140px; transform:translate(-50%,-50%); background:radial-gradient(circle,rgba(255,196,0,.18),transparent 62%); z-index:1; animation:ampAura 3.4s ease-in-out infinite; }
@keyframes ampAura{0%,100%{opacity:.5;transform:translate(-50%,-50%) scale(.95)}50%{opacity:.9;transform:translate(-50%,-50%) scale(1.08)}}
.amp-glow{ position:absolute; left:80%; top:24%; width:60px; height:60px; transform:translate(-50%,-50%); background:radial-gradient(circle,rgba(255,238,140,.95),rgba(255,196,0,.5) 35%,transparent 70%); mix-blend-mode:screen; z-index:5; animation:ampGlow 2.5s ease-in-out infinite; }
@keyframes ampGlow{0%,100%{opacity:.55;transform:translate(-50%,-50%) scale(.85)}50%{opacity:1;transform:translate(-50%,-50%) scale(1.15)}}
.amp-spark{ position:absolute; z-index:6; width:4px; height:4px; border-radius:50%; background:#fff; box-shadow:0 0 6px 2px rgba(255,221,87,.9); opacity:0; }
.amp-spark.k1{left:84%;top:14%;animation:ampSpark 2.8s ease-out .2s infinite} .amp-spark.k2{left:90%;top:30%;animation:ampSpark 3.3s ease-out 1.1s infinite}
.amp-spark.k3{left:73%;top:18%;animation:ampSpark 3s ease-out 1.9s infinite} .amp-spark.k4{left:88%;top:22%;animation:ampSpark 2.5s ease-out 2.6s infinite}
@keyframes ampSpark{0%{opacity:0;transform:translate(0,0) scale(.4)}15%{opacity:1}55%{opacity:1}100%{opacity:0;transform:translate(14px,-18px) scale(1.1)}}
.amp-shadow{ position:absolute; left:50%; bottom:-4px; width:118px; height:15px; transform:translateX(-50%); background:radial-gradient(50% 100% at 50% 50%,rgba(0,0,0,.4),transparent 70%); z-index:0; }
.amp-hint{ position:absolute; left:50%; top:-12px; transform:translateX(-50%); background:var(--char); color:#fff; font-size:12px; font-weight:600; padding:5px 11px; border-radius:14px; white-space:nowrap; box-shadow:0 6px 16px rgba(0,0,0,.25); transition:opacity .3s; }
.amp-hint::after{ content:""; position:absolute; left:50%; bottom:-5px; transform:translateX(-50%) rotate(45deg); width:9px; height:9px; background:var(--char); }
#amp[data-state="open"] .amp-hint{ display:none; }
@keyframes ampBreathe{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-5px) scale(1.012)}}
@keyframes ampSway{0%,100%{transform:rotate(-1deg)}50%{transform:rotate(1deg)}}
@keyframes ampIntro{0%{transform:translateY(150px) scale(.7);opacity:0}60%{transform:translateY(-12px) scale(1.03)}100%{transform:translateY(0) scale(1);opacity:1}}
.amp-panel{ position:absolute; right:140px; bottom:6px; width:280px; max-width:74vw; display:flex; flex-direction:column; align-items:flex-start; gap:9px; opacity:0; transform:translateY(10px) scale(.96); transform-origin:bottom right; pointer-events:none; transition:opacity .28s ease, transform .34s cubic-bezier(.34,1.4,.5,1); }
#amp[data-state="open"] .amp-panel{ opacity:1; transform:none; pointer-events:auto; }
.amp-x{ align-self:flex-end; width:26px; height:26px; border:none; border-radius:50%; cursor:pointer; background:var(--char); color:#fff; font-size:16px; line-height:1; box-shadow:0 4px 12px rgba(0,0,0,.25); }
.amp-bubble{ position:relative; background:#fff; color:var(--ink); border:2px solid var(--char); border-radius:16px; padding:13px 15px 14px; font-size:14.5px; line-height:1.42; width:100%; box-shadow:0 14px 34px rgba(0,0,0,.16); min-height:20px; }
.amp-mute{ position:absolute; top:8px; right:9px; border:none; background:none; cursor:pointer; font-size:14px; opacity:.55; line-height:1; } .amp-mute:hover{opacity:1} .amp-mute.amp-off{opacity:.3;text-decoration:line-through}
.amp-you{ display:block; font-size:12px; color:#9aa3ad; margin-bottom:4px; } .amp-you:empty{display:none}
.amp-say{ display:block; font-weight:500; }
.amp-tail{ position:absolute; right:-12px; bottom:20px; width:0; height:0; border-top:9px solid transparent; border-bottom:9px solid transparent; border-left:13px solid var(--char); }
.amp-tail::after{ content:""; position:absolute; right:3px; top:-7px; border-top:7px solid transparent; border-bottom:7px solid transparent; border-left:10px solid #fff; }
.amp-quick{ display:flex; flex-wrap:wrap; gap:6px; width:100%; }
.amp-chip{ border:1.5px solid #d9dee5; background:#fff; color:var(--ink); font-size:12px; font-weight:600; padding:6px 10px; border-radius:16px; cursor:pointer; transition:all .16s; box-shadow:0 3px 10px rgba(0,0,0,.06); }
.amp-chip:hover{ border-color:var(--red); color:var(--red); transform:translateY(-1px); }
.amp-input{ display:flex; gap:6px; width:100%; background:#fff; border:1.5px solid #d9dee5; border-radius:24px; padding:5px 5px 5px 14px; box-shadow:0 8px 22px rgba(0,0,0,.12); align-items:center; }
#amp-text{ flex:1; border:none; outline:none; font-size:14px; background:none; color:var(--ink); }
.amp-mic{ width:34px; height:34px; flex:0 0 auto; border:1.5px solid #d9dee5; border-radius:50%; cursor:pointer; color:var(--ink); background:#fff; display:grid; place-items:center; transition:all .18s; }
.amp-mic:hover{ border-color:var(--red); color:var(--red); }
.amp-mic.amp-live{ background:var(--red); color:#fff; border-color:var(--red); animation:ampMic 1s ease-in-out infinite; }
@keyframes ampMic{0%,100%{box-shadow:0 0 0 0 rgba(227,52,43,.5)}50%{box-shadow:0 0 0 7px rgba(227,52,43,0)}}
.amp-send{ width:36px; height:36px; flex:0 0 auto; border:none; border-radius:50%; cursor:pointer; color:#fff; background:linear-gradient(160deg,var(--red),var(--red-d)); display:grid; place-items:center; transition:transform .2s; box-shadow:0 4px 11px rgba(227,52,43,.4); }
.amp-send:hover{ transform:scale(1.08) rotate(8deg); }
@media (max-width:560px){ #amp{right:10px;bottom:8px} .amp-body{width:120px;height:210px} .amp-panel{right:112px;width:62vw} }
@media (prefers-reduced-motion:reduce){ #amp .amp-stage,#amp .amp-lid,#amp .amp-glow,#amp .amp-spark{animation:none!important} }
`;
