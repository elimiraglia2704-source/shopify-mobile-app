import "@shopify/polaris/build/esm/styles.css";
import "./globals.css";
import { Inter } from "next/font/google";
import BottomNav from "./components/BottomNav";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "Shopify Mobile App",
  description: "Embedded Shopify app with premium UI",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} font-sans`}>
      <head />
      <body style={{ background: '#050008', margin: 0, padding: 0 }}>
        <div className="app-shell" style={{ maxWidth: '400px', margin: '0 auto', height: '100vh', position: 'relative', overflow: 'hidden' }}>
          <div className="app-bg-pattern" />
          <main style={{ flex: 1, height: '100%', overflowY: 'auto', paddingBottom: '96px', position: 'relative', zIndex: 1 }}>
            {children}
          </main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
