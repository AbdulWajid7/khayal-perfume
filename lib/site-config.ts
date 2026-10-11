export const siteConfig = {
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.khayalparfum.com",
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923202704617",
  phoneDisplay: "+92 320 2704617",
  email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "official@khayalparfum.com",
  currency: "PKR",
  freeShippingThreshold: Number(process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD || 5000),
  analytics: {
    ga4Id: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || "G-FTPHVPR128",
    gtmId: process.env.NEXT_PUBLIC_GTM_ID || "GTM-MCGCTF27",
    metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || "1799327554592941",
    clarityProjectId: process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || "ykfeupmawo",
  },
  social: {
    instagram: "https://www.instagram.com/khayalfragranceofficial/",
    facebook: "https://www.facebook.com/share/1Kmv75SYta/",
    tiktok: "https://www.tiktok.com/@khayal..parfum",
  },
  business: {
    name: "Khayal Fragrance",
    locality: "Karachi",
    region: "Sindh",
    country: "PK",
    areaServed: "Pakistan",
    languages: ["en", "ur"],
  },
} as const;

export function getWhatsAppUrl(message: string): string {
  return `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
