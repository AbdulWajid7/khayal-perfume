export const siteConfig = {
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://www.khayalparfum.com",
  /** The team's number: owner order alerts, phone calls, help with an existing order. */
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923202704617",
  phoneDisplay: "+92 320 2704617",
  /** The WhatsApp order assistant: customers choose a scent and order without waiting for a person. */
  orderBotNumber: process.env.NEXT_PUBLIC_WHATSAPP_ORDER_NUMBER || "923043190718",
  orderBotDisplay: "+92 304 3190718",
  email: process.env.NEXT_PUBLIC_BUSINESS_EMAIL || "official@khayalparfum.com",
  currency: "PKR",
  freeShippingThreshold: Number(process.env.NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD || 5000),
  analytics: {
    ga4Id: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || "G-FTPHVPR128",
    gtmId: process.env.NEXT_PUBLIC_GTM_ID || "GTM-MCGCTF27",
    metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || "1376042894320095",
    clarityProjectId: process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || "ykfeupmawo",
  },
  social: {
    instagram: "https://www.instagram.com/khayalfragranceofficial/",
    facebook: "https://www.facebook.com/1244547532083670",
    tiktok: "https://www.tiktok.com/@khayalfregnance",
    pinterest: "https://www.pinterest.com/khayalfregnance/",
    // Threads usernames always match the Instagram username.
    threads: "https://www.threads.com/@khayalfragranceofficial",
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

/**
 * WhatsApp chat link. Shopping questions and orders go to the order assistant (default);
 * help with an order already placed goes to the team ("support").
 */
export function getWhatsAppUrl(message: string, to: "orders" | "support" = "orders"): string {
  const number = to === "support" ? siteConfig.whatsappNumber : siteConfig.orderBotNumber;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
