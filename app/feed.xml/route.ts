import { dbConnect, toJSON } from "@/lib/mongoose";
import { Product, type IProduct } from "@/models/Product";

export const dynamic = "force-dynamic";

const BASE_URL = "https://www.khayalparfum.com";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function absoluteUrl(url: string): string {
  return url.startsWith("http") ? url : `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

export async function GET() {
  let products: IProduct[] = [];
  try {
    await dbConnect();
    products = (toJSON(await Product.find({ status: "active" }).lean()) || []) as IProduct[];
  } catch (error) {
    console.error("Merchant feed error:", error);
  }

  const items = products
    .map((p) => {
      const variants = p.variants?.length
        ? p.variants
        : [
            {
              id: p.handle,
              title: p.title,
              price: p.price,
              compareAtPrice: p.compareAtPrice,
              sku: p.sku,
              stock: p.stock,
              availableForSale: p.stock > 0,
            },
          ];

      return variants
        .map((v) => {
          const link = `${BASE_URL}/shop/${p.handle}`;
          const image = p.images?.[0] ? absoluteUrl(p.images[0]) : "";
          const additional = (p.images || [])
            .slice(1, 10)
            .map((img) => `      <g:additional_image_link>${escapeXml(absoluteUrl(img))}</g:additional_image_link>`)
            .join("\n");
          const description = escapeXml(
            (p.metaDescription || p.description || p.title).slice(0, 5000)
          );

          return `    <item>
      <g:id>${escapeXml(v.sku || v.id || p.handle)}</g:id>
      <title>${escapeXml(p.title)}</title>
      <g:description>${description}</g:description>
      <link>${link}</link>
      ${image ? `<g:image_link>${escapeXml(image)}</g:image_link>` : ""}
      ${additional}
      <g:availability>${v.availableForSale && (v.stock ?? 1) > 0 ? "in stock" : "out of stock"}</g:availability>
      <g:price>${v.price.toFixed(2)} PKR</g:price>
      ${v.compareAtPrice && v.compareAtPrice > v.price ? `<g:sale_price>${v.price.toFixed(2)} PKR</g:sale_price>` : ""}
      <g:brand>Khayal</g:brand>
      <g:condition>new</g:condition>
      ${p.mpn ? `<g:mpn>${escapeXml(p.mpn)}</g:mpn>` : ""}
      <g:google_product_category>Health &amp; Beauty &gt; Personal Care &gt; Cosmetics &gt; Fragrance</g:google_product_category>
      <g:shipping>
        <g:country>PK</g:country>
        <g:price>0 PKR</g:price>
      </g:shipping>
      ${p.category ? `<g:product_type>${escapeXml(p.category)}</g:product_type>` : ""}
    </item>`;
        })
        .join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Khayal Fragrance</title>
    <link>${BASE_URL}</link>
    <description>Luxury oud, musk, and attar perfumes crafted in Karachi, Pakistan.</description>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
