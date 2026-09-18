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

function deriveMetafields(doc: IProduct): ProductMetafield[] {
  const metafields: ProductMetafield[] = [];
  const values: Record<string, string | undefined> = {
    scent_family: doc.category,
    scent_notes_top: doc.scentNotes?.top?.join(", "),
    scent_notes_heart: doc.scentNotes?.heart?.join(", "),
    scent_notes_base: doc.scentNotes?.base?.join(", "),
    longevity: doc.longevity,
    occasion: doc.occasion,
    day_night: doc.dayNight,
    season: doc.season,
    intensity: doc.intensity,
    accent_color: doc.accentColor,
    background_color: doc.backgroundColor,
    story_image: doc.storyImage,
    transparent_bottle_image: doc.transparentBottleImage,
    three_d_model_url: doc.threeDModelUrl,
  };
  Object.entries(values).forEach(([key, value]) => {
    if (value) metafields.push({ namespace: "custom", key, value });
  });
  if (doc.tags.length) metafields.push({ namespace: "custom", key: "tags", value: doc.tags.join(", ") });
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
    dayNight: getMeta("custom", "day_night"),
    season: getMeta("custom", "season"),
    intensity: getMeta("custom", "intensity"),
    accentColor: getMeta("custom", "accent_color"),
    backgroundColor: getMeta("custom", "background_color"),
    storyImage: getMeta("custom", "story_image"),
    transparentBottleImage: getMeta("custom", "transparent_bottle_image"),
    threeDModelUrl: getMeta("custom", "three_d_model_url"),
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
