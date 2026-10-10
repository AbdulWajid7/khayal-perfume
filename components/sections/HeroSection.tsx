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
      className="relative h-[100svh] min-h-[640px] flex items-center overflow-hidden"
    >
      {/* Full-bleed editorial photograph with slow Ken Burns drift */}
      <motion.div
        style={prefersReducedMotion ? undefined : { y: imageY, scale: imageScale }}
        className="absolute inset-0"
      >
        <div className={prefersReducedMotion ? "absolute inset-0" : "absolute inset-0 hero-kenburns"}>
          <Image
            src="/images/homepage.png"
            alt="Khayal perfume collection in golden light"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
      </motion.div>

      {/* Soft light overlays for legibility */}
      <div
        className="absolute inset-0 z-[1] bg-gradient-to-r from-cream/25 via-cream/10 to-transparent"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 z-[1] bg-gradient-to-t from-cream via-cream/20 to-cream/40"
        aria-hidden="true"
      />

      {/* Ambient drifting mist */}
      {!prefersReducedMotion && <div className="hero-mist z-[2]" aria-hidden="true" />}

      <motion.div
        style={prefersReducedMotion ? undefined : { y: contentY, opacity: contentOpacity }}
        className="relative z-10 w-full mx-auto max-w-7xl px-4 md:px-8 lg:px-12 pt-20"
      >
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-4 mb-8"
          >
            <span className="h-px w-10 bg-gold" aria-hidden="true" />
            <span className="text-[11px] tracking-[0.32em] uppercase text-gold font-medium">
              Premium Niche Collection — Karachi
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif-display text-ink text-[46px] md:text-[68px] lg:text-[88px] font-medium tracking-tight leading-[1.0]"
          >
            Some fragrances
            <br />
            <span className="text-gold-shimmer">become memories.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 text-stone text-lg md:text-xl font-light max-w-md leading-relaxed"
          >
            Khayal means a thought, a memory, a feeling that stays with you. Long-lasting
            eau de parfums, made in Karachi and delivered across Pakistan.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-start gap-4"
          >
            <Link
              href="/shop"
              className="btn-sweep inline-flex items-center justify-center bg-gold text-pure px-9 py-4 text-[12px] font-medium tracking-[0.2em] uppercase"
            >
              Explore the Collection
            </Link>
            <Link
              href="/story"
              className="btn-sweep inline-flex items-center justify-center border border-ink/40 text-ink px-9 py-4 text-[12px] font-medium tracking-[0.2em] uppercase hover:border-gold transition-colors"
            >
              Our Story
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator — thin growing line */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-3 text-stone"
        aria-hidden="true"
      >
        <span className="text-[10px] tracking-[0.34em] uppercase">Scroll</span>
        <motion.span
          className="block w-px h-10 bg-stone/60 origin-top"
          animate={prefersReducedMotion ? undefined : { scaleY: [0.3, 1, 0.3] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  );
}
