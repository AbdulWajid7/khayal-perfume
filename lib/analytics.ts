"use client";

import type { CartItem } from "@/hooks/useCart";
import type { Product } from "@/types/product";
import { siteConfig } from "@/lib/site-config";
import { hasConsent } from "@/lib/consent";

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
  }
}

export type AnalyticsItem = {
  item_id: string;
  item_name: string;
  item_brand: "KHAYAL";
  item_category?: string;
  item_variant?: string;
  price: number;
  quantity: number;
  currency: "PKR";
  coupon?: string;
};

export type CommerceEvent =
  | "view_item_list"
  | "select_item"
  | "view_item"
  | "add_to_cart"
  | "remove_from_cart"
  | "view_cart"
  | "begin_checkout"
  | "add_shipping_info"
  | "add_payment_info"
  | "purchase";

export type MarketingEvent =
  | "search"
  | "generate_lead"
  | "whatsapp_click"
  | "phone_click"
  | "email_click"
  | "newsletter_signup"
  | "coupon_apply"
  | "coupon_apply_success"
  | "coupon_apply_failure"
  | "welcome_offer_view"
  | "welcome_offer_dismiss"
  | "welcome_offer_submit"
  | "welcome_offer_success"
  | "welcome_offer_error"
  | "welcome_offer_resend"
  | "review_submit"
  | "fragrance_quiz_start"
  | "fragrance_quiz_complete"
  | "out_of_stock_interest";

const enabled = process.env.NODE_ENV === "production" || process.env.NEXT_PUBLIC_ANALYTICS_TESTING === "true";
const purchaseKey = "khayal-tracked-purchases";

function pushDataLayer(event: string, params: Record<string, unknown> = {}) {
  if (!enabled || typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
}

function sendGA4(event: string, params: Record<string, unknown> = {}) {
  if (!enabled || !siteConfig.analytics.ga4Id || typeof window === "undefined" || !hasConsent("analytics")) return;
  window.gtag?.("event", event, params);
}

function sendMeta(event: string, params: Record<string, unknown> = {}, eventId?: string) {
  if (!enabled || !siteConfig.analytics.metaPixelId || typeof window === "undefined" || !hasConsent("marketing")) return;
  window.fbq?.("track", event, params, eventId ? { eventID: eventId } : undefined);
}

export function productToAnalyticsItem(product: Product, quantity = 1, variantId?: string): AnalyticsItem {
  const variant = product.variants.find((entry) => entry.id === variantId) || product.variants[0];
  return {
    item_id: product.id,
    item_name: product.title,
    item_brand: "KHAYAL",
    item_category: product.productType || undefined,
    item_variant: variant?.title || undefined,
    price: Number(variant?.price.amount || product.priceRange.minVariantPrice.amount),
    quantity,
    currency: "PKR",
  };
}

export function cartToAnalyticsItems(items: CartItem[]): AnalyticsItem[] {
  return items.map((item) => ({
    item_id: item.productId,
    item_name: item.title,
    item_brand: "KHAYAL",
    item_variant: item.variantTitle,
    price: Number(item.price),
    quantity: item.quantity,
    currency: "PKR",
  }));
}

export function trackPageView(path: string) {
  const safePath = path.split("?")[0];
  const params = { page_path: safePath, page_location: `${siteConfig.url}${safePath}` };
  sendGA4("page_view", params);
  pushDataLayer("page_view", params);
  sendMeta("PageView");
}

export function trackCommerce(event: CommerceEvent, params: Record<string, unknown>) {
  const normalized = { currency: "PKR", ...params };
  sendGA4(event, normalized);
  if (enabled && typeof window !== "undefined") {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ ecommerce: null });
  }
  pushDataLayer(event, { ecommerce: normalized });

  const map: Partial<Record<CommerceEvent, string>> = {
    view_item: "ViewContent",
    add_to_cart: "AddToCart",
    begin_checkout: "InitiateCheckout",
    add_payment_info: "AddPaymentInfo",
    purchase: "Purchase",
  };
  const metaEvent = map[event];
  if (metaEvent) sendMeta(metaEvent, normalized, typeof params.event_id === "string" ? params.event_id : undefined);
}

export function trackMarketing(event: MarketingEvent, params: Record<string, unknown> = {}) {
  sendGA4(event, params);
  pushDataLayer(event, params);
  const map: Partial<Record<MarketingEvent, string>> = {
    search: "Search",
    generate_lead: "Lead",
    newsletter_signup: "Lead",
    whatsapp_click: "Contact",
    phone_click: "Contact",
    email_click: "Contact",
    welcome_offer_success: "Lead",
    coupon_apply_success: "CustomizeProduct",
  };
  const metaEvent = map[event];
  if (metaEvent) sendMeta(metaEvent, params);
}

export function trackPurchaseOnce(params: {
  transaction_id: string;
  value: number;
  tax?: number;
  shipping?: number;
  coupon?: string;
  items: AnalyticsItem[];
  event_id?: string;
}) {
  if (typeof window === "undefined" || !params.transaction_id) return;
  const tracked = JSON.parse(localStorage.getItem(purchaseKey) || "[]") as string[];
  if (tracked.includes(params.transaction_id)) return;
  trackCommerce("purchase", { ...params, currency: "PKR", event_id: params.event_id || params.transaction_id });
  localStorage.setItem(purchaseKey, JSON.stringify([...tracked.slice(-49), params.transaction_id]));
}
