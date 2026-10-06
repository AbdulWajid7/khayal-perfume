import { dbConnect, toJSON } from "@/lib/mongoose";
import { Product, type IProduct } from "@/models/Product";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = siteConfig.url;

  let products: IProduct[] = [];
  try {
    await dbConnect();
    products = (toJSON(await Product.find({ status: "active" }).lean()) || []) as IProduct[];
  } catch (error) {
    console.error("llms.txt generation error:", error);
  }

  const productLines = products
    .map((p) => `- ${p.title}: ${baseUrl}/shop/${p.handle}`)
    .join("\n");

  const body = `# Khayal Fragrance

> Khayal Fragrance is a luxury niche fragrance house crafting oud, musk, and attar
> eau de parfum in Karachi, Pakistan. Premium perfumes delivered nationwide.

## Company

- Name: Khayal Fragrance (KHAYAL)
- Website: ${baseUrl}
- Email: ${siteConfig.email}
- WhatsApp: ${siteConfig.phoneDisplay}
- Currency: PKR
- Free delivery across Pakistan on orders of PKR ${siteConfig.freeShippingThreshold.toLocaleString("en-PK")} or more
- Delivery: Karachi within 24 hours; rest of Pakistan 3-4 working days
- Every order includes a separate tester so customers can try the scent
  without opening the sealed full-size bottle
- Social: ${siteConfig.social.instagram} | ${siteConfig.social.facebook} | ${siteConfig.social.tiktok}

## Key Pages

- Shop / Collection: ${baseUrl}/shop
- Men's Fragrances: ${baseUrl}/shop/men
- Women's Fragrances: ${baseUrl}/shop/women
- Unisex Fragrances: ${baseUrl}/shop/unisex
- Journal (fragrance guides): ${baseUrl}/journal
- Our Story: ${baseUrl}/story
- Scent Finder (quiz): ${baseUrl}/scent-finder
- Shipping & Returns: ${baseUrl}/shipping
- FAQ: ${baseUrl}/faq
- Track Order: ${baseUrl}/track-order

## Products
${productLines || "- Catalog unavailable"}

## Feeds & Discovery

- Sitemap: ${baseUrl}/sitemap.xml
- Product feed (Google Merchant): ${baseUrl}/feed.xml

## Returns Policy

If the fragrance is unsuitable, contact KHAYAL on the same day of delivery.
The full-size bottle must remain unopened, unused, and in original sealed
packaging. Damaged or incorrect items must be reported within 24 hours with
photos or an unboxing video.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
