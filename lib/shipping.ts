import { siteConfig } from "@/lib/site-config";

export const STANDARD_SHIPPING = 250;

export function qualifiesForFreeShipping(subtotal: number): boolean {
  return Number.isFinite(subtotal) && subtotal >= siteConfig.freeShippingThreshold;
}

export function calculateShipping(subtotal: number, standardShipping: number = STANDARD_SHIPPING): number {
  if (qualifiesForFreeShipping(subtotal)) return 0;
  return Math.max(0, Number.isFinite(standardShipping) ? standardShipping : 0);
}

const KARACHI_ALIASES = new Set([
  "karachi",
  "korangi",
  "clifton",
  "defence",
  "dha",
  "gulshan",
  "gulshan-e-iqbal",
  "johar",
  "gulistan-e-johar",
  "nazimabad",
  "liaquatabad",
  "saddar",
  "tariq road",
  "pechs",
  "garden",
  "lyari",
  "malir",
  "shah faisal",
  "shahfaisal",
  "landhi",
  "north nazimabad",
  "fb area",
  "bahadurabad",
  "kharadar",
  "machi miani",
]);

export function normalizeCity(city: string): string {
  return city
    .toLowerCase()
    .replace(/[-_,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isKarachi(city: string): boolean {
  const normalized = normalizeCity(city);
  const parts = normalized.split(/\s+/);
  if (parts.includes("karachi")) return true;
  return parts.some((part) => KARACHI_ALIASES.has(part));
}

export function getDeliveryMethod(city: string): "self_delivery" | "nationwide_courier" {
  return isKarachi(city) ? "self_delivery" : "nationwide_courier";
}

export function getExpectedDeliveryText(city: string): string {
  return isKarachi(city)
    ? "Within 24 hours after confirmation"
    : "3–4 working days after confirmation";
}

export function getDeliveryMethodLabel(city: string): string {
  return isKarachi(city) ? "KHAYAL Self Delivery" : "Nationwide Courier";
}
