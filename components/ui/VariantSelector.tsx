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
      <p className="text-stone text-[11px] uppercase tracking-[0.24em] mb-3">Choose your size</p>
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
                "rounded-full border px-5 py-2.5 text-sm font-medium transition-all duration-300 tabular-nums",
                isSelected
                  ? "bg-gold text-pure border-gold shadow-[0_8px_22px_-12px_rgba(191,161,95,0.9)]"
                  : "bg-pure text-ink border-border hover:border-gold",
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
