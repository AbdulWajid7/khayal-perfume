import Link from "next/link";
import ProductCard from "@/components/ui/ProductCard";
import Reveal from "@/components/ui/Reveal";
import RevealMask from "@/components/ui/RevealMask";
import type { Product } from "@/types/product";

interface FeaturedCollectionProps {
  products: Product[];
}

export default function FeaturedCollection({ products }: FeaturedCollectionProps) {
  return (
    <section id="collection" className="relative py-20 md:py-32 bg-midnight">
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <div>
              <span className="eyebrow">Signature Fragrances</span>
              <RevealMask as="h2" className="mt-3 text-parchment text-[32px] md:text-[40px] font-medium tracking-[0.02em]">
                The Collection
              </RevealMask>
              <p className="mt-2 text-warm-taupe text-base max-w-md">
                Crafted for those who seek the extraordinary
              </p>
            </div>
            <Link
              href="/shop"
              className="group inline-flex items-center gap-2 text-oud-gold text-sm font-medium hover:opacity-90 transition-opacity"
            >
              View All
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <Reveal key={product.id} delay={index * 0.08}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
