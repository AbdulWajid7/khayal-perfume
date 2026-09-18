"use client";

import { useEffect } from "react";
import { productToAnalyticsItem, trackCommerce } from "@/lib/analytics";
import type { Product } from "@/types/product";

export default function ProductListTracker({ products, listName }: { products: Product[]; listName: string }) {
  useEffect(() => {
    if (products.length === 0) return;
    trackCommerce("view_item_list", {
      item_list_name: listName,
      items: products.map((product) => productToAnalyticsItem(product)),
    });
  }, [listName, products]);

  return null;
}
