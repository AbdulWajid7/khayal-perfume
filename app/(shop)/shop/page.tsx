import Link from "next/link";
import type { Metadata } from "next";
import { getProducts } from "@/lib/products";
import ProductCard from "@/components/ui/ProductCard";
import ProductListTracker from "@/components/analytics/ProductListTracker";
import type { Product as ProductType } from "@/types/product";

export const dynamic = "force-dynamic";

const CATEGORIES = [
  { label: "All", value: "" },
  { label: "Men", value: "men" },
  { label: "Women", value: "women" },
  { label: "Unisex", value: "unisex" },
] as const;

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
      description: `KHAYAL ${activeTag} perfumes: long-lasting eau de parfums crafted in Karachi and delivered across Pakistan.`,
      // Filtered views duplicate /shop, so keep them out of the index and point Google at the full collection.
      robots: { index: false, follow: true },
      alternates: { canonical: "/shop" },
    };
  }

  const meta = CATEGORY_META[key] || {
    title: "Shop Perfumes for Men, Women & Unisex",
    description:
      "Shop KHAYAL eau de parfums for men, women and unisex: fresh, floral, woody and oud scents. Tester in every order, cash on delivery across Pakistan.",
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
        <h1 className="font-serif-display text-ink text-[40px] font-medium tracking-tight">
          {heading}
        </h1>
        <p className="mt-2 text-stone text-base max-w-2xl">
          Every Khayal fragrance is a composition of rare ingredients, slow craft, and
          imagination.
        </p>

        <nav aria-label="Filter by category" className="mt-8 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => {
            const isActive = c.value === activeCategory || (!activeCategory && !c.value);
            return (
              <Link
                key={c.value || "all"}
                href={c.value ? `/shop/${c.value}` : "/shop"}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "px-4 py-2 rounded-full text-[11px] uppercase tracking-[0.18em] border transition-colors duration-300",
                  isActive
                    ? "bg-ink text-pure border-ink"
                    : "bg-transparent text-stone border-border hover:border-gold hover:text-ink",
                ].join(" ")}
              >
                {c.label}
              </Link>
            );
          })}
        </nav>

        {allTags.length > 0 && (
          <nav aria-label="Browse by scent" className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="text-[10px] uppercase tracking-[0.18em] text-stone-light">Scents:</span>
            {allTags.map((t) => (
              <Link
                key={t}
                href={`/shop?tag=${encodeURIComponent(t)}`}
                className={[
                  "text-[11px] uppercase tracking-[0.14em] transition-colors duration-300",
                  t === activeTag ? "text-gold" : "text-stone hover:text-gold",
                ].join(" ")}
              >
                {capitalizeTag(t)}
              </Link>
            ))}
          </nav>
        )}

        <h2 className="sr-only">Fragrances</h2>
        {filtered.length > 0 ? (
          <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
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
