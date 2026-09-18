import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter, Playfair_Display } from "next/font/google";
import { defaultMetadata } from "@/lib/seo";
import { CartProvider } from "@/hooks/useCart";
import LoadIntro from "@/components/ui/LoadIntro";
import AnalyticsProvider from "@/components/analytics/AnalyticsProvider";
import { siteConfig } from "@/lib/site-config";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
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
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased bg-cream text-ink">
        {process.env.NODE_ENV === "production" && siteConfig.analytics.gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${siteConfig.analytics.gtmId}`}
              height="0"
              width="0"
              className="hidden invisible"
              title="Google Tag Manager"
            />
          </noscript>
        )}
        <Suspense fallback={null}>
          <AnalyticsProvider />
        </Suspense>
        <LoadIntro />
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
