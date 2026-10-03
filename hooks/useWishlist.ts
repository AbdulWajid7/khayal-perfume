"use client";

import { useCallback, useEffect, useState } from "react";
import type { Product } from "@/types/product";

export interface WishlistItem {
  handle: string;
  title: string;
  price: number;
  currencyCode: string;
  image?: string;
}

const STORAGE_KEY = "khayal-wishlist";
const listeners = new Set<() => void>();

function read(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function write(items: WishlistItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  listeners.forEach((fn) => fn());
}

export function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    const sync = () => setItems(read());
    sync();
    listeners.add(sync);
    return () => {
      listeners.delete(sync);
    };
  }, []);

  const has = useCallback(
    (handle: string) => items.some((i) => i.handle === handle),
    [items]
  );

  const toggle = useCallback((product: Product) => {
    const current = read();
    const exists = current.some((i) => i.handle === product.handle);
    if (exists) {
      write(current.filter((i) => i.handle !== product.handle));
      return;
    }
    const price = Number.parseFloat(product.priceRange.minVariantPrice.amount);
    write([
      ...current,
      {
        handle: product.handle,
        title: product.title,
        price,
        currencyCode: product.priceRange.minVariantPrice.currencyCode,
        image: product.featuredImage?.url || product.images[0]?.url,
      },
    ]);
  }, []);

  const remove = useCallback((handle: string) => {
    write(read().filter((i) => i.handle !== handle));
  }, []);

  return { items, has, toggle, remove, count: items.length };
}
