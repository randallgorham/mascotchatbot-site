"use client";

// Minimal, privacy-first cookie/consent banner. Remembers the choice locally and
// only loads once. Declining is the default-safe path (nothing extra is set).
import { useEffect, useState } from "react";

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try { if (!localStorage.getItem("mcb_consent")) setShow(true); } catch { /* ignore */ }
  }, []);
  function choose(v: "accept" | "decline") {
    try { localStorage.setItem("mcb_consent", v); } catch { /* ignore */ }
    setShow(false);
  }
  if (!show) return null;
  return (
    <div style={{ position: "fixed", left: 16, right: 16, bottom: 16, zIndex: 70, maxWidth: 520, margin: "0 auto", background: "#14171c", color: "#fff", borderRadius: 16, padding: "14px 16px", boxShadow: "0 10px 30px rgba(0,0,0,.3)", fontFamily: "ui-sans-serif,system-ui,Arial,sans-serif" }}>
      <div style={{ fontSize: 13.5, lineHeight: 1.5 }}>
        We use essential cookies to run the site and optional analytics to improve it. See our{" "}
        <a href="/privacy" style={{ color: "#2bc4e6", textDecoration: "underline" }}>privacy policy</a>.
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 10, justifyContent: "flex-end" }}>
        <button onClick={() => choose("decline")} style={{ border: "1px solid #ffffff55", background: "transparent", color: "#fff", borderRadius: 999, padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Decline</button>
        <button onClick={() => choose("accept")} style={{ border: "none", background: "#2bc4e6", color: "#06222a", borderRadius: 999, padding: "7px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Accept</button>
      </div>
    </div>
  );
}
