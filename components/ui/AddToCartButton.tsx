"use client";

import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import type { Product } from "@/types/product";

interface AddToCartButtonProps {
  product: Product;
  variantId?: string;
  quantity?: number;
  fullWidth?: boolean;
  className?: string;
}

export default function AddToCartButton({
  product,
  variantId,
  quantity = 1,
  fullWidth = false,
  className = "",
}: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false);
  const { addItem } = useCart();

  const selectedVariant =
    product.variants.find((v) => v.id === variantId) || product.variants[0];

  async function handleAdd() {
    if (!selectedVariant) return;
    setLoading(true);
    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      title: product.title,
      variantTitle: selectedVariant.title,
      quantity,
      price: Number.parseFloat(selectedVariant.price.amount),
      currencyCode: selectedVariant.price.currencyCode,
      image: product.featuredImage?.url,
    });
    // Brief artificial delay for tactile feedback
    await new Promise((resolve) => setTimeout(resolve, 250));
    setLoading(false);
  }

  return (
    <button
      type="button"
      disabled={!selectedVariant || loading}
      onClick={handleAdd}
      className={[
        "inline-flex items-center justify-center rounded-lg px-6 py-3 text-sm font-medium transition-colors",
        "bg-gold text-pure hover:bg-gold-light disabled:opacity-50 disabled:cursor-not-allowed",
        fullWidth ? "w-full" : "",
        className,
      ].join(" ")}
      aria-label={`Add ${product.title} to cart`}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Adding...
        </span>
      ) : (
        "Add to Cart"
      )}
    </button>
  );
}
