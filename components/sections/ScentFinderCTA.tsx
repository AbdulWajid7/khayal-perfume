"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Reveal from "@/components/ui/Reveal";
import RevealMask from "@/components/ui/RevealMask";

export default function ScentFinderCTA() {
  return (
    <section className="relative py-20 md:py-28 bg-cream overflow-hidden">
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_rgba(191,161,95,0.08),_transparent_50%),radial-gradient(circle_at_80%_70%,_rgba(122,59,154,0.06),_transparent_50%)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
        <Reveal>
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 items-center">
            <div className="text-center lg:text-left">
              <span className="eyebrow">A 2-Minute Ritual</span>
              <RevealMask
                as="h2"
                className="mt-3 font-serif-display text-ink text-[32px] md:text-[40px] font-medium tracking-tight leading-tight"
              >
                Not sure which scent is yours?
              </RevealMask>
              <p className="mt-4 text-stone text-base max-w-xl mx-auto lg:mx-0">
                Answer five questions about mood, occasion, and intensity — we&apos;ll match you
                with the Khayal fragrance that feels like an extension of yourself.
              </p>
              <div className="mt-8 flex justify-center lg:justify-start">
                <Link
                  href="/scent-finder"
                  className="inline-flex items-center justify-center bg-gold text-pure rounded-lg px-7 py-3.5 text-sm font-medium hover:bg-gold-light transition-colors"
                >
                  Find Your Scent
                </Link>
              </div>
            </div>

            <div className="hidden lg:flex justify-center">
              <div className="relative h-56 w-56 flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border border-gold/30"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-4 rounded-full border border-gold/20"
                />
                <div className="absolute inset-8 rounded-full border border-gold/10" />
                <span className="relative font-serif-display text-gold text-5xl font-medium tracking-wide">K</span>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
