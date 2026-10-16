import type { Metadata } from "next";
import Link from "next/link";
import { getProducts } from "@/lib/products";
import DuoBuilder from "@/components/shop/DuoBuilder";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import { DUOS, DUO_SAVING } from "@/lib/bundles";
import { siteConfig } from "@/lib/site-config";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

const description = `Any two KHAYAL extraits de parfum, save ${formatPrice(DUO_SAVING, "PKR")}. Ready-made pairs or build your own. Free delivery, a tester in every order, cash on delivery across Pakistan.`;

export const metadata: Metadata = {
  title: "Perfume Gift Sets and Duos in Pakistan",
  description,
  openGraph: { title: "Perfume Duos · KHAYAL", description, url: `${siteConfig.url}/shop/duos` },
  alternates: { canonical: `${siteConfig.url}/shop/duos` },
};

const NAV = [
  { label: "All", href: "/shop" },
  { label: "Men", href: "/shop/men" },
  { label: "Women", href: "/shop/women" },
  { label: "Unisex", href: "/shop/unisex" },
  { label: "Duos", href: "/shop/duos" },
];

export default async function DuosPage() {
  const products = await getProducts();

  return (
    <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-cream">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: siteConfig.url },
          { name: "Shop", url: `${siteConfig.url}/shop` },
          { name: "Duos", url: `${siteConfig.url}/shop/duos` },
        ]}
      />
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
        <p className="text-[11px] uppercase tracking-[0.24em] text-gold">The Duo offer</p>
        <h1 className="mt-2 font-serif-display text-ink text-[44px] md:text-[64px] font-normal leading-[1.02]">
          Any two, save {formatPrice(DUO_SAVING, "PKR")}
        </h1>
        <p className="mt-3 max-w-2xl text-stone text-base">
          One for the day and one for the evening, or one for each of you. Two bottles also means free delivery
          anywhere in Pakistan, and every order comes with a tester.
        </p>

        <nav aria-label="Filter by category" className="mt-8 flex flex-wrap gap-2">
          {NAV.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              aria-current={c.href === "/shop/duos" ? "page" : undefined}
              className={[
                "min-h-[44px] inline-flex items-center px-5 text-[11px] uppercase tracking-[0.2em] border transition-colors duration-300",
                c.href === "/shop/duos"
                  ? "bg-ink text-cream border-ink"
                  : "bg-transparent text-stone border-border hover:border-ink hover:text-ink",
              ].join(" ")}
            >
              {c.label}
            </Link>
          ))}
        </nav>

        <DuoBuilder duos={DUOS} products={products} />

        <p className="mt-12 max-w-2xl text-xs text-stone">
          The saving applies to every two bottles in one order. It doesn&apos;t combine with discount codes: your bag
          uses whichever saving is bigger.
        </p>
      </div>
    </section>
  );
}
