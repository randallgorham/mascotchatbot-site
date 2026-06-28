import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import BrandBot from "@/components/BrandBot";
import { CartProvider } from "@/components/CartProvider";
import RefCapture from "@/components/RefCapture";

export const metadata: Metadata = {
  metadataBase: new URL("https://mascotchatbot.com"),
  title: {
    default: "MascotChatbot — Animated AI mascots that talk to your visitors",
    template: "%s · MascotChatbot",
  },
  description:
    "We build a custom animated mascot for your website that greets visitors, answers their questions, and books jobs 24/7. Done for you. Hosted by us.",
  keywords: [
    "AI mascot",
    "website chatbot",
    "animated chatbot",
    "AI mascot for website",
    "AI receptionist",
    "lead capture chatbot",
    "talking mascot",
    "chatbot for small business",
    "AI chatbot for service business",
  ],
  authors: [{ name: "MascotChatbot" }],
  creator: "MascotChatbot",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "https://mascotchatbot.com",
    siteName: "MascotChatbot",
    title: "MascotChatbot — Your brand, talking.",
    description:
      "A custom animated mascot that lives on your site, talks to visitors, answers questions, and books the job 24/7.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "MascotChatbot — Your brand, talking." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MascotChatbot — Your brand, talking.",
    description:
      "A custom animated mascot that talks to your visitors, answers questions, and books jobs 24/7.",
    images: ["/og.png"],
  },
  icons: { icon: "/icon.svg", shortcut: "/icon.svg", apple: "/icon.svg" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="font-sans antialiased">
        {/* Google Analytics (GA4) */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-JX2ET1Q1HL" strategy="afterInteractive" />
        <Script id="ga4-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-JX2ET1Q1HL');`}
        </Script>
        <CartProvider>
          <RefCapture />
          {children}
          <BrandBot />
        </CartProvider>
      </body>
    </html>
  );
}
