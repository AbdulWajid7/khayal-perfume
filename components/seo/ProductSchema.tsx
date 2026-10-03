import type { ProductDetails } from "@/types/product";

const BASE_URL = "https://www.khayalparfum.com";

export default function ProductSchema({ product }: { product: ProductDetails }) {
  const images = product.images.length
    ? product.images.map((img) => img.url)
    : product.featuredImage
      ? [product.featuredImage.url]
      : [];
  const productUrl = `${BASE_URL}/shop/${product.handle}`;

  const additionalProperty = [
    product.scentFamily && { name: "Scent Family", value: product.scentFamily },
    product.concentration && { name: "Concentration", value: product.concentration },
    product.sizeMl && { name: "Size", value: `${product.sizeMl}ml` },
    product.longevity && { name: "Longevity", value: product.longevity },
    product.sillage && { name: "Sillage", value: product.sillage },
    product.occasion && { name: "Occasion", value: product.occasion },
  ]
    .filter(Boolean)
    .map((p) => ({
      "@type": "PropertyValue",
      name: (p as { name: string }).name,
      value: (p as { value: string }).value,
    }));

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}#product`,
    name: product.title,
    url: productUrl,
    image: images,
    description: product.metaDescription || product.description,
    sku: product.variants[0]?.sku || product.mpn || undefined,
    mpn: product.mpn || product.variants[0]?.sku || undefined,
    brand: {
      "@type": "Brand",
      name: "Khayal",
    },
    category: "Health & Beauty > Personal Care > Cosmetics > Fragrance",
    keywords: [product.focusKeyword, ...(product.keywords || []), ...product.tags]
      .filter((k): k is string => Boolean(k))
      .join(", ") || undefined,
    ...(additionalProperty.length ? { additionalProperty } : {}),
    offers: product.variants.map((variant) => ({
      "@type": "Offer",
      url: productUrl,
      sku: variant.sku || undefined,
      price: variant.price.amount,
      priceCurrency: variant.price.currencyCode,
      priceValidUntil: new Date(new Date().getFullYear() + 1, 11, 31).toISOString().slice(0, 10),
      itemCondition: "https://schema.org/NewCondition",
      availability: variant.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Khayal Parfum",
        url: BASE_URL,
      },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "PK",
        },
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0",
          currency: "PKR",
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 0,
            maxValue: 1,
            unitCode: "d",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 4,
            unitCode: "d",
          },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "PK",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 1,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/ReturnFeesCustomerResponsibility",
        description: `Every order includes a separate tester. If the fragrance is unsuitable, contact KHAYAL on the same day of delivery with the full-size bottle unopened and sealed. Full policy: ${BASE_URL}/shipping`,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
