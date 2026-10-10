import ProductCard from "@/components/ui/ProductCard";
import type { Product } from "@/types/product";

export default function RelatedProducts({ products, title = "Related fragrances" }: { products: Product[]; title?: string }) {
  if (!products.length) return null;

  return (
    <section className="mt-20 pt-16 border-t border-border">
      <span className="eyebrow">You may also love</span>
      <h2 className="mt-3 mb-10 font-serif-display text-ink text-[32px] md:text-[44px] font-normal">
        {title}
      </h2>
      <div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
