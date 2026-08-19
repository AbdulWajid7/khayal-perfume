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

  return (
    <div>
      <p className="text-oud-gold text-2xl font-medium tabular-nums">
        {selectedVariant
          ? formatPrice(
              Number.parseFloat(selectedVariant.price.amount),
              selectedVariant.price.currencyCode
            )
          : "—"}
      </p>

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
