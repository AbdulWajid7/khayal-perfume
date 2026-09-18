"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCart, type CartItem } from "@/hooks/useCart";
import { cartToAnalyticsItems, trackCommerce, trackMarketing } from "@/lib/analytics";
import { getWhatsAppUrl, siteConfig } from "@/lib/site-config";

function formatPrice(amount: number, currencyCode: string) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: currencyCode,
  }).format(amount);
}

function CartLineItem({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <li className="flex gap-4 py-4 border-b border-border-light">
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-cream-dark border border-border">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="h-full w-full bg-cream-dark" aria-hidden="true" />
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h3 className="text-ink text-sm font-medium">{item.title}</h3>
          {item.variantTitle && (
            <p className="text-stone text-xs mt-0.5">{item.variantTitle}</p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center border border-border rounded-md bg-pure">
            <button
              type="button"
              aria-label="Decrease quantity"
              className="px-2 py-1 text-ink hover:text-gold transition-colors text-sm"
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
            >
              −
            </button>
            <span className="px-2 text-ink text-sm min-w-[1.5rem] text-center tabular-nums">
              {item.quantity}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              className="px-2 py-1 text-ink hover:text-gold transition-colors text-sm"
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
            >
              +
            </button>
          </div>
          <span className="text-ink text-sm tabular-nums">
            {formatPrice(item.price * item.quantity, item.currencyCode)}
          </span>
        </div>
      </div>
      <button
        type="button"
        aria-label={`Remove ${item.title} from cart`}
        className="self-start text-stone hover:text-gold transition-colors text-xs"
        onClick={() => {
          trackCommerce("remove_from_cart", {
            value: item.price * item.quantity,
            items: cartToAnalyticsItems([item]),
          });
          removeItem(item.id);
        }}
      >
        Remove
      </button>
    </li>
  );
}

export default function CartDrawer() {
  const { items, isOpen, closeCart, subtotal, currencyCode, checkoutUrl } = useCart();
  const drawerRef = useRef<HTMLDivElement>(null);
  const trackedOpen = useRef(false);
  const remainingForFreeShipping = Math.max(0, siteConfig.freeShippingThreshold - subtotal);

  useEffect(() => {
    if (isOpen && items.length > 0 && !trackedOpen.current) {
      trackCommerce("view_cart", {
        value: subtotal,
        items: cartToAnalyticsItems(items),
      });
      trackedOpen.current = true;
    }
    if (!isOpen) trackedOpen.current = false;
  }, [isOpen, items, subtotal]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeCart();
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, closeCart]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[80] bg-ink/20 backdrop-blur-sm"
            onClick={closeCart}
            aria-hidden="true"
          />
          <motion.div
            ref={drawerRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed top-0 right-0 bottom-0 z-[90] w-full md:w-[420px] bg-pure border-l border-border flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
          >
            <div className="flex items-center justify-between h-20 px-6 border-b border-border flex-shrink-0">
              <h2 className="text-ink text-base font-medium tracking-wide">Your Cart</h2>
              <button
                type="button"
                aria-label="Close cart"
                className="text-ink hover:text-gold transition-colors"
                onClick={closeCart}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                <p className="text-ink text-base font-medium">Your cart is empty</p>
                <p className="text-stone text-sm mt-2">
                  Discover your signature scent in our collection.
                </p>
                <Link
                  href="/shop"
                  onClick={closeCart}
                  className="mt-6 inline-flex items-center justify-center bg-gold text-pure rounded-lg px-6 py-3 text-sm font-medium hover:bg-gold-light transition-colors"
                >
                  Explore Collection
                </Link>
              </div>
            ) : (
              <>
                <ul className="flex-1 overflow-y-auto px-6 no-scrollbar">
                  {items.map((item) => (
                    <CartLineItem key={item.id} item={item} />
                  ))}
                </ul>
                <div className="border-t border-border p-6 flex-shrink-0">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-stone text-sm">Subtotal</span>
                    <span className="text-ink text-base font-medium tabular-nums">
                      {formatPrice(subtotal, currencyCode)}
                    </span>
                  </div>
                  <div className="mb-4">
                    <div className="h-1.5 overflow-hidden rounded-full bg-cream-dark">
                      <div
                        className="h-full rounded-full bg-gold transition-[width] duration-500"
                        style={{ width: `${Math.min(100, (subtotal / siteConfig.freeShippingThreshold) * 100)}%` }}
                      />
                    </div>
                    <p className="mt-2 text-center text-xs text-stone">
                      {remainingForFreeShipping === 0
                        ? "You qualify for free delivery across Pakistan."
                        : `Add ${formatPrice(remainingForFreeShipping, "PKR")} more for free delivery.`}
                    </p>
                  </div>
                  {checkoutUrl ? (
                    <a
                      href={checkoutUrl}
                      onClick={() => {
                        const analyticsItems = cartToAnalyticsItems(items);
                        trackCommerce("begin_checkout", {
                          value: subtotal,
                          items: analyticsItems,
                          content_ids: analyticsItems.map((item) => item.item_id),
                          content_type: "product",
                          contents: analyticsItems.map((item) => ({ id: item.item_id, quantity: item.quantity, item_price: item.price })),
                        });
                      }}
                      className="block w-full text-center bg-gold text-pure rounded-lg px-6 py-3 text-sm font-medium hover:bg-gold-light transition-colors"
                    >
                      Checkout
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="w-full bg-gold/60 text-pure/80 rounded-lg px-6 py-3 text-sm font-medium cursor-not-allowed"
                    >
                      Online checkout coming soon
                    </button>
                  )}
                  <a
                    href={getWhatsAppUrl(`Assalamualaikum, I need help with my KHAYAL cart. ${siteConfig.url}`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackMarketing("whatsapp_click", { placement: "cart" })}
                    className="mt-3 block text-center text-xs text-gold hover:underline"
                  >
                    Need help? Chat with us on WhatsApp
                  </a>
                  <p className="text-stone text-xs text-center mt-3">
                    Free delivery across Pakistan on orders of PKR {siteConfig.freeShippingThreshold.toLocaleString("en-PK")} or more.
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
