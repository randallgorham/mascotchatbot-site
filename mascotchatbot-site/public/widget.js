/* MascotChatbot embeddable widget. Usage:
   <script src="https://www.mascotchatbot.com/widget.js" data-bot="BOTID" async></script> */
(function () {
  var script = document.currentScript;
  var botId = script && script.getAttribute("data-bot");
  if (!botId) return;
  var base;
  try { base = new URL(script.src).origin; } catch (e) { base = "https://www.mascotchatbot.com"; }

  var cfg = { business: "", cta: "get in touch", ctaUrl: "", greet: true, wave: true, wink: true, voice: "ash", accent: "#e3342b", image: "", badge: true };
  var history = [];
  var muted = false, opened = false, started = false, curAudio = null, listening = false, recog = null;

  function api(path, payload) {
    return fetch(base + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  }

  api("/api/chat", { action: "config", botId: botId })
    .then(function (r) { return r.json(); })
    .then(function (d) { if (d && d.config) for (var k in d.config) if (d.config[k] != null) cfg[k] = d.config[k]; build(); })
    .catch(function () { build(); });

  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    if (attrs) for (var a in attrs) e.setAttribute(a, attrs[a]);
    if (html != null) e.innerHTML = html;
    return e;
  }

  function build() {
    var accent = cfg.accent || "#e3342b";
    var img = cfg.image || (base + "/mascots/dr-volt-1.png");
    var css = el("style");
    css.textContent =
      "#mcbw{position:fixed;right:18px;bottom:16px;z-index:2147483000;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif}" +
      "#mcbw *{box-sizing:border-box}" +
      "#mcbw .mcbw-btn{width:84px;height:84px;border:none;background:transparent;cursor:pointer;padding:0;position:relative;filter:drop-shadow(0 8px 14px rgba(0,0,0,.28));animation:mcbwBob 3.6s ease-in-out infinite;transform-origin:50% 100%}" +
      "#mcbw .mcbw-btn img{width:100%;height:100%;object-fit:contain;display:block}" +
      "@keyframes mcbwBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}" +
      "#mcbw .mcbw-hint{position:absolute;right:92px;bottom:30px;background:#14171c;color:#fff;font-size:13px;font-weight:600;padding:7px 12px;border-radius:14px;white-space:nowrap;box-shadow:0 6px 16px rgba(0,0,0,.25);max-width:200px}" +
      "#mcbw .mcbw-hint:after{content:'';position:absolute;right:-5px;bottom:12px;width:9px;height:9px;background:#14171c;transform:rotate(45deg)}" +
      "#mcbw .mcbw-panel{position:absolute;right:0;bottom:96px;width:330px;max-width:78vw;background:#fff;border:2px solid #14171c;border-radius:18px;box-shadow:0 18px 50px rgba(0,0,0,.22);padding:14px;display:none}" +
      "#mcbw.mcbw-open .mcbw-panel{display:block}" +
      "#mcbw .mcbw-top{display:flex;align-items:center;gap:9px;margin-bottom:10px}" +
      "#mcbw .mcbw-av{width:38px;height:38px;border-radius:50%;border:2px solid #14171c;object-fit:cover;background:#f3f4f6}" +
      "#mcbw .mcbw-name{font-weight:800;font-size:14px;color:#14171c;line-height:1.1}" +
      "#mcbw .mcbw-sub{font-size:11px;color:#16a34a;font-weight:600}" +
      "#mcbw .mcbw-x{margin-left:auto;border:none;background:none;font-size:20px;line-height:1;cursor:pointer;color:#9aa3ad}" +
      "#mcbw .mcbw-mute{border:none;background:none;cursor:pointer;font-size:14px;color:#9aa3ad}" +
      "#mcbw .mcbw-say{background:#f6f7f9;border-radius:12px;padding:11px 13px;font-size:14px;line-height:1.45;color:#1d2127;min-height:42px;max-height:200px;overflow:auto}" +
      "#mcbw .mcbw-you{display:block;font-size:11px;color:#9aa3ad;margin-bottom:3px}" +
      "#mcbw .mcbw-form{display:flex;gap:6px;margin-top:10px;align-items:center;border:1.5px solid #e1e5ea;border-radius:22px;padding:4px 4px 4px 13px}" +
      "#mcbw .mcbw-input{flex:1;border:none;outline:none;font-size:14px;background:none;color:#1d2127}" +
      "#mcbw .mcbw-mic,#mcbw .mcbw-send{width:34px;height:34px;flex:0 0 auto;border-radius:50%;border:none;cursor:pointer;display:grid;place-items:center}" +
      "#mcbw .mcbw-mic{background:#fff;border:1.5px solid #e1e5ea;color:#14171c}" +
      "#mcbw .mcbw-mic.on{background:" + accent + ";color:#fff;border-color:" + accent + "}" +
      "#mcbw .mcbw-send{background:" + accent + ";color:#fff}" +
      "#mcbw .mcbw-cta{display:block;text-align:center;margin-top:9px;background:#14171c;color:#fff;text-decoration:none;font-weight:700;font-size:13px;padding:9px;border-radius:12px}" +
      "#mcbw .mcbw-badge{display:block;text-align:center;margin-top:8px;font-size:10px;color:#9aa3ad;text-decoration:none}" +
      "#mcbw .mcbw-badge b{color:#6b7280}" +
      "@media (max-width:560px){#mcbw .mcbw-panel{width:80vw}}";
    document.head.appendChild(css);

    var root = el("div", { id: "mcbw" });
    var hint = cfg.greet ? "" : '<span class="mcbw-hint">Hi! Need a hand?</span>';
    root.innerHTML =
      hint +
      '<div class="mcbw-panel" role="dialog" aria-label="Chat">' +
      '  <div class="mcbw-top">' +
      '    <img class="mcbw-av" src="' + img + '" alt="">' +
      '    <div><div class="mcbw-name">' + esc(cfg.business || "Assistant") + '</div><div class="mcbw-sub">● Online</div></div>' +
      '    <button class="mcbw-mute" title="Mute voice">&#128266;</button>' +
      '    <button class="mcbw-x" aria-label="Close">&times;</button>' +
      '  </div>' +
      '  <div class="mcbw-say" id="mcbw-say"><span class="mcbw-you" id="mcbw-you"></span><span id="mcbw-txt">…</span></div>' +
      (cfg.ctaUrl ? '  <a class="mcbw-cta" href="' + attr(cfg.ctaUrl) + '" target="_blank" rel="noopener">' + esc(ctaLabel()) + '</a>' : '') +
      '  <form class="mcbw-form" id="mcbw-form" autocomplete="off">' +
      '    <input class="mcbw-input" id="mcbw-input" placeholder="Type your message…" aria-label="Message">' +
      '    <button type="button" class="mcbw-mic" id="mcbw-mic" aria-label="Speak"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3z" fill="currentColor"/><path d="M19 11a7 7 0 0 1-14 0M12 18v3" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg></button>' +
      '    <button type="submit" class="mcbw-send" aria-label="Send"><svg viewBox="0 0 24 24" width="17" height="17"><path d="M3 11.5 21 3l-8.5 18-2.2-7.3z" fill="currentColor"/></svg></button>' +
      '  </form>' +
      (cfg.badge ? '  <a class="mcbw-badge" href="https://www.mascotchatbot.com" target="_blank" rel="noopener">Powered by <b>mascotchatbot.com</b></a>' : '') +
      '</div>' +
      '<button class="mcbw-btn" aria-label="Chat with us"><img src="' + img + '" alt=""></button>';
    document.body.appendChild(root);

    var btn = root.querySelector(".mcbw-btn");
    var panel = root.querySelector(".mcbw-panel");
    var form = root.querySelector("#mcbw-form");
    var input = root.querySelector("#mcbw-input");
    var mic = root.querySelector("#mcbw-mic");
    var mute = root.querySelector(".mcbw-mute");
    var xbtn = root.querySelector(".mcbw-x");

    btn.addEventListener("click", function () { root.classList.contains("mcbw-open") ? close() : openPanel(); });
    xbtn.addEventListener("click", close);
    form.addEventListener("submit", function (e) { e.preventDefault(); var v = input.value.trim(); if (v) { input.value = ""; send(v); } });
    mic.addEventListener("click", toggleMic);
    mute.addEventListener("click", function () { muted = !muted; mute.innerHTML = muted ? "&#128263;" : "&#128266;"; if (muted) stopAudio(); });

    function openPanel() {
      root.classList.add("mcbw-open");
      var h = root.querySelector(".mcbw-hint"); if (h) h.style.display = "none";
      if (!started) { started = true; greet(); }
      setTimeout(function () { input.focus(); }, 200);
    }
    function close() { root.classList.remove("mcbw-open"); stopAudio(); }

    if (cfg.greet) setTimeout(openPanel, 1400);

    function greet() {
      var name = cfg.business || "us";
      var line = "Hi there! 👋 I'm " + name + "'s assistant — ask me anything, or I can help you " + (cfg.cta || "get in touch") + ".";
      setSay("", line); history.push({ role: "assistant", content: line }); speak(line);
    }
    function setSay(you, txt) {
      root.querySelector("#mcbw-you").textContent = you ? "You: " + you : "";
      root.querySelector("#mcbw-txt").textContent = txt;
    }
    function send(text) {
      setSay(text, "…"); history.push({ role: "user", content: text });
      api("/api/chat", { botId: botId, messages: history })
        .then(function (r) { return r.json(); })
        .then(function (d) { var reply = (d && d.reply) ? String(d.reply) : "Sorry, try that again?"; history.push({ role: "assistant", content: reply }); setSay(text, reply); speak(reply); })
        .catch(function () { setSay(text, "Hmm, I had trouble connecting — try again in a sec."); });
    }
    function speak(text) {
      if (muted) return;
      stopAudio();
      api("/api/tts", { botId: botId, text: text })
        .then(function (r) { return r.status === 200 ? r.arrayBuffer() : null; })
        .then(function (buf) { if (!buf || buf.byteLength < 200) return; var url = URL.createObjectURL(new Blob([buf], { type: "audio/mpeg" })); curAudio = new Audio(url); curAudio.play().catch(function () {}); })
        .catch(function () {});
    }
    function stopAudio() { if (curAudio) { try { curAudio.pause(); } catch (e) {} curAudio = null; } }
    function toggleMic() {
      var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) { setSay("", "Voice input isn't supported in this browser — just type to me!"); return; }
      if (listening && recog) { try { recog.stop(); } catch (e) {} return; }
      recog = new SR(); recog.lang = "en-US"; recog.interimResults = false;
      recog.onstart = function () { listening = true; mic.classList.add("on"); };
      recog.onresult = function (e) { var t = e.results[0][0].transcript; if (t) send(t); };
      recog.onerror = function () { listening = false; mic.classList.remove("on"); };
      recog.onend = function () { listening = false; mic.classList.remove("on"); };
      try { recog.start(); } catch (e) {}
    }
  }

  function ctaLabel() {
    var c = (cfg.cta || "get in touch");
    return c.charAt(0).toUpperCase() + c.slice(1);
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function attr(s) { return esc(s).replace(/'/g, "&#39;"); }
})();
