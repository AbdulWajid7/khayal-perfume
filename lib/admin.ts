"use server";

import { revalidatePath } from "next/cache";
import { dbConnect, toJSON } from "@/lib/mongoose";
import { Post, type IPost } from "@/models/Post";
import { getSession, requireAuth } from "@/lib/auth";
import sanitizeHtml from "sanitize-html";
import { put } from "@vercel/blob";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function generateExcerpt(html: string, maxLen = 160) {
  const plain = html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
  return plain.length > maxLen ? `${plain.slice(0, maxLen - 3).trim()}...` : plain;
}

function getString(formData: FormData, name: string) {
  return formData.get(name)?.toString().trim() || "";
}

function toIsoString(value: string | Date): string {
  return typeof value === "string" ? value : value.toISOString();
}

function getTags(formData: FormData) {
  return getString(formData, "tags")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ["p", "br", "strong", "em", "u", "s", "a", "h1", "h2", "h3", "h4", "ul", "ol", "li", "blockquote", "img"],
  allowedAttributes: {
    a: ["href", "title", "target"],
    img: ["src", "alt", "title"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
};

export async function createPost(formData: FormData) {
  const session = await requireAuth(["admin", "editor"]);
  if (!session) throw new Error("Unauthorized");
  await dbConnect();

  const html = getString(formData, "content");
  const cleanHtml = sanitizeHtml(html, SANITIZE_OPTIONS);

  const title = getString(formData, "title") || "Untitled";
  const slugBase = getString(formData, "slug") || slugify(title);
  const slug = slugBase.replace(/\/$/, "");

  const existing = await Post.findOne({ slug });
  if (existing) throw new Error("A post with this slug already exists");

  const excerpt = getString(formData, "excerpt") || generateExcerpt(cleanHtml);
  const coverImageUrl = getString(formData, "coverImageUrl");

  const payload: Partial<IPost> = {
    title,
    slug,
    metaTitle: getString(formData, "metaTitle") || undefined,
    metaDescription: getString(formData, "metaDescription") || undefined,
    focusKeyword: getString(formData, "focusKeyword") || undefined,
    canonicalUrl: getString(formData, "canonicalUrl") || undefined,
    noIndex: formData.get("noIndex") === "on",
    noFollow: formData.get("noFollow") === "on",
    ogImage: getString(formData, "ogImage") || undefined,
    schemaType: (getString(formData, "schemaType") || "BlogPosting") as IPost["schemaType"],
    publishedAt: new Date(getString(formData, "publishedAt") || new Date().toISOString()),
    excerpt,
    coverImage: coverImageUrl
      ? {
          url: coverImageUrl,
          alt: getString(formData, "coverImageAlt") || title,
        }
      : undefined,
    content: cleanHtml,
    tags: getTags(formData),
    readTime: Number(getString(formData, "readTime")) || 5,
    status: (getString(formData, "status") || "draft") as IPost["status"],
    authorId: session.id as unknown as IPost["authorId"],
  };

  const post = await Post.create(payload);

  revalidatePath("/journal");
  revalidatePath("/sitemap.xml");
  return toJSON(post) as unknown as IPost;
}

export async function updatePost(id: string, formData: FormData) {
  const session = await requireAuth(["admin", "editor"]);
  if (!session) throw new Error("Unauthorized");
  await dbConnect();

  const post = await Post.findById(id);
  if (!post) throw new Error("Post not found");

  const html = getString(formData, "content");
  const cleanHtml = sanitizeHtml(html, SANITIZE_OPTIONS);

  const title = getString(formData, "title") || post.title;
  const slug = getString(formData, "slug") || post.slug;
  const excerpt = getString(formData, "excerpt") || generateExcerpt(cleanHtml);

  const existing = await Post.findOne({ slug, _id: { $ne: id } });
  if (existing) throw new Error("A post with this slug already exists");

  post.title = title;
  post.slug = slug;
  post.metaTitle = getString(formData, "metaTitle") || undefined;
  post.metaDescription = getString(formData, "metaDescription") || undefined;
  post.focusKeyword = getString(formData, "focusKeyword") || undefined;
  post.canonicalUrl = getString(formData, "canonicalUrl") || undefined;
  post.noIndex = formData.get("noIndex") === "on";
  post.noFollow = formData.get("noFollow") === "on";
  post.ogImage = getString(formData, "ogImage") || undefined;
  post.schemaType = (getString(formData, "schemaType") || "BlogPosting") as IPost["schemaType"];
  post.publishedAt = new Date(getString(formData, "publishedAt") || toIsoString(post.publishedAt));
  post.excerpt = excerpt;

  const coverImageUrl = getString(formData, "coverImageUrl");
  post.coverImage = coverImageUrl
    ? {
        url: coverImageUrl,
        alt: getString(formData, "coverImageAlt") || title,
      }
    : undefined;

  post.content = cleanHtml;
  post.tags = getTags(formData);
  post.readTime = Number(getString(formData, "readTime")) || 5;
  post.status = (getString(formData, "status") || "draft") as IPost["status"];

  await post.save();

  revalidatePath("/journal");
  revalidatePath(`/journal/${post.slug}`);
  revalidatePath("/sitemap.xml");
  return toJSON(post) as unknown as IPost;
}

export async function deletePost(id: string) {
  const session = await requireAuth(["admin"]);
  if (!session) throw new Error("Unauthorized");
  await dbConnect();
  await Post.findByIdAndDelete(id);
  revalidatePath("/journal");
  revalidatePath("/sitemap.xml");
}

export async function uploadCoverImage(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  const file = formData.get("file") as File | null;
  if (!file) throw new Error("No file provided");

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.type)) throw new Error("Only images are allowed");
  if (file.size > 5 * 1024 * 1024) throw new Error("Image must be under 5MB");

  const blob = await put(`journal/cover-${Date.now()}-${file.name}`, file, {
    access: "public",
    addRandomSuffix: true,
  });

  return { url: blob.url };
}
