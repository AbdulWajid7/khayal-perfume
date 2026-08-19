import { createClient } from "@sanity/client";
import fs from "fs";
import path from "path";
import type { BlogPost, BlogPostCard } from "@/types/blog";

function readMarkdownBody(filename: string): string {
  try {
    const filePath = path.join(process.cwd(), "content", "blog", filename);
    const raw = fs.readFileSync(filePath, "utf-8");
    // Strip YAML frontmatter block delimited by ---
    return raw.replace(/^---\n[\s\S]*?\n---\n/, "").trim();
  } catch {
    return "";
  }
}

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET || "production";
const apiToken = process.env.SANITY_API_TOKEN;
const hasCredentials = Boolean(projectId && !projectId.startsWith("your-"));

function getSanityClient() {
  if (!hasCredentials) return null;
  return createClient({
    projectId: projectId!,
    dataset,
    apiVersion: "2026-01-01",
    useCdn: true,
  });
}

function getSanityWriteClient() {
  if (!hasCredentials || !apiToken) return null;
  return createClient({
    projectId: projectId!,
    dataset,
    apiVersion: "2026-01-01",
    token: apiToken,
    useCdn: false,
  });
}

export const sanityClient = getSanityClient();
export const sanityWriteClient = getSanityWriteClient();

// Static fallback content used when Sanity credentials are not configured
const MOCK_POSTS: BlogPostCard[] = [
  {
    _id: "post-1",
    title: "The Art of Oud: Why Khayal Builds Fragrance Around Imagination",
    slug: { current: "the-art-of-oud" },
    excerpt:
      "Discover why oud remains the soul of luxury perfumery and how Khayal transforms raw resin into liquid imagination.",
    publishedAt: "2026-08-01T00:00:00Z",
    readTime: 8,
    tags: ["Ingredients"],
  },
  {
    _id: "post-2",
    title: "How to Choose a Signature Scent Without Testing Fifty Bottles",
    slug: { current: "how-to-choose-signature-scent" },
    excerpt:
      "A practical guide to finding a fragrance that feels like an extension of your personality, mood, and memory.",
    publishedAt: "2026-08-05T00:00:00Z",
    readTime: 6,
    tags: ["Scent Guides"],
  },
  {
    _id: "post-3",
    title: "The Ritual of Gifting Fragrance: Notes That Speak for You",
    slug: { current: "ritual-of-gifting-fragrance" },
    excerpt:
      "Why perfume is the most intimate gift you can give, and how to select one that carries meaning beyond the bottle.",
    publishedAt: "2026-08-08T00:00:00Z",
    readTime: 5,
    tags: ["Gifting"],
  },
];

export async function getBlogPosts(): Promise<BlogPostCard[]> {
  if (!sanityClient) return MOCK_POSTS;
  try {
    return await sanityClient.fetch<BlogPostCard[]>(`
      *[_type == "blogPost"] | order(publishedAt desc) {
        _id,
        title,
        slug,
        excerpt,
        publishedAt,
        "coverImage": coverImage { alt, "asset": asset->{url} },
        tags,
        readTime
      }
    `);
  } catch (error) {
    console.error("Sanity getBlogPosts error:", error);
    return MOCK_POSTS;
  }
}

const FALLBACK_BLOG_POSTS: Record<string, { post: BlogPost; filename: string }> = {
  "the-art-of-oud": {
    filename: "the-art-of-oud.md",
    post: {
      _id: "post-1",
      title: "The Art of Oud: Why Khayal Builds Fragrance Around Imagination",
      slug: { current: "the-art-of-oud" },
      metaTitle: "The Art of Oud | Khayal Journal",
      metaDescription:
        "Discover why oud remains the soul of luxury perfumery and how Khayal transforms raw resin into liquid imagination.",
      publishedAt: "2026-08-01T00:00:00Z",
      excerpt:
        "Discover why oud remains the soul of luxury perfumery and how Khayal transforms raw resin into liquid imagination.",
      content: [],
      tags: ["Ingredients"],
      readTime: 8,
    },
  },
  "how-to-choose-signature-scent": {
    filename: "how-to-choose-signature-scent.md",
    post: {
      _id: "post-2",
      title: "How to Choose a Signature Scent Without Testing Fifty Bottles",
      slug: { current: "how-to-choose-signature-scent" },
      metaTitle: "How to Choose a Signature Scent | Khayal Journal",
      metaDescription:
        "A practical guide to finding a fragrance that feels like an extension of your personality, mood, and memory.",
      publishedAt: "2026-08-05T00:00:00Z",
      excerpt:
        "A practical guide to finding a fragrance that feels like an extension of your personality, mood, and memory.",
      content: [],
      tags: ["Scent Guides"],
      readTime: 6,
    },
  },
  "ritual-of-gifting-fragrance": {
    filename: "ritual-of-gifting-fragrance.md",
    post: {
      _id: "post-3",
      title: "The Ritual of Gifting Fragrance: Notes That Speak for You",
      slug: { current: "ritual-of-gifting-fragrance" },
      metaTitle: "The Ritual of Gifting Fragrance | Khayal Journal",
      metaDescription:
        "Why perfume is the most intimate gift you can give, and how to select one that carries meaning beyond the bottle.",
      publishedAt: "2026-08-08T00:00:00Z",
      excerpt:
        "Why perfume is the most intimate gift you can give, and how to select one that carries meaning beyond the bottle.",
      content: [],
      tags: ["Gifting"],
      readTime: 5,
    },
  },
};

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  if (!sanityClient) {
    const entry = FALLBACK_BLOG_POSTS[slug];
    if (!entry) return null;
    return { ...entry.post, rawContent: readMarkdownBody(entry.filename) };
  }

  try {
    return await sanityClient.fetch<BlogPost | null>(
      `
      *[_type == "blogPost" && slug.current == $slug][0] {
        _id,
        title,
        slug,
        metaTitle,
        metaDescription,
        publishedAt,
        updatedAt,
        excerpt,
        "coverImage": coverImage { alt, "asset": asset->{url} },
        content,
        tags,
        readTime
      }
    `,
      { slug }
    );
  } catch (error) {
    console.error("Sanity getBlogPost error:", error);
    return null;
  }
}

export async function getLatestPosts(count: number): Promise<BlogPostCard[]> {
  const posts = await getBlogPosts();
  return posts.slice(0, count);
}
