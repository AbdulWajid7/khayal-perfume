import { dbConnect, toJSON } from "@/lib/mongoose";
import { Product, type IProduct } from "@/models/Product";
import type { Product as ProductType, ProductDetails, ShopifyImage, ProductVariant, ProductMetafield } from "@/types/product";

const currency = "PKR";

/**
 * Temporary sample photos (SILK ROYALE bottle) shown on any product that has no
 * photos of its own yet. Remove once every fragrance has its own shoot. These
 * are never sent to Google (structured data or the Merchant feed).
 */
const SAMPLE_IMAGES = [
  "https://maiaai-media.s3.us-east-1.amazonaws.com/blogs/exec-46a4467d-2463-441f-a3b8-39421d962911.png",
  "https://maiaai-media.s3.us-east-1.amazonaws.com/blogs/exec-e1b45b4e-4517-4049-9be5-8a487c05f642.png",
  "https://maiaai-media.s3.us-east-1.amazonaws.com/blogs/exec-5787e7db-094f-4166-8232-52a7dd844f78.png",
  "https://maiaai-media.s3.us-east-1.amazonaws.com/blogs/exec-46fa76a2-e92a-48d8-bb35-71866ef96eb8.png",
];

function money(amount: number): { amount: string; currencyCode: string } {
  return { amount: amount.toFixed(2), currencyCode: currency };
}

function mapImage(url: string, index: number, doc: IProduct): ShopifyImage {
  const audience = (doc.category || "").toLowerCase();
  const who = audience === "men" ? "men's" : audience === "women" ? "women's" : "unisex";
  const base = `KHAYAL ${doc.title} ${who} eau de parfum${doc.sizeMl ? ` ${doc.sizeMl}ml` : ""}`;
  return { url, altText: index === 0 ? base : `${base}, view ${index + 1}` };
}

function mapVariants(
  variants: { id: string; title: string; price: number; availableForSale: boolean; sku?: string; stock?: number }[],
  doc: IProduct,
): ProductVariant[] {
  return variants.map((v) => {
    // A variant created by the catalog import keeps price 0 and stock 0 until it is edited;
    // fall back to the product-level price and stock so the shop shows the real values.
    const untouched = v.price <= 0 && !v.stock;
    const stock = untouched ? doc.stock : v.stock;
    return {
      id: v.id,
      title: v.title,
      price: money(v.price > 0 ? v.price : doc.price),
      availableForSale: untouched ? doc.stock > 0 : v.availableForSale,
      sku: v.sku || null,
      stock,
    };
  });
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
  const ownImages = (doc.images || []).filter(Boolean);
  const isSilkRoyale = doc.handle === "silk-royale";
  const usesSamples = ownImages.length === 0 && !isSilkRoyale;
  const imageUrls = isSilkRoyale
    ? [...ownImages, ...SAMPLE_IMAGES.filter((u) => !ownImages.includes(u))]
    : usesSamples
      ? SAMPLE_IMAGES
      : ownImages;
  const images: ShopifyImage[] = imageUrls.map((url, i) =>
    usesSamples
      ? { url, altText: i === 0 ? `KHAYAL ${doc.title}: sample bottle photo, final photography coming soon` : `KHAYAL sample bottle photo ${i + 1}` }
      : mapImage(url, i, doc),
  );
  const featuredImage: ShopifyImage | null = images[0] || null;
  const variants = mapVariants(doc.variants || [], doc);

  const pricedVariants = variants.map((v) => Number(v.price.amount)).filter((p) => p > 0);
  const minPrice = pricedVariants.length ? Math.min(...pricedVariants) : doc.price;

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
    sampleImages: usesSamples,
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
