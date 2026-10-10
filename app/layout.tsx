import type { Metadata } from "next";
import { Suspense } from "react";
import { Bodoni_Moda, Jost, Noto_Nastaliq_Urdu } from "next/font/google";
import { defaultMetadata } from "@/lib/seo";
import { CartProvider } from "@/hooks/useCart";
import LoadIntro from "@/components/ui/LoadIntro";
import AnalyticsProvider from "@/components/analytics/AnalyticsProvider";
import { ConsentProvider } from "@/components/analytics/ConsentProvider";
import ConsentBanner from "@/components/ui/ConsentBanner";
import { siteConfig } from "@/lib/site-config";
import "./globals.css";

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  preload: true,
});

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-display",
  display: "swap",
  preload: true,
});

const urdu = Noto_Nastaliq_Urdu({
  subsets: ["arabic"],
  weight: ["500"],
  variable: "--font-urdu",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jost.variable} ${bodoni.variable} ${urdu.variable}`}>
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
        <ConsentProvider>
          <Suspense fallback={null}>
            <AnalyticsProvider />
          </Suspense>
          <LoadIntro />
          <CartProvider>{children}</CartProvider>
          <ConsentBanner />
        </ConsentProvider>
      </body>
    </html>
  );
}
