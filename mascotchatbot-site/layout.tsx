import type { Metadata } from "next";
import "./globals.css";
import MrAmp from "@/components/MrAmp";

export const metadata: Metadata = {
  title: "MascotChatbot — Your brand, talking.",
  description:
    "We build animated talking mascots for your website. They answer questions, capture leads, and book appointments — 24/7. Done for you and hosted.",
  openGraph: {
    title: "MascotChatbot — Your brand, talking.",
    description:
      "Animated mascot chatbots that talk to your visitors, capture leads, and book appointments. Done for you.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}<MrAmp /></body>
    </html>
  );
}
