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
    <section id="collection" className="relative py-20 md:py-28 bg-cream">
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <div>
              <span className="eyebrow">Signature Fragrances</span>
              <RevealMask as="h2" className="mt-3 font-serif-display text-ink text-[32px] md:text-[40px] font-medium tracking-tight">
                The Collection
              </RevealMask>
              <p className="mt-2 text-stone text-base max-w-md">
                Crafted for those who seek the extraordinary
              </p>
            </div>
            <Link
              href="/shop"
              className="group inline-flex items-center gap-2 text-gold text-sm font-medium hover:text-gold-light transition-colors"
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
