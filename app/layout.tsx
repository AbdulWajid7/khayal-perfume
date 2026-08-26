import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { defaultMetadata } from "@/lib/seo";
import { CartProvider } from "@/hooks/useCart";
import LoadIntro from "@/components/ui/LoadIntro";

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
        <LoadIntro />
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
