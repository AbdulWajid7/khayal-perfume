import Link from "next/link";
import { getProducts } from "@/lib/products";
import ShopHeader from "@/components/shop/ShopHeader";
import AnimatedProductGrid from "@/components/shop/AnimatedProductGrid";
import ProductListTracker from "@/components/analytics/ProductListTracker";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { siteConfig } from "@/lib/site-config";

export const CATEGORY_META: Record<string, { label: string; title: string; description: string; intro: string }> = {
  men: {
    label: "Men",
    title: "Men's Fragrances",
    description:
      "Explore Khayal's men's collection — bold oud, musk, and woody niche fragrances crafted in Karachi and delivered across Pakistan.",
    intro:
      "Bold oud, musk, and woody compositions — niche fragrances crafted in Karachi for the modern man.",
  },
  women: {
    label: "Women",
    title: "Women's Fragrances",
    description:
      "Explore Khayal's women's collection — floral, musk, and elegant niche fragrances crafted in Karachi and delivered across Pakistan.",
    intro:
      "Floral, musk, and elegant compositions — niche fragrances crafted in Karachi for the modern woman.",
  },
  unisex: {
    label: "Unisex",
    title: "Unisex Fragrances",
    description:
      "Explore Khayal's unisex collection — oud, musk, woody, and fresh niche fragrances for everyone, delivered across Pakistan.",
    intro:
      "Oud, musk, woody, and fresh compositions — niche fragrances crafted for everyone.",
  },
};

export default async function CategoryLanding({ category }: { category: "men" | "women" | "unisex" }) {
  const meta = CATEGORY_META[category];
  const products = await getProducts();
  const filtered = products.filter((p) => p.productType?.toLowerCase() === category);

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: meta.title,
    itemListElement: filtered.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${siteConfig.url}/shop/${p.handle}`,
      name: p.title,
    })),
  };

  return (
    <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-cream">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Shop", url: `${siteConfig.url}/shop` },
          { name: meta.title, url: `${siteConfig.url}/shop/${category}` },
        ]}
      />
      <ProductListTracker products={filtered} listName={meta.title} />
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
        <ShopHeader title={meta.title} intro={meta.intro} count={filtered.length} activeCategory={category} />

        {filtered.length > 0 ? (
          <AnimatedProductGrid key={category} products={filtered} />
        ) : (
          <p className="mt-10 text-stone">
            No fragrances in this category yet.{" "}
            <Link href="/shop" className="text-gold underline underline-offset-4">
              View the full collection
            </Link>
            .
          </p>
        )}
      </div>
    </section>
  );
}
