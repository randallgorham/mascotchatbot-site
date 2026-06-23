"use client";

import { useEffect } from "react";

// Captures a ?ref=<code> from any landing URL into a 60-day cookie, so the
// referral can be attributed when the visitor later creates an account.
export default function RefCapture() {
  useEffect(() => {
    try {
      const code = new URLSearchParams(window.location.search).get("ref");
      if (code && /^[a-z0-9]{4,16}$/i.test(code)) {
        document.cookie = "mcb_ref=" + encodeURIComponent(code) + "; path=/; max-age=5184000; samesite=lax";
      }
    } catch {
      /* no-op */
    }
  }, []);
  return null;
}
