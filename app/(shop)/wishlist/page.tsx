"use client";

import Link from "next/link";
import Image from "next/image";
import { useWishlist } from "@/hooks/useWishlist";
import { formatPrice } from "@/lib/utils";
import PageHero from "@/components/ui/PageHero";
import EmptyState from "@/components/ui/EmptyState";

export default function WishlistPage() {
  const { items, remove } = useWishlist();

  return (
    <div className="bg-cream min-h-[60vh]">
      <PageHero
        eyebrow="Saved for later"
        title="Your"
        accent="wishlist"
        intro="Fragrances you saved for later — kept on this device."
        meta={items.length ? `${items.length} ${items.length === 1 ? "fragrance" : "fragrances"} saved` : undefined}
      />
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12 pb-24 md:pb-32">
        {items.length === 0 ? (
          <EmptyState
            title="Nothing saved yet"
            text="Tap the heart on any fragrance to keep it here while you decide."
            cta={{ label: "Explore the collection", href: "/shop" }}
            secondary={{ label: "Find your scent", href: "/scent-finder" }}
          />
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
            {items.map((item) => (
              <article
                key={item.handle}
                className="group overflow-hidden rounded-xl border border-border bg-pure transition-all duration-500 hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_28px_60px_-30px_rgba(191,161,95,0.65)]"
              >
                <Link href={`/shop/${item.handle}`} aria-label={`View ${item.title}`}>
                  <div className="relative aspect-[4/5] overflow-hidden bg-cream-dark">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full" aria-hidden="true" />
                    )}
                  </div>
                </Link>
                <div className="p-4">
                  <Link href={`/shop/${item.handle}`}>
                    <h3 className="font-serif-display text-ink text-lg font-medium line-clamp-1">{item.title}</h3>
                  </Link>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="text-gold text-sm font-medium tabular-nums">{formatPrice(item.price, item.currencyCode)}</p>
                    <button
                      type="button"
                      onClick={() => remove(item.handle)}
                      className="text-[11px] uppercase tracking-[0.16em] text-stone transition-colors hover:text-plum"
                      aria-label={`Remove ${item.title} from wishlist`}
                    >
                      Remove
                    </button>
                  </div>
                  <Link
                    href={`/shop/${item.handle}`}
                    className="btn-sweep mt-4 flex w-full items-center justify-center border border-ink/25 px-4 py-3 text-[11px] font-medium uppercase tracking-[0.2em] text-ink transition-colors hover:border-gold"
                  >
                    View fragrance
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
