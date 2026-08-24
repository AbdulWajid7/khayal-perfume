import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getBlogPost, getBlogPosts } from "@/lib/blog";
import { truncateText } from "@/lib/utils";
import Breadcrumb from "@/components/ui/Breadcrumb";
import BlogPostSchema from "@/components/seo/BlogPostSchema";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return {};

  const description = post.metaDescription || truncateText(post.excerpt, 160);
  const canonical = post.canonicalUrl || `https://www.khayalparfum.com/journal/${post.slug}`;

  return {
    title: post.metaTitle || post.title,
    description,
    openGraph: {
      title: post.metaTitle || post.title,
      description,
      images: post.ogImage ? [post.ogImage] : post.coverImage?.url ? [post.coverImage.url] : undefined,
    },
    robots: {
      index: !post.noIndex,
      follow: !post.noFollow,
    },
    alternates: { canonical },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const allPosts = await getBlogPosts(0);
  const relatedPosts = allPosts.filter((p) => p.slug !== slug).slice(0, 3);

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Journal", href: "/journal" },
    { label: post.title },
  ];

  return (
    <article className="pt-32 pb-16 md:pt-40 md:pb-24">
      <div className="mx-auto max-w-3xl px-4 md:px-8 lg:px-12">
        <Breadcrumb items={breadcrumbItems} />
        <BreadcrumbSchema
          items={[
            { name: "Home", url: "https://www.khayalparfum.com/" },
            { name: "Journal", url: "https://www.khayalparfum.com/journal" },
            { name: post.title, url: `https://www.khayalparfum.com/journal/${slug}` },
          ]}
        />
        <BlogPostSchema post={post} />

        <div className="flex items-center gap-3 text-warm-taupe text-xs mb-4">
          {post.tags?.[0] && (
            <span className="px-2 py-0.5 border border-border-subtle rounded-md">
              {post.tags[0]}
            </span>
          )}
          <span>{post.readTime ? `${post.readTime} min read` : "5 min read"}</span>
          <span aria-hidden="true">·</span>
          <span>
            {new Date(post.publishedAt).toLocaleDateString("en-PK", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>

        <h1 className="text-parchment text-[32px] md:text-[40px] font-medium tracking-[0.02em] leading-tight">
          {post.title}
        </h1>

        {post.coverImage?.url && (
          <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-xl border border-border-subtle">
            <Image
              src={post.coverImage.url}
              alt={post.coverImage.alt || post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              priority
            />
          </div>
        )}

        <div
          className="mt-10 prose prose-invert max-w-none text-warm-taupe text-base leading-relaxed [&>h1]:text-parchment [&>h1]:text-2xl [&>h1]:font-medium [&>h1]:mt-10 [&>h1]:mb-4 [&>h2]:text-parchment [&>h2]:text-xl [&>h2]:font-medium [&>h2]:mt-8 [&>h2]:mb-3 [&>h3]:text-parchment [&>h3]:text-lg [&>h3]:font-medium [&>h3]:mt-6 [&>h3]:mb-2 [&>p]:mb-4 [&>hr]:border-border-subtle [&>hr]:my-10 [&_a]:text-oud-gold [&_img]:rounded-xl"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="mt-12 pt-8 border-t border-border-subtle flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-oud-gold flex items-center justify-center text-midnight text-sm font-medium">
            K
          </div>
          <div>
            <p className="text-parchment text-sm font-medium">The Khayal Journal</p>
            <p className="text-warm-taupe text-xs">Notes on scent, craft, and imagination</p>
          </div>
        </div>

        {relatedPosts.length > 0 && (
          <div className="mt-16 pt-10 border-t border-border-subtle">
            <h2 className="text-parchment text-xl font-medium mb-6">More From the Journal</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedPosts.map((related) => (
                <Link
                  key={related._id}
                  href={`/journal/${related.slug}`}
                  className="group"
                >
                  <p className="text-warm-taupe text-xs mb-2">
                    {related.tags?.[0] || "Journal"}
                  </p>
                  <h3 className="text-parchment text-sm font-medium leading-snug group-hover:text-oud-gold transition-colors">
                    {related.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
