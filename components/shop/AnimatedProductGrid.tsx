"use client";

import { motion, useReducedMotion } from "framer-motion";
import ProductCard from "@/components/ui/ProductCard";
import type { Product } from "@/types/product";

/** Product grid where cards rise in one after another (on load and on every filter change). */
export default function AnimatedProductGrid({ products }: { products: Product[] }) {
  const reduce = useReducedMotion();
  return (
    <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 [perspective:1200px]">
      {products.map((product, i) => (
        <motion.div
          key={product.id}
          initial={reduce ? false : { opacity: 0, y: 36, rotateX: 8 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.8, delay: Math.min(i, 11) * 0.07, ease: [0.22, 1, 0.36, 1] }}
        >
          <ProductCard product={product} />
        </motion.div>
      ))}
    </div>
  );
}
