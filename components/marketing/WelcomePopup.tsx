"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { createWelcomeSignup, resendWelcomeCode } from "@/lib/welcome-offers";
import { trackMarketing } from "@/lib/analytics";

const STORAGE_KEY = "khayal-welcome-popup";
const SESSION_KEY = "khayal-welcome-session";
const POPUP_MIN_DELAY = 8000;
const POPUP_MAX_DELAY = 12000;
const MOBILE_SCROLL_THRESHOLD = 0.3;
const DISMISS_SUPPRESSION_DAYS = 7;

interface PopupState {
  status?: "dismissed" | "signedup";
  dismissedAt?: number;
  signedUpAt?: number;
}

function getPopupState(): PopupState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PopupState) : null;
  } catch {
    return null;
  }
}

function setPopupState(state: PopupState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  sessionStorage.setItem(SESSION_KEY, "true");
}

function isSuppressed(): boolean {
  const state = getPopupState();
  if (!state) return false;
  if (state.status === "signedup") return true;
  if (state.status === "dismissed" && state.dismissedAt) {
    const ms = DISMISS_SUPPRESSION_DAYS * 24 * 60 * 60 * 1000;
    return Date.now() - state.dismissedAt < ms;
  }
  return false;
}

function isSessionShown(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(SESSION_KEY) === "true";
}

function isExcludedPath(pathname: string): boolean {
  const excluded = ["/checkout", "/order-confirmation", "/admin", "/login", "/track-order"];
  return excluded.some((path) => pathname.startsWith(path));
}

function randomDelay(): number {
  return Math.floor(POPUP_MIN_DELAY + Math.random() * (POPUP_MAX_DELAY - POPUP_MIN_DELAY));
}

export default function WelcomePopup() {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const triggerRef = useRef<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const hasTrackedView = useRef(false);

  useEffect(() => {
    if (isExcludedPath(pathname) || isSuppressed() || isSessionShown()) return;

    const isMobile = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let scrollHandler: (() => void) | undefined;
    let exitHandler: ((event: MouseEvent) => void) | undefined;

    function show() {
      if (visible || isSuppressed() || isSessionShown()) return;
      previouslyFocused.current = document.activeElement as HTMLElement;
      setVisible(true);
      sessionStorage.setItem(SESSION_KEY, "true");
    }

    function handleScroll() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const ratio = docHeight > 0 ? scrollTop / docHeight : 0;
      if (ratio >= MOBILE_SCROLL_THRESHOLD) {
        show();
        cleanup();
      }
    }

    function handleExit(event: MouseEvent) {
      if (event.clientY <= 0) {
        show();
        cleanup();
      }
    }

    function cleanup() {
      if (timer) clearTimeout(timer);
      if (scrollHandler) window.removeEventListener("scroll", scrollHandler);
      if (exitHandler) document.removeEventListener("mouseout", exitHandler as EventListener);
    }

    if (isMobile) {
      scrollHandler = handleScroll;
      window.addEventListener("scroll", scrollHandler, { passive: true });
      timer = setTimeout(show, POPUP_MAX_DELAY);
    } else {
      timer = setTimeout(show, randomDelay());
      exitHandler = handleExit;
      document.addEventListener("mouseout", exitHandler as EventListener);
    }

    return cleanup;
  }, [pathname, visible]);

  useEffect(() => {
    if (visible && !hasTrackedView.current) {
      hasTrackedView.current = true;
      trackMarketing("welcome_offer_view", { placement: "welcome_popup", page_path: pathname });
    }
  }, [visible, pathname]);

  useEffect(() => {
    if (visible && panelRef.current) {
      const input = inputRef.current || panelRef.current.querySelector<HTMLElement>("input, button");
      input?.focus();
    }
  }, [visible]);

  useEffect(() => {
    if (!visible) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        close();
        return;
      }
      if (event.key === "Tab" && panelRef.current) {
        const focusable = Array.from(
          panelRef.current.querySelectorAll<HTMLElement>(
            'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => !el.hasAttribute("disabled") && el.offsetParent !== null);
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [visible]);

  function close() {
    setVisible(false);
    previouslyFocused.current?.focus();
  }

  function dismiss() {
    setPopupState({ status: "dismissed", dismissedAt: Date.now() });
    trackMarketing("welcome_offer_dismiss", { placement: "welcome_popup" });
    close();
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!email.trim() || status === "submitting") return;
    setStatus("submitting");
    setMessage("");
    trackMarketing("welcome_offer_submit", { placement: "welcome_popup" });

    const result = await createWelcomeSignup(email.trim(), "popup", pathname);

    if (result.ok) {
      setStatus("success");
      setPopupState({ status: "signedup", signedUpAt: Date.now() });
      trackMarketing("welcome_offer_success", { placement: "welcome_popup" });
    } else {
      setStatus("error");
      setMessage(result.message);
      trackMarketing("welcome_offer_error", { placement: "welcome_popup", failure_reason: result.message });
    }
  }

  async function handleResend() {
    if (resendStatus === "sending" || !email.trim()) return;
    setResendStatus("sending");
    const result = await resendWelcomeCode(email.trim());
    if (result.ok) {
      setResendStatus("sent");
      trackMarketing("welcome_offer_resend", { placement: "welcome_popup" });
    } else {
      setResendStatus("error");
    }
  }

  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transition}
            className="fixed inset-0 z-[110] bg-ink/40 backdrop-blur-sm"
            onClick={dismiss}
            aria-hidden="true"
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Welcome offer"
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={transition}
            className="fixed left-1/2 top-1/2 z-[120] w-[calc(100%-32px)] max-w-md -translate-x-1/2 -translate-y-1/2 bg-pure p-8 md:p-10 text-center shadow-2xl"
          >
            <button
              type="button"
              ref={triggerRef as React.RefObject<HTMLButtonElement>}
              onClick={dismiss}
              aria-label="Close welcome offer"
              className="absolute right-4 top-4 h-8 w-8 flex items-center justify-center text-ink hover:text-gold transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>

            {status === "success" ? (
              <div className="pt-6">
                <div className="mx-auto h-12 w-12 rounded-full bg-gold/10 flex items-center justify-center mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#BFA15F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </div>
                <p className="text-xs font-medium tracking-[0.2em] uppercase text-stone-light">Welcome to KHAYAL</p>
                <h3 className="mt-3 font-serif-display text-ink text-2xl md:text-3xl font-medium leading-tight">Your Welcome Code Is on Its Way</h3>
                <p className="mt-4 text-stone text-sm leading-relaxed">
                  Check your inbox for your personal 5% discount code. Use the same email address at checkout to redeem it.
                </p>
                <p className="mt-2 text-stone-light text-xs">Can&apos;t find it? Check your spam or promotions folder.</p>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendStatus === "sending" || resendStatus === "sent"}
                  className="mt-6 text-gold text-sm hover:text-gold-light underline disabled:opacity-60 disabled:no-underline"
                >
                  {resendStatus === "sending" ? "Resending..." : resendStatus === "sent" ? "Email resent" : "Resend Email"}
                </button>
              </div>
            ) : (
              <>
                <p className="text-xs font-medium tracking-[0.2em] uppercase text-stone-light">Welcome to KHAYAL</p>
                <h3 className="mt-4 font-serif-display text-ink text-3xl md:text-4xl font-medium leading-tight">
                  Enjoy 5% Off Your First Order
                </h3>
                <p className="mt-4 text-stone text-sm leading-relaxed">
                  Enter your email and we&apos;ll send you a personal welcome code for 5% off your first KHAYAL order.
                </p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-3 text-left">
                  <label htmlFor="welcome-popup-email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="welcome-popup-email"
                    ref={inputRef}
                    type="email"
                    data-clarity-mask="true"
                    required
                    disabled={status === "submitting"}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full bg-cream border border-border px-4 py-3 text-sm text-ink placeholder:text-stone-light focus:border-gold focus:outline-none transition-colors disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="w-full bg-ink text-pure px-4 py-3 text-xs font-medium tracking-[0.15em] uppercase hover:bg-gold transition-colors disabled:opacity-60"
                  >
                    {status === "submitting" ? "Sending..." : "Send My 5% Code"}
                  </button>
                  {status === "error" && message && (
                    <p className="text-sale text-xs mt-2">{message}</p>
                  )}
                </form>
                <p className="mt-4 text-[11px] text-stone-light leading-relaxed">
                  By signing up, you agree to receive KHAYAL updates and offers. You can unsubscribe at any time.
                </p>
                <button
                  type="button"
                  onClick={dismiss}
                  className="mt-5 text-xs text-stone-light underline hover:text-ink transition-colors"
                >
                  Maybe Later
                </button>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
