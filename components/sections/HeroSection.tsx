"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative h-[calc(100vh-32px)] min-h-[640px] flex items-center overflow-hidden"
    >
      {/* Full-bleed editorial photograph */}
      <motion.div
        style={prefersReducedMotion ? undefined : { y: imageY, scale: imageScale }}
        className="absolute inset-0"
      >
        <Image
          src="/images/homepage.png"
          alt="Khayal perfume collection in golden light"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </motion.div>

      {/* Soft light overlay for legibility */}
      <div
        className="absolute inset-0 z-[1] bg-gradient-to-r from-cream/15 to-cream/0"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 z-[1] bg-gradient-to-t from-cream via-transparent to-cream/40"
        aria-hidden="true"
      />

      <motion.div
        style={prefersReducedMotion ? undefined : { y: contentY, opacity: contentOpacity }}
        className="relative z-10 w-full mx-auto max-w-7xl px-4 md:px-8 lg:px-12 pt-20"
      >
        <div className="max-w-2xl">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 border border-gold/50 rounded-full px-4 py-1.5 text-[11px] tracking-[0.2em] uppercase text-gold mb-6"
          >
            End of Season Sale
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif-display text-ink text-[48px] md:text-[72px] lg:text-[88px] font-medium tracking-tight leading-[0.95]"
          >
            Imagination,
            <br />
            <span className="text-gold-shimmer">Bottled.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 text-stone text-lg md:text-xl font-light max-w-md"
          >
            Discover niche perfumes and attars crafted for those who seek the extraordinary.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-9 flex flex-col sm:flex-row items-start gap-4"
          >
            <Link
              href="/shop"
              className="inline-flex items-center justify-center bg-gold text-pure rounded-lg px-8 py-4 text-sm font-medium hover:bg-gold-light transition-colors"
            >
              Shop Now
            </Link>
            <Link
              href="/story"
              className="inline-flex items-center justify-center border border-ink/30 text-ink rounded-lg px-8 py-4 text-sm font-medium hover:border-gold hover:text-gold transition-colors"
            >
              Discover the Craft
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-stone"
        aria-hidden="true"
      >
        <span className="text-[10px] tracking-[0.3em] uppercase">Scroll</span>
        <motion.svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <path d="M12 5v14M19 12l-7 7-7-7" />
        </motion.svg>
      </motion.div>
    </section>
  );
}
