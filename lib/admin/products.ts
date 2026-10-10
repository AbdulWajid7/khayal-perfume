"use server";

import { revalidatePath } from "next/cache";
import { dbConnect, toJSON } from "@/lib/mongoose";
import { Product, type IProduct } from "@/models/Product";
import { requireAuth } from "@/lib/auth";

export async function getProducts(): Promise<IProduct[]> {
  const session = await requireAuth(["admin", "editor"]);
  if (!session) throw new Error("Unauthorized");
  await dbConnect();
  const products = await Product.find().sort({ createdAt: -1 }).lean();
  return toJSON(products) as unknown as IProduct[];
}

export async function getProductById(id: string): Promise<IProduct | null> {
  const session = await requireAuth(["admin", "editor"]);
  if (!session) throw new Error("Unauthorized");
  await dbConnect();
  const product = await Product.findById(id).lean();
  return toJSON(product) as unknown as IProduct | null;
}

export async function createProduct(formData: FormData) {
  const session = await requireAuth(["admin", "editor"]);
  if (!session) throw new Error("Unauthorized");
  await dbConnect();

  const title = getString(formData, "title");
  const handle = getString(formData, "handle").toLowerCase().replace(/\s+/g, "-");

  if (!title || !handle) throw new Error("Title and handle are required");

  const existing = await Product.findOne({ handle });
  if (existing) throw new Error("A product with this handle already exists");

  await Product.create({
    title,
    handle,
    description: getString(formData, "description"),
    descriptionHtml: getString(formData, "descriptionHtml"),
    price: Number(getString(formData, "price") || "0"),
    compareAtPrice: getNumber(formData, "compareAtPrice"),
    cost: getNumber(formData, "cost"),
    sku: getString(formData, "sku") || undefined,
    mpn: getString(formData, "mpn") || undefined,
    stock: Number(getString(formData, "stock") || "0"),
    lowStockThreshold: Number(getString(formData, "lowStockThreshold") || "5"),
    status: (getString(formData, "status") as IProduct["status"]) || "draft",
    images: getString(formData, "images")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    category: getString(formData, "category") || "Unisex",
    tags: getTags(formData),
    concentration: getString(formData, "concentration") || undefined,
    sizeMl: getNumber(formData, "sizeMl"),
    scentNotesTop: getTags(formData, [], "scentNotesTop"),
    scentNotesHeart: getTags(formData, [], "scentNotesHeart"),
    scentNotesBase: getTags(formData, [], "scentNotesBase"),
    longevity: getString(formData, "longevity") || undefined,
    sillage: getString(formData, "sillage") || undefined,
    occasion: getString(formData, "occasion") || undefined,
    metaTitle: getString(formData, "metaTitle") || undefined,
    metaDescription: getString(formData, "metaDescription") || undefined,
    focusKeyword: getString(formData, "focusKeyword") || undefined,
    keywords: getTags(formData, [], "keywords"),
    ogImage: getString(formData, "ogImage") || undefined,
    canonicalUrl: getString(formData, "canonicalUrl") || undefined,
    noIndex: formData.get("noIndex") === "on",
    variants: getVariants(formData),
  });

  revalidatePath("/admin/inventory");
  revalidatePath("/shop");
}

export async function updateProduct(id: string, formData: FormData) {
  const session = await requireAuth(["admin", "editor"]);
  if (!session) throw new Error("Unauthorized");
  await dbConnect();

  const product = await Product.findById(id);
  if (!product) throw new Error("Product not found");

  const previousPrice = product.price;
  const previousStock = product.stock;
  const handle = getString(formData, "handle") || product.handle;
  const existing = await Product.findOne({ handle, _id: { $ne: id } });
  if (existing) throw new Error("A product with this handle already exists");

  product.title = getString(formData, "title") || product.title;
  product.handle = handle;
  product.description = getString(formData, "description") || product.description;
  product.descriptionHtml = getString(formData, "descriptionHtml") || product.descriptionHtml;
  product.price = Number(getString(formData, "price") || product.price);
  product.compareAtPrice = getNumber(formData, "compareAtPrice", product.compareAtPrice);
  product.cost = getNumber(formData, "cost", product.cost);
  product.sku = getString(formData, "sku") || product.sku;
  product.mpn = getString(formData, "mpn") || product.mpn;
  product.stock = Number(getString(formData, "stock") ?? product.stock);
  product.lowStockThreshold = Number(getString(formData, "lowStockThreshold") ?? product.lowStockThreshold);
  product.status = (getString(formData, "status") as IProduct["status"]) || product.status;
  product.images = getString(formData, "images")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  product.category = getString(formData, "category") || product.category;
  product.tags = getTags(formData, product.tags);
  product.concentration = getString(formData, "concentration") || product.concentration;
  product.sizeMl = getNumber(formData, "sizeMl", product.sizeMl);
  product.scentNotesTop = getTags(formData, product.scentNotesTop, "scentNotesTop");
  product.scentNotesHeart = getTags(formData, product.scentNotesHeart, "scentNotesHeart");
  product.scentNotesBase = getTags(formData, product.scentNotesBase, "scentNotesBase");
  product.longevity = getString(formData, "longevity") || product.longevity;
  product.sillage = getString(formData, "sillage") || product.sillage;
  product.occasion = getString(formData, "occasion") || product.occasion;
  product.metaTitle = getString(formData, "metaTitle") || product.metaTitle;
  product.metaDescription = getString(formData, "metaDescription") || product.metaDescription;
  product.focusKeyword = getString(formData, "focusKeyword") || product.focusKeyword;
  product.keywords = getTags(formData, product.keywords, "keywords");
  product.ogImage = getString(formData, "ogImage") || product.ogImage;
  product.canonicalUrl = getString(formData, "canonicalUrl") || product.canonicalUrl;
  product.noIndex = formData.get("noIndex") === "on";
  const variants = getVariants(formData);
  if (variants.length) product.variants = variants;
  if (product.variants.length === 1) {
    // Single-size products: the edit form re-submits the existing variant JSON, so keep
    // that one variant in step with the price and stock edited above. Otherwise a variant
    // left at 0 (or the old price) would override the product price at checkout.
    const [variant] = product.variants;
    if (variant.price === 0 || variant.price === previousPrice) variant.price = product.price;
    if (variant.stock === previousStock || (variant.stock === 0 && product.stock > 0)) {
      variant.stock = product.stock;
      variant.availableForSale = product.stock > 0;
    }
  }

  await product.save();

  revalidatePath("/admin/inventory");
  revalidatePath("/shop");
}

export async function deleteProduct(id: string) {
  const session = await requireAuth(["admin"]);
  if (!session) throw new Error("Unauthorized");
  await dbConnect();
  await Product.findByIdAndDelete(id);
  revalidatePath("/admin/inventory");
  revalidatePath("/shop");
}

function getString(formData: FormData, name: string) {
  return formData.get(name)?.toString().trim() || "";
}

function getNumber(formData: FormData, name: string, fallback?: number): number | undefined {
  const value = formData.get(name)?.toString().trim();
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function getTags(formData: FormData, fallback: string[] = [], name = "tags") {
  const value = getString(formData, name);
  return value ? value.split(",").map((t) => t.trim()).filter(Boolean) : fallback;
}

function getVariants(formData: FormData): IProduct["variants"] {
  const raw = getString(formData, "variantsJson");
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((v) => v && typeof v.title === "string" && typeof v.price === "number")
      .map((v, i) => ({
        id: typeof v.id === "string" && v.id ? v.id : `variant-${i + 1}`,
        title: v.title,
        price: v.price,
        compareAtPrice: typeof v.compareAtPrice === "number" ? v.compareAtPrice : undefined,
        sku: typeof v.sku === "string" ? v.sku : undefined,
        stock: typeof v.stock === "number" ? v.stock : 0,
        availableForSale: v.availableForSale !== false,
      }));
  } catch {
    throw new Error("Variants JSON is invalid");
  }
}
