"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useCart } from "@/hooks/useCart";
import { motionTokens } from "@/lib/motion";

const navLinks = [
  { label: "Collection", href: "/shop" },
  { label: "Men", href: "/shop?category=men" },
  { label: "Women", href: "/shop?category=women" },
  { label: "Unisex", href: "/shop?category=unisex" },
  { label: "Scent Finder", href: "/scent-finder" },
  { label: "Journal", href: "/journal" },
  { label: "Our Story", href: "/story" },
];

function BagIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M6 8h12l1 13H5L6 8Z" />
      <path d="M9 9V6a3 3 0 0 1 6 0v3" />
    </svg>
  );
}

function MenuIcon({ open }: { open: boolean }) {
  return (
    <span className="relative block h-5 w-6" aria-hidden="true">
      <span className={`absolute left-0 top-1/2 h-px w-6 bg-current transition-transform ${open ? "rotate-45" : "-translate-y-1.5"}`} />
      <span className={`absolute left-0 top-1/2 h-px w-6 bg-current transition-transform ${open ? "-rotate-45" : "translate-y-1.5"}`} />
    </span>
  );
}

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const drawerRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const { openCart, totalItems } = useCart();

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      setScrolled(y > 28);
      setHidden(y > 180 && y > lastY.current);
      lastY.current = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusable = drawerRef.current?.querySelectorAll<HTMLElement>('a[href],button:not([disabled])');
    focusable?.[0]?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileOpen(false);
      if (event.key !== "Tab" || !focusable?.length) return;
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

    const menuButton = menuButtonRef.current;
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      menuButton?.focus();
    };
  }, [mobileOpen]);

  return (
    <>
      <header
        className={`fixed left-0 right-0 top-8 z-50 border-b text-ivory transition-[height,background-color,border-color,transform,opacity] duration-300 ${
          scrolled ? "h-16 border-white/10 bg-noir/94 backdrop-blur-md" : "h-20 border-transparent bg-noir/18"
        } ${hidden && !mobileOpen ? "-translate-y-[calc(100%+2rem)] opacity-0" : "translate-y-0 opacity-100"}`}
      >
        <nav className="mx-auto flex h-full max-w-7xl items-center justify-between px-5 md:px-10 lg:px-14" aria-label="Primary navigation">
          <Link href="/" className="flex min-h-11 items-center gap-3" aria-label="KHAYAL home">
            <span className={`relative overflow-hidden rounded-full border border-champagne/35 transition-[width,height] ${scrolled ? "h-9 w-9" : "h-11 w-11"}`}>
              <Image src="/images/logo.png" alt="" fill sizes="44px" className="object-cover" priority />
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.28em]">KHAYAL</span>
          </Link>

          <ul className="hidden items-center gap-7 lg:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="link-hover-gold py-3 text-[11px] font-medium uppercase tracking-[0.14em] text-ivory/78 transition-colors hover:text-ivory">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <button type="button" onClick={openCart} className="relative flex h-11 w-11 items-center justify-center text-ivory transition-colors hover:text-champagne" aria-label={`Open cart${totalItems ? `, ${totalItems} items` : ""}`}>
              <BagIcon />
              {totalItems > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-champagne px-1 text-[9px] font-bold text-noir">{totalItems}</span>}
            </button>
            <button ref={menuButtonRef} type="button" aria-label={mobileOpen ? "Close menu" : "Open menu"} aria-expanded={mobileOpen} aria-controls="mobile-navigation" className="flex h-11 w-11 items-center justify-center text-ivory lg:hidden" onClick={() => setMobileOpen((value) => !value)}>
              <MenuIcon open={mobileOpen} />
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.button type="button" aria-label="Close menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} className="fixed inset-0 z-[60] bg-noir/70 backdrop-blur-sm lg:hidden" />
            <motion.div
              ref={drawerRef}
              id="mobile-navigation"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: motionTokens.duration.fast, ease: motionTokens.ease.responsive }}
              className="fixed inset-y-0 right-0 z-[70] flex w-[min(88vw,390px)] flex-col bg-purple-deep px-7 pb-8 pt-7 text-ivory shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-6">
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-champagne">KHAYAL</span>
                <button type="button" onClick={() => setMobileOpen(false)} className="flex h-11 w-11 items-center justify-center" aria-label="Close menu"><MenuIcon open /></button>
              </div>
              <ul className="mt-8 flex flex-col">
                {navLinks.map((link, index) => (
                  <motion.li key={link.href} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.035 }}>
                    <Link href={link.href} onClick={() => setMobileOpen(false)} className="block border-b border-white/8 py-4 font-serif-display text-2xl text-ivory/90 transition-colors hover:text-champagne">
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <p className="mt-auto text-xs leading-6 text-ivory/50">Crafted in Karachi · Delivered across Pakistan</p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
