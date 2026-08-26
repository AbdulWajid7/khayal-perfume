import ProductCard from "@/components/ui/ProductCard";
import type { Product } from "@/types/product";

export default function RelatedProducts({ products }: { products: Product[] }) {
  if (!products.length) return null;

  return (
    <section className="mt-20 pt-16 border-t border-border">
      <span className="eyebrow">You May Also Love</span>
      <h2 className="mt-3 font-serif-display text-ink text-[28px] md:text-[32px] font-medium tracking-tight mb-8">
        Related Fragrances
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
