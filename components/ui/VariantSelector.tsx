"use client";

import { formatPrice } from "@/lib/utils";
import type { ProductVariant } from "@/types/product";

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedId: string;
  onSelect: (variantId: string) => void;
}

export default function VariantSelector({ variants, selectedId, onSelect }: VariantSelectorProps) {
  if (variants.length <= 1) return null;

  return (
    <div>
      <p className="text-stone text-xs uppercase tracking-[0.15em] mb-3">Size</p>
      <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Select size">
        {variants.map((variant) => {
          const isSelected = variant.id === selectedId;
          return (
            <button
              key={variant.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={!variant.availableForSale}
              onClick={() => onSelect(variant.id)}
              className={[
                "min-h-[44px] border px-4 py-2.5 text-xs font-medium uppercase tracking-[0.16em] transition-colors tabular-nums",
                isSelected
                  ? "bg-ink text-cream border-ink"
                  : "bg-transparent text-ink border-border hover:border-ink",
                !variant.availableForSale ? "opacity-40 cursor-not-allowed" : "",
              ].join(" ")}
            >
              {variant.title}
              <span className="ml-2 opacity-70">
                {formatPrice(Number.parseFloat(variant.price.amount), variant.price.currencyCode)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
