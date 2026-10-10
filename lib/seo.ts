import type { Metadata } from "next";

export const defaultMetadata: Metadata = {
  metadataBase: new URL("https://www.khayalparfum.com"),
  title: {
    template: "%s · KHAYAL",
    default: "KHAYAL: Long-Lasting Perfumes for Men & Women in Pakistan",
  },
  description:
    "Long-lasting extraits de parfum for men and women, crafted in Karachi. Tester in every order, cash on delivery and nationwide delivery across Pakistan.",
  keywords: [
    "khayal fragrance",
    "luxury perfume online pakistan",
    "niche fragrance brand",
    "oud perfume online pakistan",
    "perfume for men pakistan",
    "perfume for women pakistan",
    "unisex perfume",
    "long lasting perfume",
    "premium extrait de parfum",
    "buy perfume online pakistan",
  ],
  openGraph: {
    type: "website",
    locale: "en_PK",
    siteName: "Khayal Fragrance",
    title: "KHAYAL: Long-Lasting Perfumes for Men & Women",
    description:
      "Some fragrances become memories. Extraits de parfum crafted in Karachi, delivered across Pakistan.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "KHAYAL perfumes" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "KHAYAL: Long-Lasting Perfumes for Men & Women",
    description:
      "Long-lasting extraits de parfum for men and women, crafted in Karachi and delivered across Pakistan.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: { canonical: "./" },
  verification: {
    google: "google4063a7c75f45c663",
    other: {
      "p:domain_verify": "720950dae548dcf3e4efbce7521ab609",
    },
  },
};

export function productMetadata({
  title,
  description,
  image,
  handle,
  metaTitle,
  metaDescription,
  focusKeyword,
  keywords,
  ogImage,
  canonicalUrl,
  noIndex,
}: {
  title: string;
  description: string;
  image: string;
  handle: string;
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  keywords?: string[];
  ogImage?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
}): Metadata {
  const url = `https://www.khayalparfum.com/shop/${handle}`;
  const resolvedDescription = metaDescription || description;
  const truncated =
    resolvedDescription.length > 160
      ? `${resolvedDescription.slice(0, 157)}...`
      : resolvedDescription;
  const allKeywords = [focusKeyword, ...(keywords || [])].filter(
    (k): k is string => Boolean(k)
  );
  return {
    // Absolute so the layout template doesn't append the brand a second time.
    title: { absolute: metaTitle || `${title} Extrait de Parfum · KHAYAL` },
    description: truncated,
    keywords: allKeywords.length ? allKeywords : undefined,
    openGraph: {
      title: metaTitle || title,
      description: truncated,
      images: [{ url: ogImage || image, width: 1200, height: 630 }],
    },
    robots: noIndex ? { index: false, follow: true } : undefined,
    alternates: { canonical: canonicalUrl || url },
  };
}
