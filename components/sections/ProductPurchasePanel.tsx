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
  const productUrl = `${siteConfig.url}/shop/${product.handle}`;
  const whatsappMessage = `Assalamualaikum, I’m interested in KHAYAL ${product.title}. Please help me choose or place an order. ${productUrl}`;
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
      <a
        href={getWhatsAppUrl(whatsappMessage)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackMarketing("whatsapp_click", { placement: "product", item_id: product.id })}
        className="mt-3 inline-flex w-full items-center justify-center rounded-lg border border-gold px-6 py-3 text-sm font-medium text-gold transition-colors hover:bg-gold hover:text-pure"
        aria-label={`Ask about ${product.title} on WhatsApp`}
      >
        Ask about this fragrance on WhatsApp
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
