import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { defaultMetadata } from "@/lib/seo";
import { CartProvider } from "@/hooks/useCart";
import LoadIntro from "@/components/ui/LoadIntro";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased bg-midnight text-parchment">
        <LoadIntro />
        <CartProvider>{children}</CartProvider>
        <Analytics />
      </body>
    </html>
  );
}
