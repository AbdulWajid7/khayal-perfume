"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { dbConnect } from "@/lib/mongoose";
import { Post } from "@/models/Post";
import { requireAuth } from "@/lib/auth";
import { guides } from "@/lib/content/guides";

/** Create any ready-written guides that don't exist yet, as drafts. Existing posts are left alone. */
export async function importGuides() {
  const session = await requireAuth(["admin", "editor"]);
  if (!session) throw new Error("Unauthorized");
  await dbConnect();

  let created = 0;
  for (const g of guides) {
    const exists = await Post.exists({ slug: g.slug });
    if (exists) continue;
    await Post.create({
      title: g.title,
      slug: g.slug,
      metaTitle: g.metaTitle,
      metaDescription: g.metaDescription,
      focusKeyword: g.focusKeyword,
      noIndex: false,
      noFollow: false,
      schemaType: "BlogPosting",
      publishedAt: new Date(),
      excerpt: g.excerpt,
      coverImage: g.coverImage,
      content: g.content,
      tags: g.tags,
      readTime: g.readTime,
      status: "draft",
      authorId: session.id,
    });
    created++;
  }

  revalidatePath("/admin/posts");
  redirect(`/admin/posts?guides=${created}`);
}
