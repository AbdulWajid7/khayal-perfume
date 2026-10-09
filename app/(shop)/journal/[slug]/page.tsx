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

  const description = post.metaDescription || truncateText(post.excerpt || post.title, 160);
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
    <article className="relative pt-32 pb-16 md:pt-40 md:pb-24 bg-cream overflow-x-clip">
      <div className="hero-mist" aria-hidden="true" />
      <div className="relative mx-auto max-w-3xl px-4 md:px-8 lg:px-12">
        <Breadcrumb items={breadcrumbItems} />
        <BreadcrumbSchema
          items={[
            { name: "Home", url: "https://www.khayalparfum.com/" },
            { name: "Journal", url: "https://www.khayalparfum.com/journal" },
            { name: post.title, url: `https://www.khayalparfum.com/journal/${slug}` },
          ]}
        />
        <BlogPostSchema post={post} />

        <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-stone mb-6">
          {post.tags?.[0] && (
            <span className="rounded-full border border-gold/40 bg-pure px-3 py-1 text-gold">
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

        <h1 className="font-serif-display text-ink text-[38px] md:text-[56px] font-medium tracking-tight leading-[1.05] text-balance">
          {post.title}
        </h1>
        {post.excerpt && (
          <p className="mt-6 font-serif-display italic text-stone text-xl md:text-2xl leading-relaxed">{post.excerpt}</p>
        )}

        {post.coverImage?.url && (
          <div className="relative mt-10 aspect-[16/9] w-full overflow-hidden rounded-[28px] border border-border md:-mx-16 md:w-[calc(100%+8rem)]">
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
          className="article-body mt-12 max-w-none text-stone text-[17px] leading-[1.9]"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="mt-14 flex items-center gap-5 rounded-[22px] border border-border bg-pure p-6">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-gold/40 bg-cream font-serif-display text-gold text-2xl">
            K
          </div>
          <div className="flex-1">
            <p className="font-serif-display text-ink text-lg">The Khayal Journal</p>
            <p className="text-stone text-sm">Notes on scent, craft, and imagination</p>
          </div>
          <Link href="/shop" className="hidden sm:inline-flex link-hover-gold text-[11px] uppercase tracking-[0.2em] text-ink">Shop the collection</Link>
        </div>

        {relatedPosts.length > 0 && (
          <div className="mt-20 pt-12 border-t border-border">
            <h2 className="font-serif-display text-ink text-3xl font-medium mb-8">
              More from the <span className="text-gold-shimmer italic">journal</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {relatedPosts.map((related) => (
                <Link
                  key={related._id}
                  href={`/journal/${related.slug}`}
                  className="group block rounded-[20px] border border-border bg-pure p-5 transition-all duration-500 hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_24px_50px_-28px_rgba(191,161,95,0.6)]"
                >
                  <p className="text-[10px] uppercase tracking-[0.26em] text-gold mb-3">
                    {related.tags?.[0] || "Journal"}
                  </p>
                  <h3 className="font-serif-display text-ink text-lg leading-snug group-hover:text-gold transition-colors">
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
