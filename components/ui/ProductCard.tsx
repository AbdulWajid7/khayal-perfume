"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "./AddToCartButton";
import WishlistButton from "./WishlistButton";
import { productToAnalyticsItem, trackCommerce } from "@/lib/analytics";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
}

function getMetafield(product: Product, key: string): string | undefined {
  return product.metafields.find((m) => m.namespace === "custom" && m.key === key)?.value;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const image = product.featuredImage || product.images[0];
  const hoverImage =
    product.images.length > 1 ? product.images[1] : null;
  const minPrice = Number.parseFloat(product.priceRange.minVariantPrice.amount);
  const comparePrice = product.compareAtPriceRange
    ? Number.parseFloat(product.compareAtPriceRange.maxVariantPrice.amount)
    : undefined;
  const scentFamily = getMetafield(product, "scent_family");
  const badge = getMetafield(product, "badge");
  const isSale = comparePrice && comparePrice > minPrice;

  function trackSelection() {
    const item = productToAnalyticsItem(product);
    trackCommerce("select_item", { item_list_name: "product_collection", items: [item] });
  }

  return (
    <article
      className="group relative bg-pure rounded-xl overflow-hidden border border-border transition-all duration-300 hover:shadow-lg hover:border-gold/30"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={`/shop/${product.handle}`} aria-label={`View ${product.title}`} onClick={trackSelection}>
        <div className="relative aspect-[4/5] overflow-hidden bg-cream-dark">
          {image ? (
            <>
              <Image
                src={image.url}
                alt={image.altText || product.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                loading="lazy"
              />
              {hoverImage && (
                <Image
                  src={hoverImage.url}
                  alt={hoverImage.altText || product.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover opacity-0 transition-all duration-500 ease-out group-hover:opacity-100 group-hover:scale-105"
                  loading="lazy"
                  aria-hidden="true"
                />
              )}
            </>
          ) : (
            <div className="h-full w-full bg-cream-dark" aria-hidden="true" />
          )}

          {(badge || isSale) && (
            <span className="absolute top-3 left-3 bg-gold text-pure text-[10px] uppercase tracking-[0.15em] px-2.5 py-1 rounded-md font-medium">
              {isSale ? "Sale" : badge}
            </span>
          )}

          {scentFamily && (
            <span className="absolute top-3 right-14 bg-pure/90 backdrop-blur-sm border border-border text-ink text-[10px] uppercase tracking-[0.12em] px-2.5 py-1 rounded-md">
              {scentFamily}
            </span>
          )}

          <div
            className={[
              "absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-pure/90 to-transparent transition-opacity duration-300",
              hovered ? "opacity-100" : "opacity-0",
            ].join(" ")}
            aria-hidden="true"
          />
        </div>
      </Link>
      <WishlistButton product={product} />

      <div className="p-4">
        <Link href={`/shop/${product.handle}`} onClick={trackSelection}>
          <h3 className="text-ink text-base font-medium tracking-wide line-clamp-1">
            {product.title}
          </h3>
        </Link>
        <div className="mt-1 flex items-center gap-2">
          <p className="text-gold text-sm font-medium tabular-nums">
            {formatPrice(minPrice, product.priceRange.minVariantPrice.currencyCode)}
          </p>
          {comparePrice && comparePrice > minPrice && (
            <p className="text-stone-light text-sm line-through tabular-nums">
              {formatPrice(comparePrice, product.compareAtPriceRange?.maxVariantPrice.currencyCode || product.priceRange.minVariantPrice.currencyCode)}
            </p>
          )}
        </div>

        <div
          className={[
            "mt-3 transition-all duration-300",
            hovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none",
          ].join(" ")}
        >
          <AddToCartButton product={product} fullWidth />
        </div>
      </div>
    </article>
  );
}
