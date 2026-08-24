import { dbConnect, toJSON } from "@/lib/mongoose";
import { Post, type IPost } from "@/models/Post";

export type BlogPost = {
  _id: string;
  title: string;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  canonicalUrl?: string;
  noIndex: boolean;
  noFollow: boolean;
  ogImage?: string;
  schemaType: "Article" | "BlogPosting" | "NewsArticle";
  publishedAt: string;
  updatedAt: string;
  excerpt: string;
  coverImage?: { url: string; alt?: string };
  content: string;
  tags: string[];
  readTime: number;
  status: "draft" | "published";
  authorId: string;
  createdAt: string;
};

export async function getBlogPosts(limit = 0, onlyPublished = true): Promise<BlogPost[]> {
  await dbConnect();
  const query = onlyPublished ? ({ status: "published" } as const) : {};
  const posts = await Post.find(query).sort({ publishedAt: -1 }).limit(limit || 0).lean();
  return (toJSON(posts) as unknown as IPost[]).map(mapPost);
}

export async function getLatestPosts(count = 3): Promise<BlogPost[]> {
  return getBlogPosts(count);
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  await dbConnect();
  const post = await Post.findOne({ slug, status: "published" } as const).lean();
  if (!post) return null;
  return mapPost(toJSON(post) as unknown as IPost);
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  await dbConnect();
  const post = await Post.findById(id).lean();
  if (!post) return null;
  return mapPost(toJSON(post) as unknown as IPost);
}

function mapPost(post: IPost): BlogPost {
  const id = post._id.toString();
  const authorId = post.authorId.toString();
  return {
    _id: id,
    title: post.title,
    slug: post.slug,
    metaTitle: post.metaTitle,
    metaDescription: post.metaDescription,
    focusKeyword: post.focusKeyword,
    canonicalUrl: post.canonicalUrl,
    noIndex: post.noIndex,
    noFollow: post.noFollow,
    ogImage: post.ogImage,
    schemaType: post.schemaType,
    publishedAt: post.publishedAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    excerpt: post.excerpt,
    coverImage: post.coverImage,
    content: post.content,
    tags: post.tags || [],
    readTime: post.readTime || 5,
    status: post.status,
    authorId,
    createdAt: post.createdAt.toISOString(),
  };
}
