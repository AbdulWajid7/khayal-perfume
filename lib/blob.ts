"use server";

import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";

export async function uploadImage(formData: FormData) {
  const file = formData.get("file") as File | null;
  if (!file) throw new Error("No file provided");

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type)) throw new Error("Only images are allowed");

  const blob = await put(`journal/${Date.now()}-${file.name}`, file, {
    access: "public",
    addRandomSuffix: true,
  });

  revalidatePath("/admin/posts/new");
  return { url: blob.url };
}
