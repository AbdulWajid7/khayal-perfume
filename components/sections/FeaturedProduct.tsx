import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "@/components/ui/AddToCartButton";
import Reveal from "@/components/ui/Reveal";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types/product";

export default function FeaturedProduct({ product }: { product: Product }) {
  const image = product.featuredImage || product.images[0];
  const price = Number(product.priceRange.minVariantPrice.amount);
  const compareAt = product.compareAtPriceRange ? Number(product.compareAtPriceRange.maxVariantPrice.amount) : null;
  const scentFamily = product.metafields.find((field) => field.key === "scent_family")?.value;

  return (
    <section className="overflow-hidden bg-purple-deep py-24 text-ivory md:py-32" aria-labelledby="featured-product-title">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 md:grid-cols-2 md:px-10 lg:gap-24 lg:px-14">
        <Reveal>
          <div className="group relative mx-auto aspect-[4/5] w-full max-w-xl overflow-hidden bg-noir">
            {image && <Image src={image.url} alt={image.altText || `${product.title} by KHAYAL`} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.025]" loading="lazy" />}
            <div className="absolute inset-0 bg-gradient-to-t from-noir/40 via-transparent to-transparent" />
            <div className="absolute inset-x-[15%] bottom-0 h-px bg-gradient-to-r from-transparent via-champagne/55 to-transparent" aria-hidden="true" />
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="max-w-lg">
            <p className="text-[10px] uppercase tracking-[0.3em] text-champagne">Featured fragrance</p>
            {scentFamily && <p className="mt-6 text-xs uppercase tracking-[0.2em] text-ivory/45">{scentFamily}</p>}
            <h2 id="featured-product-title" className="mt-3 font-serif-display text-4xl leading-tight md:text-6xl">{product.title}</h2>
            <p className="mt-6 line-clamp-4 text-sm leading-7 text-ivory/65 md:text-base">{product.description}</p>
            <div className="mt-7 flex items-baseline gap-3">
              <span className="text-xl text-champagne">{formatPrice(price, "PKR")}</span>
              {compareAt && compareAt > price && <span className="text-sm text-ivory/35 line-through">{formatPrice(compareAt, "PKR")}</span>}
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <AddToCartButton product={product} fullWidth className="min-h-12 rounded-none bg-champagne text-noir hover:bg-ivory" />
              <Link href={`/shop/${product.handle}`} className="btn-premium-ghost">Discover the scent</Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
