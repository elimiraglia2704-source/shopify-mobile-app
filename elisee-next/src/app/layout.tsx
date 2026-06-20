import type { Metadata, Viewport } from "next";
import React from "react";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Header from "@/components/Header";
import GlobalOverlays from "@/components/GlobalOverlays";

export const metadata: Metadata = {
  title: "Elisee Shop",
  description: "Il tuo store ufficiale Elisee — Abbigliamento premium.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Elisee",
  },
};

// themeColor va ora esportato come `viewport` (Next.js 16+)
export const viewport: Viewport = {
  themeColor: "#0f0f0f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className="app-shell">
        <div className="app-bg-pattern"></div>
        <Header />
        <main className="app-main">
          <div className="screen active pb-24">
            {children}
          </div>
        </main>
        <GlobalOverlays />
        <Navigation />
      </body>
    </html>
  );
}
