import type { ProductDetails } from "@/types/product";

export default function ProductSchema({ product }: { product: ProductDetails }) {
  const images = product.images.length
    ? product.images.map((img) => img.url)
    : product.featuredImage
      ? [product.featuredImage.url]
      : [];

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: images,
    description: product.description,
    brand: {
      "@type": "Brand",
      name: "Khayal",
    },
    sku: product.variants[0]?.sku || undefined,
    offers: product.variants.map((variant) => ({
      "@type": "Offer",
      price: variant.price.amount,
      priceCurrency: variant.price.currencyCode,
      availability: variant.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `https://www.khayalparfum.com/shop/${product.handle}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
