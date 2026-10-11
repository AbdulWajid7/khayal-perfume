"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import VariantSelector from "@/components/ui/VariantSelector";
import AddToCartButton from "@/components/ui/AddToCartButton";
import { productToAnalyticsItem, trackCommerce, trackMarketing } from "@/lib/analytics";
import { getWhatsAppUrl, siteConfig } from "@/lib/site-config";
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
  const item = useMemo(
    () => productToAnalyticsItem(product, 1, selectedVariant?.id),
    [product, selectedVariant?.id]
  );
  const variantStock = selectedVariant?.stock ?? product.stock;
  const lowStock =
    selectedVariant?.availableForSale !== false &&
    typeof variantStock === "number" &&
    variantStock > 0 &&
    variantStock <= (product.lowStockThreshold ?? 5);

  const productUrl = `${siteConfig.url}/shop/${product.handle}`;
  const cleanTitle = product.title.replace(/^khayal[\s\-–—:]+/i, "").trim() || product.title;
  const whatsappMessage = `Assalamualaikum, I’m interested in KHAYAL ${cleanTitle}. Please help me choose or place an order. ${productUrl}`;
  const trackedProduct = useRef("");

  useEffect(() => {
    if (trackedProduct.current === product.id) return;
    trackedProduct.current = product.id;
    trackCommerce("view_item", {
      value: item.price,
      items: [item],
      content_ids: [item.item_id],
      content_name: item.item_name,
      content_type: "product",
      content_category: item.item_category,
      contents: [{ id: item.item_id, quantity: 1, item_price: item.price }],
    });
  }, [item, product.id]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 border-y border-border py-5">
        <p className="font-serif-display text-ink text-[30px] tabular-nums">
          {selectedVariant && Number.parseFloat(selectedVariant.price.amount) > 0
            ? formatPrice(
                Number.parseFloat(selectedVariant.price.amount),
                selectedVariant.price.currencyCode
              )
            : "Price coming soon"}
        </p>
        {comparePrice && comparePrice > minPrice && (
          <p className="text-stone-light text-xl line-through tabular-nums">
            {formatPrice(comparePrice, product.compareAtPriceRange?.maxVariantPrice.currencyCode || product.priceRange.minVariantPrice.currencyCode)}
          </p>
        )}
        {lowStock && (
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-aubergine border border-aubergine/30 px-3 py-1.5">
            Only {variantStock} left
          </span>
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
      <a
        href={getWhatsAppUrl(whatsappMessage)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackMarketing("whatsapp_click", { placement: "product", item_id: product.id })}
        className="mt-3 inline-flex min-h-[52px] w-full items-center justify-center gap-2.5 border border-ink/40 px-6 text-xs font-medium uppercase tracking-[0.22em] text-ink transition-colors hover:border-ink hover:bg-ink hover:text-cream"
        aria-label={`Order ${product.title} on WhatsApp`}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M4 20l1.3-4A8 8 0 1 1 8 18.7L4 20Z" /></svg>
        Order on WhatsApp
      </a>
      {selectedVariant && !selectedVariant.availableForSale && (
        <button
          type="button"
          onClick={() => trackMarketing("out_of_stock_interest", { item_id: product.id, item_name: product.title })}
          className="mt-3 w-full text-center text-sm text-stone underline hover:text-gold"
        >
          Notify me when available
        </button>
      )}
    </div>
  );
}
