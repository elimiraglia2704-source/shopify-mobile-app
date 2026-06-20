import "@shopify/polaris/build/esm/styles.css";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "Shopify Mobile App",
  description: "Embedded Shopify app with premium UI",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const shop = cookieStore.get("shopify_shop")?.value;
  const host = process.env.NEXT_PUBLIC_APP_URL ?? "";

  // AppProvider removed to avoid context errors in Next 16
  return (
    <html lang="en" className={`${inter.variable} font-sans`}>
      <head />
      <body>{children}</body>
    </html>
  );
}
