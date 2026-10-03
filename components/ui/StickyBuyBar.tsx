"use client";

import { formatPrice } from "@/lib/utils";
import AddToCartButton from "@/components/ui/AddToCartButton";
import type { Product } from "@/types/product";

export default function StickyBuyBar({ product }: { product: Product }) {
  const variant = product.variants[0];
  const price = variant
    ? Number.parseFloat(variant.price.amount)
    : Number.parseFloat(product.priceRange.minVariantPrice.amount);
  const hasOptions = product.variants.length > 1;
  const outOfStock = variant ? !variant.availableForSale : false;

  function scrollToOptions() {
    document
      .getElementById("purchase-panel")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] border-t border-border bg-pure/95 backdrop-blur-md px-4 py-3 lg:hidden">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-ink text-sm font-medium">{product.title}</p>
          <p className="text-gold text-sm font-medium tabular-nums">
            {formatPrice(price, variant?.price.currencyCode || "PKR")}
          </p>
        </div>
        {hasOptions ? (
          <button
            type="button"
            onClick={scrollToOptions}
            className="shrink-0 rounded-lg bg-ink px-5 py-3 text-xs font-medium uppercase tracking-[0.12em] text-pure"
          >
            Choose size
          </button>
        ) : outOfStock ? (
          <button
            type="button"
            onClick={scrollToOptions}
            className="shrink-0 rounded-lg bg-stone-light px-5 py-3 text-xs font-medium uppercase tracking-[0.12em] text-pure"
          >
            Notify me
          </button>
        ) : (
          <div className="shrink-0 [&_button]:px-5 [&_button]:py-3 [&_button]:text-xs">
            <AddToCartButton product={product} variantId={variant?.id} />
          </div>
        )}
      </div>
    </div>
  );
}
