import { siteConfig } from "@/lib/site-config";

export function qualifiesForFreeShipping(subtotal: number): boolean {
  return Number.isFinite(subtotal) && subtotal >= siteConfig.freeShippingThreshold;
}

export function calculateShipping(subtotal: number, standardShipping: number): number {
  if (qualifiesForFreeShipping(subtotal)) return 0;
  return Math.max(0, Number.isFinite(standardShipping) ? standardShipping : 0);
}
