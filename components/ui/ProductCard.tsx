"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "./AddToCartButton";
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
  const minPrice = Number.parseFloat(product.priceRange.minVariantPrice.amount);
  const scentFamily = getMetafield(product, "scent_family");

  return (
    <article
      className="group relative bg-charcoal border border-border-subtle rounded-xl overflow-hidden transition-colors duration-300 hover:border-oud-gold/40"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={`/shop/${product.handle}`} aria-label={`View ${product.title}`}>
        <div className="relative aspect-[4/5] overflow-hidden bg-midnight">
          {image ? (
            <Image
              src={image.url}
              alt={image.altText || product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.05]"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full bg-charcoal" aria-hidden="true" />
          )}

          {scentFamily && (
            <span className="absolute top-3 left-3 bg-midnight/70 backdrop-blur-sm border border-border-subtle text-warm-taupe text-[10px] uppercase tracking-[0.15em] px-2.5 py-1 rounded-md">
              {scentFamily}
            </span>
          )}

          <div
            className={[
              "absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-midnight/90 to-transparent transition-opacity duration-300",
              hovered ? "opacity-100" : "opacity-0",
            ].join(" ")}
            aria-hidden="true"
          />
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/shop/${product.handle}`}>
          <h3 className="text-parchment text-base font-medium tracking-wide">
            {product.title}
          </h3>
        </Link>
        <p className="mt-1 text-oud-gold text-sm tabular-nums">
          {formatPrice(minPrice, product.priceRange.minVariantPrice.currencyCode)}
        </p>

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
