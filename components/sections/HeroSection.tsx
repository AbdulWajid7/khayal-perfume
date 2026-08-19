"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

const ParticleMist = dynamic(
  () => import("@/components/three/ParticleMist"),
  { ssr: false }
);

function ScrollIndicator() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    function onScroll() {
      if (window.scrollY > 50) setVisible(false);
      else setVisible(true);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.4 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-warm-taupe"
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
  );
}

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  return (
    <section ref={sectionRef} className="relative h-screen min-h-[640px] flex items-end overflow-hidden">
      {/* Full-bleed editorial photograph, drifting slowly as the page scrolls */}
      <motion.div
        style={prefersReducedMotion ? undefined : { y: imageY, scale: imageScale }}
        className="absolute inset-0"
      >
        <Image
          src="/images/hero-bottle.jpg"
          alt="Khayal signature perfume bottle in golden light"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_30%]"
        />
      </motion.div>

      {/* Atmospheric gold dust drifting over the photograph */}
      <ErrorBoundary fallback={null}>
        <Suspense fallback={null}>
          <div className="absolute inset-0 z-[1] mix-blend-screen">
            <ParticleMist />
          </div>
        </Suspense>
      </ErrorBoundary>

      {/* Cinematic gradients for legibility */}
      <div
        className="absolute inset-0 z-[2] bg-gradient-to-t from-midnight via-midnight/55 to-midnight/10"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 z-[2] bg-gradient-to-r from-midnight/70 via-transparent to-midnight/40"
        aria-hidden="true"
      />
      <div className="grain-overlay z-[2]" aria-hidden="true" />

      {/* Corner marks for editorial framing */}
      <div className="hidden md:flex absolute top-28 left-8 lg:left-12 z-10 flex-col gap-1 text-parchment/70 pointer-events-none">
        <span className="text-[10px] tracking-[0.3em] uppercase">Est. 2026</span>
        <span className="text-[10px] tracking-[0.3em] uppercase">New Delhi</span>
      </div>
      <div className="hidden md:flex absolute top-28 right-8 lg:right-12 z-10 flex-col gap-1 text-parchment/70 pointer-events-none text-right">
        <span className="text-[10px] tracking-[0.3em] uppercase">Niche Perfumery</span>
        <span className="text-[10px] tracking-[0.3em] uppercase">Attar &amp; Eau de Parfum</span>
      </div>

      <motion.div
        style={prefersReducedMotion ? undefined : { y: contentY, opacity: contentOpacity }}
        className="relative z-10 w-full mx-auto max-w-7xl px-4 md:px-8 lg:px-12 pb-20 md:pb-28"
      >
        <div className="max-w-2xl">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 border border-oud-gold/40 rounded-full px-4 py-1.5 text-[11px] tracking-[0.2em] uppercase text-oud-gold mb-6"
          >
            The Collection — Now Live
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-parchment text-[56px] md:text-[84px] lg:text-[104px] font-medium tracking-[6px] lg:tracking-[8px] leading-[0.92]"
          >
            KHAYAL
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 text-parchment/80 text-lg md:text-xl font-light max-w-md"
          >
            Where imagination becomes fragrance
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-9 flex flex-col sm:flex-row items-start gap-4"
          >
            <a
              href="#collection"
              className="inline-flex items-center justify-center bg-oud-gold text-midnight rounded-lg px-7 py-3.5 text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Explore Collection
            </a>
            <a
              href="/story"
              className="inline-flex items-center justify-center border border-parchment/40 text-parchment rounded-lg px-7 py-3.5 text-sm font-medium hover:border-oud-gold hover:text-oud-gold transition-colors"
            >
              Discover the Craft
            </a>
          </motion.div>
        </div>
      </motion.div>

      <ScrollIndicator />
    </section>
  );
}
