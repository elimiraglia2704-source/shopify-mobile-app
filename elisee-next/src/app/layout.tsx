import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Elisee Shop",
  description: "Il tuo store ufficiale",
  manifest: "/manifest.json",
  themeColor: "#0f0f0f",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Elisee",
  },
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
        <Navigation />
      </body>
    </html>
  );
}
