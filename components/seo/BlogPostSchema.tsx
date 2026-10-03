import type { BlogPost } from "@/lib/blog";

const BASE_URL = "https://www.khayalparfum.com";

export default function BlogPostSchema({ post }: { post: BlogPost }) {
  const wordCount = post.content
    ? post.content.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length
    : undefined;

  const schema = {
    "@context": "https://schema.org",
    "@type": post.schemaType || "BlogPosting",
    "@id": `${BASE_URL}/journal/${post.slug}#article`,
    headline: post.title,
    image: post.ogImage ? [post.ogImage] : post.coverImage?.url ? [post.coverImage.url] : undefined,
    description: post.metaDescription || post.excerpt,
    inLanguage: "en-PK",
    wordCount,
    articleSection: post.tags?.[0],
    keywords: post.tags?.length ? post.tags.join(", ") : undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      name: "Khayal Fragrance",
      url: BASE_URL,
    },
    publisher: {
      "@type": "Organization",
      "@id": `${BASE_URL}/#organization`,
      name: "Khayal Fragrance",
      url: BASE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${BASE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${BASE_URL}/journal/${post.slug}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
