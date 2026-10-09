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

function mapVariants(variants: { id: string; title: string; price: number; availableForSale: boolean; sku?: string; stock?: number }[]): ProductVariant[] {
  return variants.map((v) => ({
    id: v.id,
    title: v.title,
    price: money(v.price),
    availableForSale: v.availableForSale,
    sku: v.sku || null,
    stock: v.stock,
  }));
}

function deriveMetafields(doc: IProduct): ProductMetafield[] {
  const metafields: ProductMetafield[] = [];
  const push = (key: string, value?: string | string[]) => {
    const v = Array.isArray(value) ? value.join(", ") : value;
    if (v) metafields.push({ namespace: "custom", key, value: v });
  };
  push("scent_family", doc.category);
  push("tags", doc.tags || []);
  push("scent_notes_top", doc.scentNotesTop || []);
  push("scent_notes_heart", doc.scentNotesHeart || []);
  push("scent_notes_base", doc.scentNotesBase || []);
  push("keywords", doc.keywords || []);
  push("longevity", doc.longevity);
  push("sillage", doc.sillage);
  push("occasion", doc.occasion);
  push("concentration", doc.concentration);
  push("size", doc.sizeMl ? `${doc.sizeMl}ml` : undefined);
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
    metafields: deriveMetafields(doc),
    tags: doc.tags || [],
    productType: doc.category,
    vendor: "Khayal",
    publishedAt: doc.createdAt as string,
    updatedAt: doc.updatedAt as string,
    stock: doc.stock,
    lowStockThreshold: doc.lowStockThreshold,
  };
}

function addDerivedFields(product: ProductType, doc?: IProduct): ProductDetails {
  const getMeta = (namespace: string, key: string): string | undefined =>
    product.metafields.find((m) => m.namespace === namespace && m.key === key)?.value;

  const top = getMeta("custom", "scent_notes_top")?.split(",").map((s) => s.trim()).filter(Boolean) || [];
  const heart = getMeta("custom", "scent_notes_heart")?.split(",").map((s) => s.trim()).filter(Boolean) || [];
  const base = getMeta("custom", "scent_notes_base")?.split(",").map((s) => s.trim()).filter(Boolean) || [];

  return {
    ...product,
    scentNotes: { top, heart, base },
    longevity: getMeta("custom", "longevity") || "",
    sillage: getMeta("custom", "sillage") || "",
    occasion: getMeta("custom", "occasion") || "",
    scentFamily: getMeta("custom", "scent_family") || product.productType || "",
    concentration: doc?.concentration,
    sizeMl: doc?.sizeMl,
    metaTitle: doc?.metaTitle,
    metaDescription: doc?.metaDescription,
    focusKeyword: doc?.focusKeyword,
    keywords: doc?.keywords,
    ogImage: doc?.ogImage,
    canonicalUrl: doc?.canonicalUrl,
    noIndex: doc?.noIndex,
    mpn: doc?.mpn,
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

/**
 * Top sellers ranked by units sold across real (non-draft, non-cancelled, non-returned) orders.
 * Falls back to Bestseller-tagged, then newest active products so the list is always `limit` long.
 */
export async function getTopSellingProducts(limit = 5): Promise<ProductType[]> {
  const ranked: ProductType[] = [];
  try {
    await dbConnect();
    const { Order } = await import("@/models/Order");
    const sales = await Order.aggregate<{ _id: string; sold: number }>([
      { $match: { orderStatus: { $nin: ["draft", "cancelled", "returned"] }, paymentStatus: { $ne: "rejected" } } },
      { $unwind: "$items" },
      { $group: { _id: "$items.productId", sold: { $sum: "$items.quantity" } } },
      { $sort: { sold: -1 } },
      { $limit: limit * 4 },
    ]);
    const ids = sales.map((s) => s._id).filter((id) => /^[a-f\d]{24}$/i.test(id));
    if (ids.length) {
      const docs = await Product.find({ _id: { $in: ids }, status: "active" }).lean();
      const data = toJSON(docs) || [];
      const byId = new Map(data.map(mapIProductToProduct).map((p) => [p.id, p]));
      for (const id of ids) {
        const p = byId.get(id);
        if (p) ranked.push(p);
        if (ranked.length >= limit) break;
      }
    }
  } catch (error) {
    console.error("getTopSellingProducts error:", error);
  }
  if (ranked.length < limit) {
    const seen = new Set(ranked.map((p) => p.id));
    for (const p of [...(await getBestsellerProducts()), ...(await getProducts())]) {
      if (ranked.length >= limit) break;
      if (!seen.has(p.id)) { seen.add(p.id); ranked.push(p); }
    }
  }
  return ranked.slice(0, limit);
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
    return addDerivedFields(mapIProductToProduct(data), data);
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
