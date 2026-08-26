"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "khayal-newsletter-dismissed";

export default function NewsletterPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const dismissed = typeof window !== "undefined" && sessionStorage.getItem(STORAGE_KEY);
    if (dismissed) return;
    const timer = setTimeout(() => setVisible(true), 2500);
    return () => clearTimeout(timer);
  }, []);

  function close() {
    setVisible(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(STORAGE_KEY, "true");
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!email) return;
    // Provider integration can be wired here.
    setSubmitted(true);
    setTimeout(() => close(), 2000);
  }

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[110] bg-ink/40 backdrop-blur-sm"
            onClick={close}
            aria-hidden="true"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-1/2 top-1/2 z-[120] w-[calc(100%-32px)] max-w-3xl -translate-x-1/2 -translate-y-1/2 bg-pure rounded-2xl overflow-hidden shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Newsletter offer"
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close newsletter popup"
              className="absolute top-4 right-4 z-10 h-8 w-8 flex items-center justify-center rounded-full bg-pure/80 text-ink hover:text-gold transition-colors"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="relative aspect-square md:aspect-auto md:h-full min-h-[280px] bg-ink">
                <Image
                  src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80"
                  alt="Luxury perfume editorial"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="p-8 md:p-12 flex flex-col justify-center">
                {submitted ? (
                  <div className="text-center">
                    <div className="mx-auto h-12 w-12 rounded-full bg-gold/10 flex items-center justify-center mb-4">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#BFA15F"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </div>
                    <h3 className="font-serif-display text-ink text-2xl font-medium">Welcome to Khayal</h3>
                    <p className="mt-2 text-stone text-sm">Your 20% off code is on its way.</p>
                  </div>
                ) : (
                  <>
                    <span className="text-gold text-xs font-medium tracking-[0.15em] uppercase">
                      Exclusive Offer
                    </span>
                    <h3 className="mt-3 font-serif-display text-ink text-3xl md:text-4xl font-medium leading-tight">
                      Join our newsletter and get
                    </h3>
                    <p className="mt-2 font-serif-display text-sale text-5xl md:text-6xl font-medium">
                      20% Off
                    </p>
                    <p className="text-ink text-lg">your first order</p>
                    <p className="mt-4 text-stone text-sm">
                      Be the first to discover new releases, limited editions, and scent stories.
                    </p>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-3">
                      <label htmlFor="popup-email" className="sr-only">
                        Email address
                      </label>
                      <input
                        id="popup-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full bg-cream border border-border rounded-lg px-4 py-3 text-sm text-ink placeholder:text-stone-light focus:border-gold focus:outline-none transition-colors"
                      />
                      <button
                        type="submit"
                        className="w-full bg-gold text-pure rounded-lg px-4 py-3 text-sm font-medium hover:bg-gold-light transition-colors"
                      >
                        Subscribe
                      </button>
                    </form>
                    <p className="mt-3 text-stone-light text-xs text-center">
                      No spam, unsubscribe anytime.
                    </p>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
