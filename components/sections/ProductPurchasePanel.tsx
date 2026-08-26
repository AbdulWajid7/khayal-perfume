"use client";

import { useState } from "react";
import VariantSelector from "@/components/ui/VariantSelector";
import AddToCartButton from "@/components/ui/AddToCartButton";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types/product";

export default function ProductPurchasePanel({ product }: { product: Product }) {
  const [selectedId, setSelectedId] = useState(product.variants[0]?.id || "");
  const selectedVariant =
    product.variants.find((variant) => variant.id === selectedId) || product.variants[0];

  const comparePrice = product.compareAtPriceRange
    ? Number.parseFloat(product.compareAtPriceRange.maxVariantPrice.amount)
    : undefined;
  const minPrice = Number.parseFloat(product.priceRange.minVariantPrice.amount);

  return (
    <div>
      <div className="flex items-center gap-3">
        <p className="text-gold text-2xl font-medium tabular-nums">
          {selectedVariant
            ? formatPrice(
                Number.parseFloat(selectedVariant.price.amount),
                selectedVariant.price.currencyCode
              )
            : "—"}
        </p>
        {comparePrice && comparePrice > minPrice && (
          <p className="text-stone-light text-xl line-through tabular-nums">
            {formatPrice(comparePrice, product.compareAtPriceRange?.maxVariantPrice.currencyCode || product.priceRange.minVariantPrice.currencyCode)}
          </p>
        )}
      </div>

      <div className="mt-6">
        <VariantSelector
          variants={product.variants}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </div>

      <div className="mt-6">
        <AddToCartButton product={product} variantId={selectedId} fullWidth />
      </div>
    </div>
  );
}
