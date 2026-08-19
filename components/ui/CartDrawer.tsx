"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCart, type CartItem } from "@/hooks/useCart";

function formatPrice(amount: number, currencyCode: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currencyCode,
  }).format(amount);
}

function CartLineItem({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <li className="flex gap-4 py-4 border-b border-border-subtle">
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-charcoal border border-border-subtle">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="h-full w-full bg-charcoal" aria-hidden="true" />
        )}
      </div>
      <div className="flex flex-1 flex-col justify-between">
        <div>
          <h3 className="text-parchment text-sm font-medium">{item.title}</h3>
          {item.variantTitle && (
            <p className="text-warm-taupe text-xs mt-0.5">{item.variantTitle}</p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center border border-border-subtle rounded-md">
            <button
              type="button"
              aria-label="Decrease quantity"
              className="px-2 py-1 text-parchment hover:text-oud-gold transition-colors text-sm"
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
            >
              −
            </button>
            <span className="px-2 text-parchment text-sm min-w-[1.5rem] text-center tabular-nums">
              {item.quantity}
            </span>
            <button
              type="button"
              aria-label="Increase quantity"
              className="px-2 py-1 text-parchment hover:text-oud-gold transition-colors text-sm"
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
            >
              +
            </button>
          </div>
          <span className="text-parchment text-sm tabular-nums">
            {formatPrice(item.price * item.quantity, item.currencyCode)}
          </span>
        </div>
      </div>
      <button
        type="button"
        aria-label={`Remove ${item.title} from cart`}
        className="self-start text-warm-taupe hover:text-oud-gold transition-colors text-xs"
        onClick={() => removeItem(item.id)}
      >
        Remove
      </button>
    </li>
  );
}

export default function CartDrawer() {
  const { items, isOpen, closeCart, subtotal, currencyCode, checkoutUrl } = useCart();
  const drawerRef = useRef<HTMLDivElement>(null);

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
            className="fixed inset-0 z-[80] bg-midnight/60 backdrop-blur-sm"
            onClick={closeCart}
            aria-hidden="true"
          />
          <motion.div
            ref={drawerRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="fixed top-0 right-0 bottom-0 z-[90] w-full md:w-[400px] bg-midnight border-l border-border-subtle flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
          >
            <div className="flex items-center justify-between h-16 px-6 border-b border-border-subtle flex-shrink-0">
              <h2 className="text-parchment text-base font-medium tracking-wide">Your Cart</h2>
              <button
                type="button"
                aria-label="Close cart"
                className="text-parchment hover:text-oud-gold transition-colors"
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
                <p className="text-parchment text-base font-medium">Your cart is empty</p>
                <p className="text-warm-taupe text-sm mt-2">
                  Discover your signature scent in our collection.
                </p>
                <Link
                  href="/shop"
                  onClick={closeCart}
                  className="mt-6 inline-flex items-center justify-center bg-oud-gold text-midnight rounded-lg px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
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
                <div className="border-t border-border-subtle p-6 flex-shrink-0">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-warm-taupe text-sm">Subtotal</span>
                    <span className="text-parchment text-base font-medium tabular-nums">
                      {formatPrice(subtotal, currencyCode)}
                    </span>
                  </div>
                  {checkoutUrl ? (
                    <a
                      href={checkoutUrl}
                      className="block w-full text-center bg-oud-gold text-midnight rounded-lg px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                      Checkout
                    </a>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="w-full bg-oud-gold/60 text-midnight/80 rounded-lg px-6 py-3 text-sm font-medium cursor-not-allowed"
                    >
                      Checkout (configure Shopify checkout)
                    </button>
                  )}
                  <p className="text-warm-taupe text-xs text-center mt-3">
                    Shipping & taxes calculated at checkout.
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
