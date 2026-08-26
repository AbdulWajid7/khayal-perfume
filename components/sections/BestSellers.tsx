"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import Reveal from "@/components/ui/Reveal";
import ProductCard from "@/components/ui/ProductCard";
import type { Product } from "@/types/product";

interface BestSellersProps {
  products: Product[];
}

function useCountdown(target: Date) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const diff = Math.max(0, target.getTime() - now.getTime());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds, expired: diff === 0 };
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="min-w-[44px] h-10 md:h-12 flex items-center justify-center rounded bg-pure border border-border text-ink text-sm md:text-base font-medium tabular-nums">
        {value.toString().padStart(2, "0")}
      </div>
      <span className="text-[10px] uppercase tracking-wider text-stone mt-1">{label}</span>
    </div>
  );
}

function Countdown() {
  // Fixed promotional end date: 7 days from first render
  const [target] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setHours(23, 59, 59, 999);
    return d;
  });
  const { days, hours, minutes, seconds, expired } = useCountdown(target);

  if (expired) return null;

  return (
    <div className="flex items-center gap-2 md:gap-3">
      <CountdownUnit value={days} label="Days" />
      <span className="text-stone-light">:</span>
      <CountdownUnit value={hours} label="Hrs" />
      <span className="text-stone-light">:</span>
      <CountdownUnit value={minutes} label="Min" />
      <span className="text-stone-light">:</span>
      <CountdownUnit value={seconds} label="Sec" />
    </div>
  );
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function BestSellers({ products }: BestSellersProps) {
  const displayProducts = products.slice(0, 4);

  return (
    <section className="py-20 md:py-28 bg-cream-dark border-y border-border">
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
        <Reveal>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-12">
            <div>
              <span className="eyebrow">Limited Time</span>
              <h2 className="mt-3 font-serif-display text-ink text-[32px] md:text-[40px] font-medium tracking-tight">
                Best Sellers
              </h2>
              <p className="mt-2 text-stone max-w-md">
                Our most-loved fragrances, now with exclusive seasonal savings.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="text-sm text-stone">
                <span className="text-sale font-medium">Sale ends in</span>
              </div>
              <Countdown />
            </div>
          </div>
        </Reveal>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          {displayProducts.map((product) => (
            <motion.div key={product.id} variants={itemVariants}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-12 text-center">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center border border-ink/30 text-ink rounded-lg px-8 py-3 text-sm font-medium hover:border-gold hover:text-gold transition-colors"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}
