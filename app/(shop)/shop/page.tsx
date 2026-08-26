import { getProducts } from "@/lib/products";
import ProductCard from "@/components/ui/ProductCard";

export const metadata = {
  title: "The Collection",
  description:
    "Explore Khayal's luxury niche perfume collection — oud, musk, floral, woody, and fresh unisex fragrances.",
};

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-cream">
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
        <h1 className="font-serif-display text-ink text-[40px] font-medium tracking-tight">
          The Collection
        </h1>
        <p className="mt-2 text-stone text-base max-w-2xl">
          Every Khayal fragrance is a composition of rare ingredients, slow craft, and
          imagination.
        </p>

        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
