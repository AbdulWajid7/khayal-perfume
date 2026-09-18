import { dbConnect, toJSON } from "@/lib/mongoose";
import { Product, type IProduct } from "@/models/Product";
import type { Product as ProductType, ProductDetails, ShopifyImage, ProductVariant, ProductMetafield } from "@/types/product";

const currency = "PKR";

function money(amount: number): { amount: string; currencyCode: string } {
  return { amount: amount.toFixed(2), currencyCode: currency };
}

function mapImage(url: string): ShopifyImage {
  return { url, altText: "" };
}

function mapVariants(variants: { id: string; title: string; price: number; availableForSale: boolean; sku?: string }[]): ProductVariant[] {
  return variants.map((v) => ({
    id: v.id,
    title: v.title,
    price: money(v.price),
    availableForSale: v.availableForSale,
    sku: v.sku || null,
  }));
}

function deriveMetafields(category: string, tags: string[]): ProductMetafield[] {
  const metafields: ProductMetafield[] = [];
  if (category) {
    metafields.push({ namespace: "custom", key: "scent_family", value: category });
  }
  if (tags.length) {
    metafields.push({ namespace: "custom", key: "tags", value: tags.join(", ") });
  }
  return metafields;
}

function mapIProductToProduct(doc: IProduct): ProductType {
  const images: ShopifyImage[] = (doc.images || []).map(mapImage);
  const featuredImage: ShopifyImage | null = images[0] || null;
  const variants = mapVariants(doc.variants || []);

  const hasVariant = variants.length > 0;
  const minPrice = hasVariant
    ? Math.min(...variants.map((v) => Number(v.price.amount)))
    : doc.price;

  return {
    id: doc._id.toString(),
    title: doc.title,
    handle: doc.handle,
    description: doc.description,
    descriptionHtml: doc.descriptionHtml || `<p>${doc.description}</p>`,
    priceRange: { minVariantPrice: money(minPrice) },
    compareAtPriceRange: doc.compareAtPrice
      ? { maxVariantPrice: money(doc.compareAtPrice) }
      : undefined,
    featuredImage,
    images,
    variants,
    metafields: deriveMetafields(doc.category, doc.tags || []),
    tags: doc.tags || [],
    productType: doc.category,
    vendor: "Khayal",
    publishedAt: doc.createdAt as string,
    updatedAt: doc.updatedAt as string,
  };
}

function addDerivedFields(product: ProductType): ProductDetails {
  const getMeta = (namespace: string, key: string): string | undefined =>
    product.metafields.find((m) => m.namespace === namespace && m.key === key)?.value;

  const top = getMeta("custom", "scent_notes_top")?.split(",").map((s) => s.trim()).filter(Boolean) || [];
  const heart = getMeta("custom", "scent_notes_heart")?.split(",").map((s) => s.trim()).filter(Boolean) || [];
  const base = getMeta("custom", "scent_notes_base")?.split(",").map((s) => s.trim()).filter(Boolean) || [];

  return {
    ...product,
    scentNotes: { top, heart, base },
    longevity: getMeta("custom", "longevity") || "",
    occasion: getMeta("custom", "occasion") || "",
    scentFamily: getMeta("custom", "scent_family") || product.productType || "",
  };
}

export async function getBestsellerProducts(): Promise<ProductType[]> {
  try {
    await dbConnect();
    const products = await Product.find({
      status: "active",
      tags: { $in: ["Bestseller"] },
    })
      .sort({ createdAt: -1 })
      .lean();
    const data = toJSON(products) || [];
    return data.map(mapIProductToProduct);
  } catch (error) {
    console.error("getBestsellerProducts error:", error);
    return [];
  }
}

export async function getProducts(): Promise<ProductType[]> {
  try {
    await dbConnect();
    const products = await Product.find({ status: "active" }).sort({ createdAt: -1 }).lean();
    const data = toJSON(products) || [];
    return data.map(mapIProductToProduct);
  } catch (error) {
    console.error("getProducts error:", error);
    return [];
  }
}

export async function getProduct(handle: string): Promise<ProductDetails | null> {
  try {
    await dbConnect();
    const product = await Product.findOne({ handle, status: "active" }).lean();
    if (!product) return null;
    const data = toJSON(product);
    if (!data) return null;
    return addDerivedFields(mapIProductToProduct(data));
  } catch (error) {
    console.error("getProduct error:", error);
    return null;
  }
}

export async function getProductRecommendations(productId: string): Promise<ProductType[]> {
  try {
    await dbConnect();
    const products = await Product.find({ status: "active", _id: { $ne: productId } })
      .sort({ createdAt: -1 })
      .limit(4)
      .lean();
    const data = toJSON(products) || [];
    return data.map(mapIProductToProduct);
  } catch (error) {
    console.error("getProductRecommendations error:", error);
    return [];
  }
}
