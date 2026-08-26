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
import {
  getAllDemoProducts,
  getDemoProductByHandle,
} from "@/lib/demo-products";

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

const demoProducts = getAllDemoProducts();

export function getMockProducts(): Product[] {
  return demoProducts;
}

export async function getProducts(): Promise<Product[]> {
  if (!client) return demoProducts;

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
    return demoProducts;
  }

  return (data?.products?.nodes || []).map(mapShopifyProduct);
}

export async function getProduct(handle: string): Promise<ProductDetails | null> {
  if (!client) {
    const found = getDemoProductByHandle(handle);
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
    const found = getDemoProductByHandle(handle);
    return found ? addDerivedFields(found) : null;
  }

  return addDerivedFields(mapShopifyProduct(data.product));
}

export async function getProductRecommendations(productId: string): Promise<Product[]> {
  if (!client) {
    return demoProducts.filter((p) => p.id !== productId).slice(0, 4);
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
    return demoProducts.filter((p) => p.id !== productId).slice(0, 4);
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
    // ignore parse errors, fall back to separate note fields
  }

  if (
    (!scentNotes.top.length && !scentNotes.heart.length && !scentNotes.base.length) ||
    (getMeta("custom", "scent_notes_top") || getMeta("custom", "scent_notes_heart") || getMeta("custom", "scent_notes_base"))
  ) {
    scentNotes = {
      top: getMeta("custom", "scent_notes_top")?.split(",").map((s) => s.trim()).filter(Boolean) || [],
      heart: getMeta("custom", "scent_notes_heart")?.split(",").map((s) => s.trim()).filter(Boolean) || [],
      base: getMeta("custom", "scent_notes_base")?.split(",").map((s) => s.trim()).filter(Boolean) || [],
    };
  }

  return {
    ...product,
    scentNotes,
    longevity: getMeta("custom", "longevity") || "",
    occasion: getMeta("custom", "occasion") || "",
    scentFamily: getMeta("custom", "scent_family") || "",
  };
}
