"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/hooks/useCart";

const navLinks = [
  { label: "Shop", href: "/shop" },
  { label: "Men", href: "/shop?category=men" },
  { label: "Women", href: "/shop?category=women" },
  { label: "Unisex", href: "/shop?category=unisex" },
  { label: "Journal", href: "/journal" },
  { label: "Story", href: "/story" },
];

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function BagIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
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
      className={className}
      aria-hidden="true"
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
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
      className={className}
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const { openCart, totalItems } = useCart();

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;
      setScrolled(y > 20);
      setHidden(y > 140 && y > lastY.current);
      lastY.current = y;
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={[
          "fixed top-8 left-0 right-0 z-50 h-20 transition-all duration-300",
          scrolled
            ? "bg-pure/95 border-b border-border shadow-sm backdrop-blur-md"
            : "bg-transparent",
          hidden && !mobileOpen ? "-translate-y-full opacity-0" : "translate-y-0",
        ].join(" ")}
      >
        <nav className="mx-auto max-w-7xl h-full px-4 md:px-8 lg:px-12 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3"
            aria-label="Khayal home"
          >
            <div className="relative h-12 w-12 rounded-full overflow-hidden shadow-md">
              <Image
                src="/images/logo.png"
                alt="Khayal Perfume"
                fill
                className="object-cover"
                sizes="48px"
                priority
              />
            </div>
            <span className="hidden sm:block text-ink text-sm font-medium tracking-[0.2em] uppercase">
              Khayal
            </span>
          </Link>

          <ul className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="link-hover-gold text-ink text-[13px] font-medium tracking-wide uppercase transition-colors hover:text-gold"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-5">
            <button
              type="button"
              aria-label="Search"
              className="text-ink hover:text-gold transition-colors p-1"
            >
              <SearchIcon />
            </button>
            <button
              type="button"
              aria-label="Open cart"
              className="relative text-ink hover:text-gold transition-colors p-1"
              onClick={openCart}
            >
              <BagIcon />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold text-pure text-[10px] font-medium px-1">
                  {totalItems}
                </span>
              )}
            </button>
            <button
              type="button"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              className="lg:hidden text-ink hover:text-gold transition-colors p-1"
              onClick={() => setMobileOpen(true)}
            >
              <MenuIcon />
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] bg-ink/20 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="fixed top-0 right-0 bottom-0 z-[70] w-full max-w-sm bg-pure border-l border-border lg:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation"
            >
              <div className="flex items-center justify-between h-20 px-6 border-b border-border">
                <span className="text-ink text-sm font-medium tracking-[0.2em] uppercase">
                  Khayal
                </span>
                <button
                  type="button"
                  aria-label="Close menu"
                  className="text-ink hover:text-gold transition-colors p-1"
                  onClick={() => setMobileOpen(false)}
                >
                  <CloseIcon />
                </button>
              </div>
              <ul className="flex flex-col p-6 gap-6">
                {navLinks.map((link, index) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 + 0.1 }}
                  >
                    <Link
                      href={link.href}
                      className="block text-ink text-2xl font-serif-display font-medium tracking-wide hover:text-gold transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
