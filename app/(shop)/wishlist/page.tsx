"use client";

import Link from "next/link";
import Image from "next/image";
import { useWishlist } from "@/hooks/useWishlist";
import { formatPrice } from "@/lib/utils";

export default function WishlistPage() {
  const { items, remove } = useWishlist();

  return (
    <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-cream min-h-[60vh]">
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
        <h1 className="font-serif-display text-ink text-[40px] font-medium tracking-tight">
          Your Wishlist
        </h1>
        <p className="mt-2 text-stone text-base">
          Fragrances you saved for later — kept on this device.
        </p>

        {items.length === 0 ? (
          <div className="mt-10">
            <p className="text-stone">Nothing saved yet.</p>
            <Link href="/shop" className="mt-3 inline-block text-gold underline underline-offset-4">
              Explore the collection
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <div key={item.handle} className="bg-pure rounded-xl overflow-hidden border border-border">
                <Link href={`/shop/${item.handle}`}>
                  <div className="relative aspect-[4/5] bg-cream-dark">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full" aria-hidden="true" />
                    )}
                  </div>
                </Link>
                <div className="p-4">
                  <Link href={`/shop/${item.handle}`}>
                    <h3 className="text-ink text-base font-medium tracking-wide line-clamp-1">
                      {item.title}
                    </h3>
                  </Link>
                  <div className="mt-1 flex items-center justify-between">
                    <p className="text-gold text-sm font-medium tabular-nums">
                      {formatPrice(item.price, item.currencyCode)}
                    </p>
                    <button
                      type="button"
                      onClick={() => remove(item.handle)}
                      className="text-xs text-stone underline hover:text-plum"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
