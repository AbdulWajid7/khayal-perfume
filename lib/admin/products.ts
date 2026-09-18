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
    stock: Number(getString(formData, "stock") || "0"),
    lowStockThreshold: Number(getString(formData, "lowStockThreshold") || "5"),
    status: (getString(formData, "status") as IProduct["status"]) || "draft",
    images: getString(formData, "images")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    category: getString(formData, "category") || "Unisex",
    tags: getTags(formData),
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
  product.descriptionHtml = getString(formData, "descriptionHtml") || product.descriptionHtml;
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
  const value = getString(formData, "tags");
  return value ? value.split(",").map((t) => t.trim()).filter(Boolean) : fallback;
}
