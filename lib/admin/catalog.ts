"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { dbConnect } from "@/lib/mongoose";
import { Product } from "@/models/Product";
import { requireAuth } from "@/lib/auth";
import catalogFile from "@/lib/catalog/khayal-products.json";

interface CatalogProduct {
  handle: string;
  title: string;
  category: string;
  tags: string[];
  scentNotesTop: string[];
  scentNotesHeart: string[];
  scentNotesBase: string[];
  description: string;
  descriptionHtml: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  keywords: string[];
  occasion: string;
  concentration: string;
  sizeMl: number;
  longevity: string | null;
  price: number | null;
  compareAtPrice: number | null;
  stock: number | null;
  images: string[];
}

// Tags that drive homepage sections; an import never removes them from a product.
const KEEP_TAGS = new Set(["bestseller", "new", "limited", "featured"]);

const catalog = (catalogFile as { products: CatalogProduct[] }).products;

function hasValue<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined && value !== "";
}

function isReadyToSell(p: CatalogProduct): boolean {
  return hasValue(p.price) && p.price > 0 && hasValue(p.stock) && p.images.length > 0;
}

function copyFields(p: CatalogProduct) {
  return {
    title: p.title,
    category: p.category,
    description: p.description,
    descriptionHtml: p.descriptionHtml,
    metaTitle: p.metaTitle,
    metaDescription: p.metaDescription,
    focusKeyword: p.focusKeyword,
    keywords: p.keywords,
    occasion: p.occasion,
    concentration: p.concentration,
    sizeMl: p.sizeMl,
    scentNotesTop: p.scentNotesTop,
    scentNotesHeart: p.scentNotesHeart,
    scentNotesBase: p.scentNotesBase,
    ...(hasValue(p.longevity) ? { longevity: p.longevity } : {}),
  };
}

/**
 * Creates the catalog fragrances that don't exist yet (as drafts unless the catalog
 * gives them a price, stock and photos) and refreshes copy and SEO fields on the ones
 * that do, without touching their price, stock, images or status.
 */
export async function importCatalog(): Promise<void> {
  const session = await requireAuth(["admin"]);
  if (!session) throw new Error("Unauthorized");
  await dbConnect();

  let created = 0;
  let updated = 0;

  for (const p of catalog) {
    const existing = await Product.findOne({ handle: p.handle });

    if (existing) {
      existing.set(copyFields(p));
      const kept = (existing.tags || []).filter((t) => KEEP_TAGS.has(t.toLowerCase()));
      existing.tags = [...new Set([...p.tags, ...kept])];
      if (hasValue(p.price)) existing.price = p.price;
      if (hasValue(p.compareAtPrice)) existing.compareAtPrice = p.compareAtPrice;
      if (hasValue(p.stock)) existing.stock = p.stock;
      if (p.images.length) existing.images = p.images;
      if ((hasValue(p.price) || hasValue(p.stock)) && existing.variants.length === 1) {
        const variant = existing.variants[0];
        if (hasValue(p.price)) variant.price = p.price;
        if (hasValue(p.stock)) {
          variant.stock = p.stock;
          variant.availableForSale = p.stock > 0;
        }
      }
      await existing.save();
      updated += 1;
      continue;
    }

    const price = hasValue(p.price) ? p.price : 0;
    const stock = hasValue(p.stock) ? p.stock : 0;
    const sku = `KH-${p.handle.toUpperCase()}-50`;
    await Product.create({
      ...copyFields(p),
      handle: p.handle,
      price,
      ...(hasValue(p.compareAtPrice) ? { compareAtPrice: p.compareAtPrice } : {}),
      sku,
      stock,
      status: isReadyToSell(p) ? "active" : "draft",
      images: p.images,
      tags: p.tags,
      variants: [{ id: "50ml", title: "50 ml", price, sku, stock, availableForSale: stock > 0 }],
    });
    created += 1;
  }

  revalidatePath("/admin/inventory");
  revalidatePath("/shop");
  redirect(`/admin/inventory?imported=${created}-${updated}`);
}
