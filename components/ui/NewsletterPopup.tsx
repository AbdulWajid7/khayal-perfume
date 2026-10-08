"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { subscribeToNewsletter } from "@/lib/subscribers";
import { trackMarketing } from "@/lib/analytics";

const STORAGE_KEY = "khayal-newsletter-dismissed";

export default function NewsletterPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

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

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!email || busy) return;
    setBusy(true);
    setMessage("");
    try {
      const res = await subscribeToNewsletter(email, "popup");
      if (res.ok) {
        trackMarketing("newsletter_signup", { lead_type: "newsletter", placement: "popup" });
        setSubmitted(true);
        setTimeout(() => close(), 2000);
      } else {
        setMessage(res.message);
      }
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
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
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            className="fixed left-1/2 top-1/2 z-[120] w-[calc(100%-32px)] max-w-md -translate-x-1/2 -translate-y-1/2 bg-pure p-8 md:p-12 text-center shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Newsletter offer"
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close newsletter popup"
              className="absolute right-4 top-4 h-8 w-8 flex items-center justify-center text-ink hover:text-gold transition-colors"
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

            {submitted ? (
              <div className="pt-6">
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
                <h3 className="font-serif-display text-ink text-2xl font-medium">Thank you</h3>
                <p className="mt-2 text-stone text-sm">You&apos;re now part of the Khayal Circle.</p>
              </div>
            ) : (
              <>
                <p className="text-xs font-medium tracking-[0.2em] uppercase text-stone-light">
                  Signup for Emails
                </p>
                <h3 className="mt-4 font-serif-display text-ink text-3xl md:text-4xl font-medium leading-tight">
                  Join the Khayal Circle
                </h3>
                <p className="mt-4 text-stone text-sm leading-relaxed">
                  Receive new fragrance stories, launches, and early access by email.
                </p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-3 text-left">
                  <label htmlFor="popup-email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="popup-email"
                    type="email"
                    data-clarity-mask="true"
                    required
                    disabled={busy}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email..."
                    className="w-full bg-cream border border-border px-4 py-3 text-sm text-ink placeholder:text-stone-light focus:border-gold focus:outline-none transition-colors disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full bg-ink text-pure px-4 py-3 text-xs font-medium tracking-[0.15em] uppercase hover:bg-gold transition-colors disabled:opacity-60"
                  >
                    {busy ? "Subscribing..." : "Subscribe"}
                  </button>
                </form>
                {message && (
                  <p className="mt-3 text-xs text-sale">{message}</p>
                )}
                <button
                  type="button"
                  onClick={close}
                  className="mt-5 text-xs text-stone-light underline hover:text-ink transition-colors"
                >
                  No, Thanks
                </button>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
