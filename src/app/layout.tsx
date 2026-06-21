import "@shopify/polaris/build/esm/styles.css";
import "./globals.css";
import { Inter } from "next/font/google";
import BottomNav from "./components/BottomNav";
import FloatingButtons from "./components/FloatingButtons";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "Shopify Mobile App",
  description: "Embedded Shopify app with premium UI",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
};

export const viewport = {
  themeColor: "#0a0010",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} font-sans`}>
      <head />
      <body style={{ background: '#050008', margin: 0, padding: 0 }}>
        <div className="app-shell" style={{ width: '100%', height: '100dvh', position: 'relative', overflow: 'hidden' }}>
          <div className="app-bg-pattern" />
          <main style={{ flex: 1, height: '100%', overflowY: 'auto', paddingBottom: '96px', position: 'relative' }}>
            {children}
          </main>
          <div id="drawer-root" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 99999 }} />
          <FloatingButtons />
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
