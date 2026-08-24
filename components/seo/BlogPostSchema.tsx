import type { BlogPost } from "@/lib/blog";

export default function BlogPostSchema({ post }: { post: BlogPost }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": post.schemaType || "BlogPosting",
    headline: post.title,
    image: post.ogImage ? [post.ogImage] : post.coverImage?.url ? [post.coverImage.url] : undefined,
    description: post.metaDescription || post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: {
      "@type": "Organization",
      name: "Khayal Parfum",
    },
    publisher: {
      "@type": "Organization",
      name: "Khayal Parfum",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://www.khayalparfum.com/journal/${post.slug}`,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
