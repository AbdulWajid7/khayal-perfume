"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Reveal from "@/components/ui/Reveal";

const categories = [
  {
    title: "Men",
    description: "Bold, structured, and commanding.",
    href: "/shop?category=men",
    image:
      "/images/category-men.png",
  },
  {
    title: "Women",
    description: "Floral, luminous, and unforgettable.",
    href: "/shop?category=women",
    image:
      "/images/category-women.png",
  },
  {
    title: "Unisex",
    description: "For anyone who wears intention.",
    href: "/shop?category=unisex",
    image:
      "/images/category-unisex.png",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function CategoryGrid() {
  return (
    <section className="py-20 md:py-28 bg-cream">
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
        <Reveal className="text-center max-w-2xl mx-auto mb-12">
          <span className="eyebrow">Shop by Collection</span>
          <h2 className="mt-3 font-serif-display text-ink text-[32px] md:text-[40px] font-medium tracking-tight">
            Find Your Signature
          </h2>
          <p className="mt-4 text-stone">
            Explore our curated collections for every mood, moment, and memory.
          </p>
        </Reveal>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {categories.map((category) => (
            <motion.div key={category.title} variants={itemVariants}>
              <Link
                href={category.href}
                className="group relative block aspect-[2/3] overflow-hidden rounded-2xl bg-cream-dark"
              >
                <Image
                  src={category.image}
                  alt={category.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/20 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                  <h3 className="font-serif-display text-pure text-3xl md:text-4xl font-medium">
                    {category.title}
                  </h3>
                  <p className="mt-2 text-pure/80 text-sm max-w-xs">
                    {category.description}
                  </p>
                  <span className="mt-4 inline-flex items-center text-gold text-sm font-medium gap-2">
                    Explore
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-transform group-hover:translate-x-1"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
