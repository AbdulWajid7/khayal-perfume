"use server";

import { put } from "@vercel/blob";
import { assertSection } from "@/lib/admin/access";

const TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 3 * 1024 * 1024; // the page shrinks photos before sending, so this is plenty

/** Stores one product photo and returns its public URL. The product form saves the list. */
export async function uploadProductImage(formData: FormData): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  try {
    await assertSection("products");
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Choose a photo first." };
    if (!TYPES.includes(file.type)) return { ok: false, error: "Use a JPG, PNG or WEBP photo." };
    if (file.size > MAX_BYTES) return { ok: false, error: "That photo is too large (over 3 MB)." };
    const folder = (formData.get("handle")?.toString() || "product").toLowerCase().replace(/[^a-z0-9-]/g, "") || "product";
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const blob = await put(`products/${folder}/${Date.now()}.${ext}`, file, { access: "public", addRandomSuffix: true });
    return { ok: true, url: blob.url };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "";
    if (/token|BLOB/i.test(msg)) return { ok: false, error: "Photo storage is not set up on the server (Vercel Blob token missing)." };
    return { ok: false, error: msg || "Upload failed. Try again." };
  }
}
