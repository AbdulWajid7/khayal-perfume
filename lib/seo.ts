import type { Metadata } from "next";

export const defaultMetadata: Metadata = {
  metadataBase: new URL("https://www.khayalparfum.com"),
  title: {
    template: "%s | Khayal Parfum — Luxury Perfumes & Attars",
    default:
      "Khayal Parfum — Buy Luxury Oud, Musk & Attar Perfumes Online in Pakistan",
  },
  description:
    "Some fragrances become memories. Khayal Parfum crafts premium perfumes and attars in Karachi — long-lasting oud, musk, and rose compositions delivered nationwide across Pakistan.",
  keywords: [
    "khayal parfum",
    "luxury perfume online pakistan",
    "niche fragrance brand",
    "oud perfume online pakistan",
    "attar perfume online pakistan",
    "unisex perfume",
    "long lasting perfume",
    "premium eau de parfum",
    "buy perfume online pakistan",
  ],
  openGraph: {
    type: "website",
    locale: "en_PK",
    siteName: "Khayal Parfum",
    title: "Khayal Parfum — Luxury Oud, Musk & Attar Perfumes",
    description:
      "Some fragrances become memories. Premium perfumes and attars crafted in Karachi, delivered across Pakistan.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Khayal Parfum — Luxury Perfumes" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Khayal Parfum — Luxury Oud, Musk & Attar Perfumes",
    description:
      "Discover Khayal Parfum's collection of long-lasting oud, musk, and attar eau de parfums.",
    images: ["/og-image.jpg"],
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
  },
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
  const url = `https://www.khayalparfum.com/shop/${handle}`;
  return {
    title: `${title} | Khayal Perfumes`,
    description: description.length > 160 ? `${description.slice(0, 157)}...` : description,
    openGraph: {
      images: [{ url: image, width: 1200, height: 630 }],
    },
    alternates: { canonical: url },
  };
}
