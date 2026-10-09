import Link from "next/link";
import type { Metadata } from "next";
import { getProducts } from "@/lib/products";
import ShopHeader from "@/components/shop/ShopHeader";
import AnimatedProductGrid from "@/components/shop/AnimatedProductGrid";
import ProductListTracker from "@/components/analytics/ProductListTracker";
import type { Product as ProductType } from "@/types/product";

export const dynamic = "force-dynamic";

const CATEGORY_META: Record<string, { title: string; description: string }> = {
  men: {
    title: "Men's Fragrances",
    description:
      "Explore Khayal's men's collection — bold oud, musk, and woody niche fragrances crafted in Karachi.",
  },
  women: {
    title: "Women's Fragrances",
    description:
      "Explore Khayal's women's collection — floral, musk, and elegant niche fragrances crafted in Karachi.",
  },
  unisex: {
    title: "Unisex Fragrances",
    description:
      "Explore Khayal's unisex collection — oud, musk, woody, and fresh niche fragrances for everyone.",
  },
};

function capitalizeTag(tag: string): string {
  return tag.replace(/\b\w/g, (c) => c.toUpperCase());
}

function productKeywords(product: ProductType): string[] {
  const keywordMeta = product.metafields.find(
    (m) => m.namespace === "custom" && m.key === "keywords"
  )?.value;
  const metaKeywords = keywordMeta
    ? keywordMeta.split(",").map((k) => k.trim().toLowerCase())
    : [];
  return [...product.tags.map((t) => t.toLowerCase()), ...metaKeywords];
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; tag?: string }>;
}): Promise<Metadata> {
  const { category, tag } = await searchParams;
  const key = (category || "").toLowerCase();
  const activeTag = (tag || "").toLowerCase().trim();

  if (activeTag) {
    const label = capitalizeTag(activeTag);
    return {
      title: `${label} Perfumes`,
      description: `Explore Khayal's ${activeTag} fragrances — long-lasting niche perfumes crafted in Karachi and delivered across Pakistan.`,
      alternates: { canonical: `/shop?tag=${encodeURIComponent(activeTag)}` },
    };
  }

  const meta = CATEGORY_META[key] || {
    title: "The Collection",
    description:
      "Explore Khayal's luxury niche perfume collection — oud, musk, floral, woody, and fresh unisex fragrances.",
  };
  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: key && CATEGORY_META[key] ? `/shop/${key}` : "/shop",
    },
  };
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; tag?: string }>;
}) {
  const { category, tag } = await searchParams;
  const activeCategory = (category || "").toLowerCase();
  const activeTag = (tag || "").toLowerCase().trim();

  const products = await getProducts();
  const filtered = activeTag
    ? products.filter((p) => productKeywords(p).includes(activeTag))
    : CATEGORY_META[activeCategory]
      ? products.filter(
          (p) => p.productType?.toLowerCase() === activeCategory
        )
      : products;

  const heading = activeTag
    ? `${capitalizeTag(activeTag)} Fragrances`
    : CATEGORY_META[activeCategory]?.title || "The Collection";

  const allTags = [
    ...new Set(
      products.flatMap((p) => p.tags.map((t) => t.toLowerCase().trim())).filter(Boolean)
    ),
  ].slice(0, 12);

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: heading,
    itemListElement: filtered.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `https://www.khayalparfum.com/shop/${p.handle}`,
      name: p.title,
    })),
  };

  return (
    <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-cream">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <ProductListTracker products={filtered} listName={heading} />
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
        <ShopHeader
          title={heading}
          intro="Every Khayal fragrance is a composition of rare ingredients, slow craft, and imagination."
          count={filtered.length}
          activeCategory={activeTag ? "none" : CATEGORY_META[activeCategory] ? activeCategory : ""}
          tags={allTags.map((t) => ({ label: capitalizeTag(t), href: `/shop?tag=${encodeURIComponent(t)}`, active: t === activeTag }))}
        />

        {filtered.length > 0 ? (
          <AnimatedProductGrid key={`${activeCategory}|${activeTag}`} products={filtered} />
        ) : (
          <p className="mt-10 text-stone">
            No fragrances {activeTag ? `for "${activeTag}"` : "in this category"} yet.{" "}
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
