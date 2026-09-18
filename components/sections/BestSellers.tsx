"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import Reveal from "@/components/ui/Reveal";
import ProductCard from "@/components/ui/ProductCard";
import type { Product } from "@/types/product";

interface BestSellersProps {
  products: Product[];
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
          <div className="mb-12">
            <span className="eyebrow">Customer Favourites</span>
            <h2 className="mt-3 font-serif-display text-ink text-[32px] md:text-[40px] font-medium tracking-tight">
              Best Sellers
            </h2>
            <p className="mt-2 text-stone max-w-md">
              The fragrances our customers reach for again and again.
            </p>
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
