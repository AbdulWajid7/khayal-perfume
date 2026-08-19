import type { Metadata } from "next";

export const defaultMetadata: Metadata = {
  metadataBase: new URL("https://khayal.com"),
  title: {
    template: "%s | Khayal — Luxury Perfumes",
    default: "Khayal — Luxury Niche Perfumes & Attars",
  },
  description:
    "Discover Khayal, a luxury niche perfume house crafting unforgettable fragrances with oud, musk, and rare botanicals. Shop online for premium attars and eau de parfums.",
  keywords: [
    "luxury perfume",
    "niche fragrance",
    "oud perfume",
    "attar online",
    "unisex perfume",
    "premium scent",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Khayal",
  },
  twitter: { card: "summary_large_image" },
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
};

export function productMetadata({
  title,
  description,
  image,
  handle,
}: {
  title: string;
  description: string;
  image: string;
  handle: string;
}): Metadata {
  const url = `https://khayal.com/shop/${handle}`;
  return {
    title: `${title} | Khayal Perfumes`,
    description: description.length > 160 ? `${description.slice(0, 157)}...` : description,
    openGraph: {
      images: [{ url: image, width: 1200, height: 630 }],
    },
    alternates: { canonical: url },
  };
}
