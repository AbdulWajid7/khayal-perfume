"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { trackMarketing } from "@/lib/analytics";
import { motionTokens } from "@/lib/motion";

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "9%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 48]);

  return (
    <section ref={sectionRef} className="relative isolate min-h-[760px] overflow-hidden bg-noir text-ivory md:min-h-[820px]" aria-labelledby="home-hero-title">
      <motion.div
        style={reduceMotion ? undefined : { y: imageY }}
        initial={reduceMotion ? false : { filter: "brightness(.68) blur(3px)", scale: 1.025 }}
        animate={reduceMotion ? undefined : { filter: "brightness(1) blur(0px)", scale: 1 }}
        transition={{ duration: motionTokens.duration.cinematic, ease: motionTokens.ease.standard }}
        className="absolute inset-0 -top-[4%] h-[108%]"
      >
        <Image
          src="/images/homepage.png"
          alt="KHAYAL perfume collection illuminated in warm golden light"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[62%_center] md:object-center"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-r from-noir via-noir/72 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-noir via-transparent to-noir/35" />
      <div className="grain-overlay opacity-[0.035]" aria-hidden="true" />

      <motion.div style={reduceMotion ? undefined : { y: contentY }} className="relative mx-auto flex min-h-[760px] max-w-7xl items-end px-5 pb-20 pt-36 md:min-h-[820px] md:items-center md:px-10 md:pb-0 lg:px-14">
        <div className="max-w-2xl">
          <motion.p initial={reduceMotion ? false : { y: 12 }} animate={{ y: 0 }} transition={{ duration: 0.7 }} className="text-[11px] font-medium uppercase tracking-[0.34em] text-champagne">
            Khayal Parfum · Karachi
          </motion.p>
          <h1 id="home-hero-title" className="mt-5 font-serif-display text-[3.3rem] font-medium leading-[0.94] tracking-[-0.035em] text-ivory sm:text-6xl md:text-[5.7rem]">
            <motion.span initial={reduceMotion ? false : { y: 22 }} animate={{ y: 0 }} transition={{ duration: 0.9, delay: 0.08 }} className="block">
              Imagination,
            </motion.span>
            <motion.span initial={reduceMotion ? false : { y: 22 }} animate={{ y: 0 }} transition={{ duration: 0.9, delay: 0.16 }} className="block text-champagne">
              Bottled.
            </motion.span>
          </h1>
          <motion.p initial={reduceMotion ? false : { y: 16 }} animate={{ y: 0 }} transition={{ duration: 0.8, delay: 0.24 }} className="mt-6 max-w-md text-base leading-7 text-ivory/72 md:text-lg">
            Fragrances created to become part of your memory.
          </motion.p>
          <motion.div initial={reduceMotion ? false : { y: 16 }} animate={{ y: 0 }} transition={{ duration: 0.8, delay: 0.32 }} className="mt-8 flex flex-wrap gap-3">
            <Link href="/shop" onClick={() => trackMarketing("hero_primary_cta_click", { cta: "shop_fragrances" })} className="btn-premium-solid">
              Shop Fragrances
            </Link>
            <Link href="/story" onClick={() => trackMarketing("hero_secondary_cta_click", { cta: "discover_khayal" })} className="btn-premium-ghost">
              Discover KHAYAL
            </Link>
          </motion.div>
        </div>
      </motion.div>

      <div className="absolute bottom-7 left-1/2 z-10 -translate-x-1/2 text-center text-[9px] uppercase tracking-[0.3em] text-ivory/50" aria-hidden="true">
        <span>Scroll to discover</span>
        <span className="mx-auto mt-3 block h-10 w-px bg-gradient-to-b from-champagne to-transparent" />
      </div>
    </section>
  );
}
