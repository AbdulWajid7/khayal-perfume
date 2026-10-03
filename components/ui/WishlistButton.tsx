"use client";

import { useWishlist } from "@/hooks/useWishlist";
import type { Product } from "@/types/product";

export default function WishlistButton({ product }: { product: Product }) {
  const { has, toggle } = useWishlist();
  const saved = has(product.handle);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(product);
      }}
      aria-label={saved ? `Remove ${product.title} from wishlist` : `Save ${product.title} to wishlist`}
      aria-pressed={saved}
      className="absolute top-3 right-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-pure/90 backdrop-blur-sm border border-border text-stone transition-all hover:text-plum hover:border-plum/40"
    >
      <svg
        className={`h-4.5 w-4.5 h-[18px] w-[18px] transition-colors ${saved ? "text-plum fill-plum" : ""}`}
        viewBox="0 0 24 24"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    </button>
  );
}
