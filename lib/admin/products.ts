"use server";

import { revalidatePath } from "next/cache";
import { dbConnect, toJSON } from "@/lib/mongoose";
import { Product, type IProduct } from "@/models/Product";
import { requireAuth } from "@/lib/auth";
import DOMPurify from "isomorphic-dompurify";

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
    descriptionHtml: sanitizeProductHtml(getString(formData, "descriptionHtml")),
    price: Number(getString(formData, "price") || "0"),
    compareAtPrice: getNumber(formData, "compareAtPrice"),
    cost: getNumber(formData, "cost"),
    sku: getString(formData, "sku") || undefined,
    stock: Number(getString(formData, "stock") || "0"),
    lowStockThreshold: Number(getString(formData, "lowStockThreshold") || "5"),
    status: (getString(formData, "status") as IProduct["status"]) || "draft",
    images: getString(formData, "images")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    category: getString(formData, "category") || "Unisex",
    tags: getTags(formData),
    scentNotes: {
      top: getList(formData, "topNotes"),
      heart: getList(formData, "heartNotes"),
      base: getList(formData, "baseNotes"),
    },
    longevity: getString(formData, "longevity") || undefined,
    occasion: getString(formData, "occasion") || undefined,
    dayNight: getString(formData, "dayNight") || undefined,
    season: getString(formData, "season") || undefined,
    intensity: getString(formData, "intensity") || undefined,
    accentColor: getString(formData, "accentColor") || undefined,
    backgroundColor: getString(formData, "backgroundColor") || undefined,
    storyImage: getString(formData, "storyImage") || undefined,
    transparentBottleImage: getString(formData, "transparentBottleImage") || undefined,
    threeDModelUrl: getString(formData, "threeDModelUrl") || undefined,
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

  const handle = getString(formData, "handle") || product.handle;
  const existing = await Product.findOne({ handle, _id: { $ne: id } });
  if (existing) throw new Error("A product with this handle already exists");

  product.title = getString(formData, "title") || product.title;
  product.handle = handle;
  product.description = getString(formData, "description") || product.description;
  product.descriptionHtml = sanitizeProductHtml(getString(formData, "descriptionHtml")) || product.descriptionHtml;
  product.price = Number(getString(formData, "price") || product.price);
  product.compareAtPrice = getNumber(formData, "compareAtPrice", product.compareAtPrice);
  product.cost = getNumber(formData, "cost", product.cost);
  product.sku = getString(formData, "sku") || product.sku;
  product.stock = Number(getString(formData, "stock") ?? product.stock);
  product.lowStockThreshold = Number(getString(formData, "lowStockThreshold") ?? product.lowStockThreshold);
  product.status = (getString(formData, "status") as IProduct["status"]) || product.status;
  product.images = getString(formData, "images")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  product.category = getString(formData, "category") || product.category;
  product.tags = getTags(formData, product.tags);
  product.scentNotes = {
    top: getList(formData, "topNotes", product.scentNotes?.top),
    heart: getList(formData, "heartNotes", product.scentNotes?.heart),
    base: getList(formData, "baseNotes", product.scentNotes?.base),
  };
  product.longevity = getString(formData, "longevity") || product.longevity;
  product.occasion = getString(formData, "occasion") || product.occasion;
  product.dayNight = getString(formData, "dayNight") || product.dayNight;
  product.season = getString(formData, "season") || product.season;
  product.intensity = getString(formData, "intensity") || product.intensity;
  product.accentColor = getString(formData, "accentColor") || product.accentColor;
  product.backgroundColor = getString(formData, "backgroundColor") || product.backgroundColor;
  product.storyImage = getString(formData, "storyImage") || product.storyImage;
  product.transparentBottleImage = getString(formData, "transparentBottleImage") || product.transparentBottleImage;
  product.threeDModelUrl = getString(formData, "threeDModelUrl") || product.threeDModelUrl;

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

function getTags(formData: FormData, fallback: string[] = []) {
  return getList(formData, "tags", fallback);
}

function getList(formData: FormData, name: string, fallback: string[] = []) {
  const value = getString(formData, name);
  return value ? value.split(",").map((item) => item.trim()).filter(Boolean) : fallback;
}

function sanitizeProductHtml(value: string) {
  return DOMPurify.sanitize(value, {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "h2", "h3", "ul", "ol", "li", "blockquote"],
    ALLOWED_ATTR: [],
  });
}
