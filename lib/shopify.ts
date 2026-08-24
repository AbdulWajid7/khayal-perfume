import { createStorefrontApiClient } from "@shopify/storefront-api-client";
import type {
  Product,
  ProductDetails,
  ShopifyCart,
  CartLineInput,
  ShopifyImage,
  ProductVariant,
  ProductMetafield,
} from "@/types/product";

const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
const accessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

const hasCredentials = Boolean(
  storeDomain &&
    accessToken &&
    !storeDomain.startsWith("your-") &&
    !accessToken.startsWith("your-")
);

function formatErrors(errors: unknown): string {
  if (Array.isArray(errors)) {
    return errors.map((e) => (typeof e === "object" && e && "message" in e ? String((e as { message: unknown }).message) : String(e))).join(", ");
  }
  if (typeof errors === "object" && errors && "message" in errors) {
    return String((errors as { message: unknown }).message);
  }
  return String(errors);
}

const client = hasCredentials
  ? createStorefrontApiClient({
      storeDomain: storeDomain!,
      apiVersion: "2026-01",
      publicAccessToken: accessToken!,
    })
  : null;

// Fallback mock data when Shopify credentials are not configured
const MOCK_PRODUCTS: Product[] = [
  {
    id: "gid://shopify/Product/1",
    title: "Khayal Oud Imperial",
    handle: "khayal-oud-imperial",
    description:
      "A majestic oud composition for evening rituals. Deep, resinous, and unmistakably luxurious.",
    descriptionHtml:
      "<p>A majestic oud composition for evening rituals. Deep, resinous, and unmistakably luxurious.</p>",
    priceRange: { minVariantPrice: { amount: "18500.0", currencyCode: "PKR" } },
    featuredImage: {
      url: "/images/products/oud-imperial.svg",
      altText: "Khayal Oud Imperial perfume bottle",
    },
    images: [
      { url: "/images/products/oud-imperial.svg", altText: "Khayal Oud Imperial perfume bottle" },
    ],
    variants: [
      {
        id: "gid://shopify/ProductVariant/101",
        title: "50ml",
        price: { amount: "18500.0", currencyCode: "PKR" },
        availableForSale: true,
        sku: "OUD-IMP-50",
      },
      {
        id: "gid://shopify/ProductVariant/102",
        title: "100ml",
        price: { amount: "29500.0", currencyCode: "PKR" },
        availableForSale: true,
        sku: "OUD-IMP-100",
      },
    ],
    metafields: [
      { namespace: "custom", key: "scent_notes", value: JSON.stringify({ top: ["Saffron", "Bergamot"], heart: ["Oud", "Rose"], base: ["Amber", "Sandalwood"] }) },
      { namespace: "custom", key: "longevity", value: "10-12 hours" },
      { namespace: "custom", key: "occasion", value: "Evening, Special" },
      { namespace: "custom", key: "scent_family", value: "Oriental Woody" },
    ],
    tags: ["Oud", "Unisex", "Evening"],
    productType: "Eau de Parfum",
    vendor: "Khayal",
  },
  {
    id: "gid://shopify/Product/2",
    title: "Musk Al-Khayal",
    handle: "musk-al-khayal",
    description: "Soft white musk wrapped in velvety florals. Intimate, clean, and quietly seductive.",
    descriptionHtml: "<p>Soft white musk wrapped in velvety florals. Intimate, clean, and quietly seductive.</p>",
    priceRange: { minVariantPrice: { amount: "12500.0", currencyCode: "PKR" } },
    featuredImage: { url: "/images/products/musk-al-khayal.svg", altText: "Musk Al-Khayal perfume bottle" },
    images: [{ url: "/images/products/musk-al-khayal.svg", altText: "Musk Al-Khayal perfume bottle" }],
    variants: [
      {
        id: "gid://shopify/ProductVariant/201",
        title: "50ml",
        price: { amount: "12500.0", currencyCode: "PKR" },
        availableForSale: true,
        sku: "MSK-ALK-50",
      },
    ],
    metafields: [
      { namespace: "custom", key: "scent_notes", value: JSON.stringify({ top: ["Pear", "White Pepper"], heart: ["Musk", "Jasmine"], base: ["Cashmere Wood", "Vanilla"] }) },
      { namespace: "custom", key: "longevity", value: "8-10 hours" },
      { namespace: "custom", key: "occasion", value: "Daily, Office" },
      { namespace: "custom", key: "scent_family", value: "Floral Musk" },
    ],
    tags: ["Musk", "Unisex", "Daily"],
    productType: "Eau de Parfum",
    vendor: "Khayal",
  },
  {
    id: "gid://shopify/Product/3",
    title: "Rose & Smoke",
    handle: "rose-and-smoke",
    description: "Damascus rose suspended over smoldering incense. A floral with a dark soul.",
    descriptionHtml: "<p>Damascus rose suspended over smoldering incense. A floral with a dark soul.</p>",
    priceRange: { minVariantPrice: { amount: "15500.0", currencyCode: "PKR" } },
    featuredImage: { url: "/images/products/rose-smoke.svg", altText: "Rose and Smoke perfume bottle" },
    images: [{ url: "/images/products/rose-smoke.svg", altText: "Rose and Smoke perfume bottle" }],
    variants: [
      {
        id: "gid://shopify/ProductVariant/301",
        title: "50ml",
        price: { amount: "15500.0", currencyCode: "PKR" },
        availableForSale: true,
        sku: "ROS-SMK-50",
      },
    ],
    metafields: [
      { namespace: "custom", key: "scent_notes", value: JSON.stringify({ top: ["Lychee", "Cardamom"], heart: ["Damascus Rose", "Olibanum"], base: ["Leather", "Patchouli"] }) },
      { namespace: "custom", key: "longevity", value: "9-11 hours" },
      { namespace: "custom", key: "occasion", value: "Date Night, Special" },
      { namespace: "custom", key: "scent_family", value: "Oriental Floral" },
    ],
    tags: ["Floral", "Rose", "Evening"],
    productType: "Eau de Parfum",
    vendor: "Khayal",
  },
  {
    id: "gid://shopify/Product/4",
    title: "Sandalwood Nocturne",
    handle: "sandalwood-nocturne",
    description: "Creamy Mysore sandalwood under moonlight. Warm, meditative, and endlessly wearable.",
    descriptionHtml: "<p>Creamy Mysore sandalwood under moonlight. Warm, meditative, and endlessly wearable.</p>",
    priceRange: { minVariantPrice: { amount: "14000.0", currencyCode: "PKR" } },
    featuredImage: { url: "/images/products/sandalwood-nocturne.svg", altText: "Sandalwood Nocturne perfume bottle" },
    images: [{ url: "/images/products/sandalwood-nocturne.svg", altText: "Sandalwood Nocturne perfume bottle" }],
    variants: [
      {
        id: "gid://shopify/ProductVariant/401",
        title: "50ml",
        price: { amount: "14000.0", currencyCode: "PKR" },
        availableForSale: true,
        sku: "SND-NOC-50",
      },
    ],
    metafields: [
      { namespace: "custom", key: "scent_notes", value: JSON.stringify({ top: ["Nutmeg", "Pink Pepper"], heart: ["Sandalwood", "Iris"], base: ["Vetiver", "Benzoin"] }) },
      { namespace: "custom", key: "longevity", value: "8-10 hours" },
      { namespace: "custom", key: "occasion", value: "Daily, Evening" },
      { namespace: "custom", key: "scent_family", value: "Woody" },
    ],
    tags: ["Woody", "Sandalwood", "Daily"],
    productType: "Eau de Parfum",
    vendor: "Khayal",
  },
];

export function getMockProducts(): Product[] {
  return MOCK_PRODUCTS;
}

export async function getProducts(): Promise<Product[]> {
  if (!client) return MOCK_PRODUCTS;

  const { data, errors } = await client.request(`
    query GetProducts($first: Int!) {
      products(first: $first) {
        nodes {
          id
          title
          handle
          description
          descriptionHtml
          priceRange {
            minVariantPrice { amount currencyCode }
          }
          featuredImage { url altText }
          images(first: 5) { nodes { url altText } }
          variants(first: 10) { nodes { id title price { amount currencyCode } availableForSale sku } }
          metafields(identifiers: [
            { namespace: "custom", key: "scent_notes" },
            { namespace: "custom", key: "longevity" },
            { namespace: "custom", key: "occasion" },
            { namespace: "custom", key: "scent_family" }
          ]) { namespace key value }
          tags
          productType
          vendor
        }
      }
    }
  `, { variables: { first: 100 } });

  if (errors) {
    console.error("Shopify getProducts error:", errors);
    return MOCK_PRODUCTS;
  }

  return (data?.products?.nodes || []).map(mapShopifyProduct);
}

export async function getProduct(handle: string): Promise<ProductDetails | null> {
  if (!client) {
    const found = MOCK_PRODUCTS.find((p) => p.handle === handle);
    return found ? addDerivedFields(found) : null;
  }

  const { data, errors } = await client.request(`
    query GetProduct($handle: String!) {
      product(handle: $handle) {
        id
        title
        handle
        description
        descriptionHtml
        priceRange {
          minVariantPrice { amount currencyCode }
        }
        featuredImage { url altText }
        images(first: 5) { nodes { url altText } }
        variants(first: 10) { nodes { id title price { amount currencyCode } availableForSale sku } }
        metafields(identifiers: [
          { namespace: "custom", key: "scent_notes" },
          { namespace: "custom", key: "longevity" },
          { namespace: "custom", key: "occasion" },
          { namespace: "custom", key: "scent_family" }
        ]) { namespace key value }
        tags
        productType
        vendor
      }
    }
  `, { variables: { handle } });

  if (errors || !data?.product) {
    console.error("Shopify getProduct error:", errors);
    const found = MOCK_PRODUCTS.find((p) => p.handle === handle);
    return found ? addDerivedFields(found) : null;
  }

  return addDerivedFields(mapShopifyProduct(data.product));
}

export async function getProductRecommendations(productId: string): Promise<Product[]> {
  if (!client) {
    return MOCK_PRODUCTS.filter((p) => p.id !== productId).slice(0, 4);
  }

  const { data, errors } = await client.request(`
    query GetRecommendations($productId: ID!) {
      productRecommendations(productId: $productId) {
        id
        title
        handle
        description
        descriptionHtml
        priceRange { minVariantPrice { amount currencyCode } }
        featuredImage { url altText }
        images(first: 5) { nodes { url altText } }
        variants(first: 10) { nodes { id title price { amount currencyCode } availableForSale sku } }
        metafields(identifiers: [
          { namespace: "custom", key: "scent_notes" },
          { namespace: "custom", key: "longevity" },
          { namespace: "custom", key: "occasion" },
          { namespace: "custom", key: "scent_family" }
        ]) { namespace key value }
        tags
        productType
        vendor
      }
    }
  `, { variables: { productId } });

  if (errors) {
    console.error("Shopify getProductRecommendations error:", errors);
    return MOCK_PRODUCTS.filter((p) => p.id !== productId).slice(0, 4);
  }

  return (data?.productRecommendations || []).map(mapShopifyProduct);
}

export async function createCart(): Promise<ShopifyCart> {
  if (!client) {
    throw new Error("Shopify credentials not configured");
  }

  const { data, errors } = await client.request(`
    mutation CartCreate {
      cartCreate { cart { id checkoutUrl lines(first: 1) { edges { node { id } } } } }
    }
  `);

  if (errors) throw new Error(formatErrors(errors));
  return data.cartCreate.cart;
}

export async function addCartLines(cartId: string, lines: CartLineInput[]): Promise<ShopifyCart> {
  if (!client) {
    throw new Error("Shopify credentials not configured");
  }

  const { data, errors } = await client.request(`
    mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart { id checkoutUrl lines(first: 50) { edges { node { id quantity merchandise { ... on ProductVariant { id title product { id title featuredImage { url altText } } } } cost { totalAmount { amount currencyCode } } } } } } }
      }
    }
  `, { variables: { cartId, lines } });

  if (errors) throw new Error(formatErrors(errors));
  return data.cartLinesAdd.cart;
}

export async function getCart(cartId: string): Promise<ShopifyCart | null> {
  if (!client) return null;

  const { data, errors } = await client.request(`
    query GetCart($cartId: ID!) {
      cart(id: $cartId) { id checkoutUrl lines(first: 50) { edges { node { id quantity merchandise { ... on ProductVariant { id title product { id title featuredImage { url altText } } } } cost { totalAmount { amount currencyCode } } } } } } }
    }
  `, { variables: { cartId } });

  if (errors) {
    console.error("Shopify getCart error:", errors);
    return null;
  }

  return data?.cart || null;
}

interface ShopifyProductNode {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml: string;
  priceRange: Product["priceRange"];
  featuredImage: ShopifyImage | null;
  images?: { nodes: ShopifyImage[] };
  variants?: { nodes: ProductVariant[] };
  metafields: ProductMetafield[];
  tags: string[];
  productType?: string;
  vendor?: string;
  publishedAt?: string;
  updatedAt?: string;
}

function mapShopifyProduct(node: ShopifyProductNode): Product {
  return {
    id: node.id,
    title: node.title,
    handle: node.handle,
    description: node.description,
    descriptionHtml: node.descriptionHtml,
    priceRange: node.priceRange,
    featuredImage: node.featuredImage || null,
    images: node.images?.nodes || [],
    variants: node.variants?.nodes || [],
    metafields: node.metafields || [],
    tags: node.tags || [],
    productType: node.productType,
    vendor: node.vendor,
    publishedAt: node.publishedAt,
    updatedAt: node.updatedAt,
  };
}

function addDerivedFields(product: Product): ProductDetails {
  const getMeta = (namespace: string, key: string): string | undefined =>
    product.metafields.find((m) => m.namespace === namespace && m.key === key)?.value;

  let scentNotes = { top: [], heart: [], base: [] } as { top: string[]; heart: string[]; base: string[] };
  try {
    const raw = getMeta("custom", "scent_notes");
    if (raw) scentNotes = JSON.parse(raw);
  } catch {
    // ignore parse errors
  }

  return {
    ...product,
    scentNotes,
    longevity: getMeta("custom", "longevity") || "",
    occasion: getMeta("custom", "occasion") || "",
    scentFamily: getMeta("custom", "scent_family") || "",
  };
}
