"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Reveal from "@/components/ui/Reveal";
import { trackMarketing } from "@/lib/analytics";

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
    <section className="bg-noir py-24 text-ivory md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-14">
        <Reveal className="mb-12 max-w-2xl md:mb-16">
          <span className="text-[10px] uppercase tracking-[0.3em] text-champagne">Three expressions</span>
          <h2 className="mt-4 font-serif-display text-4xl font-medium tracking-tight md:text-6xl">
            Find Your Signature
          </h2>
          <p className="mt-5 max-w-lg text-sm leading-7 text-ivory/55 md:text-base">
            Explore KHAYAL by the way you want your fragrance to feel.
          </p>
        </Reveal>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 gap-3 md:grid-cols-3"
        >
          {categories.map((category) => (
            <motion.div key={category.title} variants={itemVariants}>
              <Link
                href={category.href}
                onClick={() => trackMarketing("collection_select", { collection_name: category.title.toLowerCase() })}
                className="group relative block aspect-[4/5] overflow-hidden bg-purple-panel focus-visible:outline-champagne md:aspect-[3/5]"
              >
                <Image
                  src={category.image}
                  alt={category.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.045] group-focus-visible:scale-[1.045]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/15 to-transparent transition-opacity duration-500 group-hover:opacity-90" />
                <div className="absolute inset-0 flex flex-col justify-end p-7 md:p-8">
                  <h3 className="font-serif-display text-ivory text-3xl md:text-4xl font-medium transition-transform duration-500 md:group-hover:-translate-y-1">
                    {category.title}
                  </h3>
                  <p className="mt-2 max-w-xs text-sm text-ivory/70 transition-all duration-500 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-visible:translate-y-0 md:group-focus-visible:opacity-100">
                    {category.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-champagne">
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
