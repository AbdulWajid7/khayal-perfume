import { getBlogPosts } from "@/lib/sanity";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "The Journal",
  description:
    "Stories, guides, and the art of fragrance from Khayal — explore scent guides, ingredients, lifestyle, and gifting.",
};

export default async function JournalPage() {
  const posts = await getBlogPosts();

  return (
    <section className="pt-32 pb-16 md:pt-40 md:pb-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
        <h1 className="text-parchment text-[40px] font-medium tracking-[0.02em]">
          The Journal
        </h1>
        <p className="mt-2 text-warm-taupe text-base">
          Stories, guides, and the art of fragrance
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <article
              key={post._id}
              className="group bg-charcoal border border-border-subtle rounded-xl overflow-hidden"
            >
              <Link href={`/journal/${post.slug.current}`} aria-label={`Read ${post.title}`}>
                <div className="relative aspect-[16/10] overflow-hidden bg-midnight">
                  {post.coverImage?.asset?.url ? (
                    <Image
                      src={post.coverImage.asset.url}
                      alt={post.coverImage.alt || post.title}
                      fill
                      className="object-cover transition-transform duration-[400ms] group-hover:scale-[1.03]"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-charcoal to-midnight" aria-hidden="true" />
                  )}
                </div>
              </Link>
              <div className="p-5">
                <h2 className="text-parchment text-xl font-medium leading-snug">
                  <Link href={`/journal/${post.slug.current}`}>{post.title}</Link>
                </h2>
                <p className="mt-2 text-warm-taupe text-sm line-clamp-2">{post.excerpt}</p>
                <p className="mt-4 text-warm-taupe text-xs">
                  {new Date(post.publishedAt).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
