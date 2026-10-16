"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { productToAnalyticsItem, trackCommerce } from "@/lib/analytics";
import { DUO_SAVING, type Duo } from "@/lib/bundles";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types/product";

const unitPrice = (p: Product) => Number.parseFloat(p.variants[0]?.price.amount || p.priceRange.minVariantPrice.amount) || 0;
const buyable = (p: Product) => unitPrice(p) > 0 && p.variants[0]?.availableForSale !== false;

function useAddPair() {
  const { addItem } = useCart();
  return (pair: Product[]) => {
    for (const p of pair) {
      const v = p.variants[0];
      if (!v) continue;
      addItem({
        variantId: v.id,
        productId: p.id,
        title: p.title,
        variantTitle: v.title,
        quantity: 1,
        price: unitPrice(p),
        currencyCode: v.price.currencyCode,
        image: p.featuredImage?.url,
      });
    }
    const items = pair.map((p) => productToAnalyticsItem(p, 1, p.variants[0]?.id));
    const value = items.reduce((s, i) => s + i.price, 0);
    trackCommerce("add_to_cart", {
      value,
      items,
      content_ids: items.map((i) => i.item_id),
      content_name: pair.map((p) => p.title).join(" + "),
      content_type: "product",
      contents: items.map((i) => ({ id: i.item_id, quantity: 1, item_price: i.price })),
    });
  };
}

function PairPrice({ pair }: { pair: Product[] }) {
  const full = pair.reduce((s, p) => s + unitPrice(p), 0);
  return (
    <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 tabular-nums">
      <span className="font-serif-display text-ink text-2xl">{formatPrice(full - DUO_SAVING, "PKR")}</span>
      <span className="text-stone-light line-through">{formatPrice(full, "PKR")}</span>
      <span className="whitespace-nowrap text-xs uppercase tracking-[0.16em] text-aubergine">Save {formatPrice(DUO_SAVING, "PKR")}</span>
    </p>
  );
}

function Bottle({ product, size = 160 }: { product: Product; size?: number }) {
  return product.featuredImage?.url ? (
    <Image
      src={product.featuredImage.url}
      alt={product.featuredImage.altText || `${product.title} extrait de parfum`}
      width={size}
      height={Math.round(size * 1.25)}
      className="h-full w-full object-cover"
    />
  ) : (
    <div className="flex h-full w-full items-center justify-center bg-cream-dark font-serif-display text-ink text-lg">
      {product.title}
    </div>
  );
}

export default function DuoBuilder({ duos, products }: { duos: Duo[]; products: Product[] }) {
  const addPair = useAddPair();
  const byHandle = useMemo(() => new Map(products.map((p) => [p.handle, p])), [products]);
  const ready = duos
    .map((d) => ({ duo: d, pair: d.handles.map((h) => byHandle.get(h)).filter(Boolean) as Product[] }))
    .filter(({ pair }) => pair.length === 2 && pair.every(buyable));

  const choosable = products.filter(buyable);
  const [picked, setPicked] = useState<string[]>([]);
  const pickedProducts = picked.map((h) => byHandle.get(h)).filter(Boolean) as Product[];
  const toggle = (handle: string) =>
    setPicked((prev) =>
      prev.includes(handle) ? prev.filter((h) => h !== handle) : prev.length >= 2 ? [prev[1], handle] : [...prev, handle]
    );

  return (
    <>
      {ready.length > 0 && (
        <section aria-labelledby="ready-duos" className="mt-12">
          <h2 id="ready-duos" className="font-serif-display text-ink text-3xl">Ready-made duos</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {ready.map(({ duo, pair }) => (
              <article key={duo.slug} className="flex flex-col border border-border bg-pure">
                <div className="grid grid-cols-2 gap-px bg-border">
                  {pair.map((p) => (
                    <Link key={p.id} href={`/shop/${p.handle}`} className="block aspect-[4/5] overflow-hidden bg-cream">
                      <Bottle product={p} />
                    </Link>
                  ))}
                </div>
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-gold">{pair.map((p) => p.title).join(" + ")}</p>
                  <h3 className="font-serif-display text-ink text-2xl">{duo.name}</h3>
                  <p className="text-stone text-sm leading-relaxed">{duo.line}</p>
                  <div className="mt-auto pt-2">
                    <PairPrice pair={pair} />
                    <button
                      type="button"
                      onClick={() => addPair(pair)}
                      className="mt-4 inline-flex min-h-[48px] w-full items-center justify-center bg-ink px-6 text-xs font-medium uppercase tracking-[0.22em] text-cream transition-colors hover:bg-aubergine"
                    >
                      Add both to bag
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section aria-labelledby="build-duo" className="mt-16">
        <h2 id="build-duo" className="font-serif-display text-ink text-3xl">Build your own duo</h2>
        <p className="mt-2 text-stone">Pick any two fragrances. The saving is applied in your bag.</p>

        {choosable.length < 2 ? (
          <p className="mt-6 text-stone">Fragrances are coming soon.</p>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
              {choosable.map((p) => {
                const on = picked.includes(p.handle);
                return (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(p.handle)}
                    className={[
                      "group flex flex-col border text-left transition-colors",
                      on ? "border-ink ring-1 ring-ink" : "border-border hover:border-ink",
                    ].join(" ")}
                  >
                    <span className="relative block aspect-[4/5] overflow-hidden bg-cream">
                      <Bottle product={p} size={200} />
                      {on && (
                        <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-ink text-xs text-cream">
                          {picked.indexOf(p.handle) + 1}
                        </span>
                      )}
                    </span>
                    <span className="p-3">
                      <span className="block text-sm font-medium text-ink">{p.title}</span>
                      <span className="block text-xs text-stone tabular-nums">{formatPrice(unitPrice(p), "PKR")}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="sticky bottom-0 z-10 mt-8 flex flex-col gap-4 border border-border bg-pure p-5 shadow-sm md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-ink">
                  {pickedProducts.length === 0 && "Choose your first fragrance."}
                  {pickedProducts.length === 1 && `${pickedProducts[0].title} + choose one more.`}
                  {pickedProducts.length === 2 && pickedProducts.map((p) => p.title).join(" + ")}
                </p>
                {pickedProducts.length === 2 && <PairPrice pair={pickedProducts} />}
              </div>
              <button
                type="button"
                disabled={pickedProducts.length !== 2}
                onClick={() => {
                  addPair(pickedProducts);
                  setPicked([]);
                }}
                className="inline-flex min-h-[48px] items-center justify-center bg-ink px-8 text-xs font-medium uppercase tracking-[0.22em] text-cream transition-colors hover:bg-aubergine disabled:cursor-not-allowed disabled:opacity-40"
              >
                Add my duo to bag
              </button>
            </div>
          </>
        )}
      </section>
    </>
  );
}
