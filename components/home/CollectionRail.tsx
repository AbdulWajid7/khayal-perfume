"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { formatPrice } from "@/lib/utils";
import { getFragranceLine } from "@/lib/fragrance-copy";
import { productToAnalyticsItem, trackCommerce } from "@/lib/analytics";
import type { Product } from "@/types/product";

const TABS = ["All", "Men", "Women", "Unisex"] as const;
type Tab = (typeof TABS)[number];

export default function CollectionRail({ products }: { products: Product[] }) {
  const [tab, setTab] = useState<Tab>("All");
  const rail = useRef<HTMLDivElement>(null);

  const visible = useMemo(
    () => products.filter((p) => tab === "All" || (p.productType || "").toLowerCase() === tab.toLowerCase()),
    [products, tab],
  );

  function scroll(dir: 1 | -1) {
    const el = rail.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 640), behavior: "smooth" });
  }

  if (products.length === 0) return null;

  return (
    <section id="collection" className="bg-cream-dark py-24 md:py-28" aria-label="The collection">
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
        <Reveal className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">The collection</p>
            <h2 className="mt-3 font-serif-display text-[38px] font-normal leading-[1.04] text-ink md:text-[56px]">
              A scent to be remembered by
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-x-7 gap-y-2">
            <div role="group" aria-label="Filter the collection" className="flex gap-6">
              {TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={tab === t}
                  onClick={() => {
                    setTab(t);
                    rail.current?.scrollTo({ left: 0 });
                  }}
                  className={[
                    "min-h-[44px] border-b text-xs uppercase tracking-[0.24em] transition-colors",
                    tab === t ? "border-gold text-ink" : "border-transparent text-stone hover:text-ink",
                  ].join(" ")}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="hidden gap-2 md:flex">
              <button
                type="button"
                onClick={() => scroll(-1)}
                aria-label="Scroll collection left"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-ink transition-colors hover:border-gold hover:bg-gold/10"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
              </button>
              <button
                type="button"
                onClick={() => scroll(1)}
                aria-label="Scroll collection right"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-ink transition-colors hover:border-gold hover:bg-gold/10"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </Reveal>
      </div>

      <div
        ref={rail}
        className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-2 md:px-8 lg:px-[max(3rem,calc((100vw-80rem)/2+3rem))]"
      >
        {visible.map((p) => {
          const image = p.featuredImage || p.images[0];
          const line = getFragranceLine(p.handle);
          const price = Number.parseFloat(p.priceRange.minVariantPrice.amount);
          return (
            <Link
              key={p.id}
              href={`/shop/${p.handle}`}
              onClick={() =>
                trackCommerce("select_item", { item_list_name: "home_collection", items: [productToAnalyticsItem(p)] })
              }
              className="kh-zoom flex w-[72vw] max-w-[300px] flex-none snap-start flex-col gap-4 sm:w-[290px]"
            >
              <div className="relative aspect-[4/5] overflow-hidden border border-border bg-cream">
                {image ? (
                  <Image
                    src={image.url}
                    alt={image.altText || p.title}
                    fill
                    sizes="300px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-4">
                    <span aria-hidden="true" className="kh-mark h-28 text-aubergine opacity-20" />
                    <span className="text-[10px] uppercase tracking-[0.3em] text-stone">Photograph coming</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="text-[11px] uppercase tracking-[0.24em] text-stone">{p.productType}</span>
                <span className="font-serif-display text-2xl tracking-[0.08em] text-ink">{p.title}</span>
                {line && <span className="font-serif-display text-base italic text-stone">{line}</span>}
                <span className="mt-1.5 text-sm text-ink">
                  50 ml · {price > 0 ? formatPrice(price) : "Price coming soon"}
                </span>
              </div>
            </Link>
          );
        })}
        <Link
          href="/shop"
          className="flex w-[60vw] max-w-[240px] flex-none snap-start flex-col items-center justify-center gap-3 border border-ink/30 text-center text-ink transition-colors hover:bg-ink hover:text-cream sm:w-[240px]"
        >
          <span className="font-serif-display text-2xl">See every fragrance</span>
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </section>
  );
}
