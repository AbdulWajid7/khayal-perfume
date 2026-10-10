import Link from "next/link";
import { getProducts } from "@/lib/products";
import ProductCard from "@/components/ui/ProductCard";
import ProductListTracker from "@/components/analytics/ProductListTracker";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { siteConfig } from "@/lib/site-config";

export const CATEGORY_META: Record<
  string,
  { label: string; title: string; metaTitle: string; description: string; intro: string; guide: string[] }
> = {
  men: {
    label: "Men",
    title: "Men's Perfumes",
    metaTitle: "Perfume for Men in Pakistan",
    description:
      "Long-lasting perfumes for men by KHAYAL: fresh, spicy, woody and warm eau de parfums. Tester in every order, cash on delivery across Pakistan.",
    intro:
      "Fresh, spicy, woody and warm eau de parfums for men, crafted in Karachi.",
    guide: [
      "For the office and everyday wear, choose a fresh scent such as THE GENTLEMAN or DARK ICE: citrus, clean woods and musk that stay close without overpowering a room.",
      "For evenings, weddings and winter, choose a warmer, bolder scent such as DASTAAN or VICTOR, built on spice, woods and amber.",
      "Every KHAYAL order comes with a separate tester, so you can try the scent before opening the full bottle. Pay cash on delivery, with delivery in Karachi within 24 hours and across Pakistan in 3–4 working days.",
    ],
  },
  women: {
    label: "Women",
    title: "Women's Perfumes",
    metaTitle: "Perfume for Women in Pakistan",
    description:
      "Long-lasting perfumes for women by KHAYAL: floral, fruity and warm eau de parfums. Tester in every order, cash on delivery across Pakistan.",
    intro:
      "Floral, fruity and warm eau de parfums for women, crafted in Karachi.",
    guide: [
      "For daytime, work and brunch, choose a light floral such as CHERIE, BAHAAR or CRYSTAL NOOR: soft flowers, fruit and clean musk.",
      "For weddings, mehndi and evenings out, choose SILK ROYALE, a warm floral with saffron, oud and vanilla that lasts through the night.",
      "Every KHAYAL order comes with a separate tester, so you can try the scent before opening the full bottle. Pay cash on delivery, with delivery in Karachi within 24 hours and across Pakistan in 3–4 working days.",
    ],
  },
  unisex: {
    label: "Unisex",
    title: "Unisex Perfumes",
    metaTitle: "Unisex Perfume in Pakistan",
    description:
      "Unisex perfumes by KHAYAL: oud, musk and warm woods made to be shared. Tester in every order, cash on delivery across Pakistan.",
    intro:
      "Oud, musk and warm woods, made to be shared by anyone.",
    guide: [
      "Unisex fragrances are built around notes that sit well on everyone, such as oud, musk, amber and soft woods. OUD MUSK is a smooth oud for people who find traditional oud too heavy.",
      "Two sprays are enough: one on the neck and one on the wrist. Warm scents last longest on clothing and fabric.",
      "Every KHAYAL order comes with a separate tester, so you can try the scent before opening the full bottle. Pay cash on delivery, with delivery in Karachi within 24 hours and across Pakistan in 3–4 working days.",
    ],
  },
};

const NAV_ITEMS = [
  { label: "All", href: "/shop", value: "" },
  { label: "Men", href: "/shop/men", value: "men" },
  { label: "Women", href: "/shop/women", value: "women" },
  { label: "Unisex", href: "/shop/unisex", value: "unisex" },
] as const;

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
        <h1 className="font-serif-display text-ink text-[40px] font-medium tracking-tight">
          {meta.title}
        </h1>
        <p className="mt-2 text-stone text-base max-w-2xl">{meta.intro}</p>

        <nav aria-label="Filter by category" className="mt-8 flex flex-wrap gap-2">
          {NAV_ITEMS.map((c) => {
            const isActive = c.value === category;
            return (
              <Link
                key={c.value || "all"}
                href={c.href}
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

        <h2 className="sr-only">{meta.title}</h2>
        {filtered.length > 0 ? (
          <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="mt-10 text-stone">
            No fragrances in this category yet.{" "}
            <Link href="/shop" className="text-gold underline underline-offset-4">
              View the full collection
            </Link>
            .
          </p>
        )}

        <div className="mt-16 max-w-3xl">
          <h2 className="font-serif-display text-ink text-2xl font-medium mb-4">
            How to choose {meta.label === "Unisex" ? "a unisex perfume" : `a perfume for ${meta.label.toLowerCase()}`}
          </h2>
          {meta.guide.map((paragraph) => (
            <p key={paragraph.slice(0, 24)} className="text-stone text-base leading-relaxed mb-4">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
