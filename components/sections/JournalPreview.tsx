import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import RevealMask from "@/components/ui/RevealMask";
import type { BlogPost } from "@/lib/blog";

interface JournalPreviewProps {
  posts: BlogPost[];
}

export default function JournalPreview({ posts }: JournalPreviewProps) {
  return (
    <section className="py-20 md:py-28 bg-cream-dark border-y border-border">
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
        <Reveal>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
            <div>
              <span className="eyebrow">Notes &amp; Stories</span>
              <RevealMask as="h2" className="mt-3 font-serif-display text-ink text-[32px] md:text-[40px] font-medium tracking-tight">
                From the Journal
              </RevealMask>
            </div>
            <Link
              href="/journal"
              className="group inline-flex items-center gap-2 text-gold text-sm font-medium hover:text-gold-light transition-colors"
            >
              All Articles
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post, index) => (
            <Reveal key={post._id} delay={index * 0.1}>
              <article className="group bg-pure border border-border rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-md hover:border-gold/30">
                <Link href={`/journal/${post.slug}`} aria-label={`Read ${post.title}`}>
                  <div className="relative aspect-[16/10] overflow-hidden bg-cream-dark">
                    {post.coverImage?.url ? (
                      <Image
                        src={post.coverImage.url}
                        alt={post.coverImage.alt || post.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className="absolute inset-0 flex items-center justify-center"
                        aria-hidden="true"
                      >
                        <span className="text-gold/25 text-6xl font-serif-display font-medium tracking-[0.2em]">
                          K
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-pure/70 via-transparent to-transparent" />
                    <div className="absolute inset-0 flex items-end justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-gold text-xs font-medium tracking-wide">
                        Read Article →
                      </span>
                    </div>
                  </div>
                </Link>
                <div className="p-5">
                  <div className="flex items-center gap-3 text-stone text-xs mb-3">
                    {post.tags?.[0] && (
                      <span className="px-2 py-0.5 border border-border rounded-md">
                        {post.tags[0]}
                      </span>
                    )}
                    <span>{post.readTime ? `${post.readTime} min read` : "5 min read"}</span>
                  </div>
                  <h3 className="text-ink text-xl font-medium leading-snug line-clamp-2">
                    <Link href={`/journal/${post.slug}`}>{post.title}</Link>
                  </h3>
                  <p className="mt-2 text-stone text-sm leading-relaxed line-clamp-2">
                    {post.excerpt}
                  </p>
                  <p className="mt-4 text-stone-light text-xs">
                    {new Date(post.publishedAt).toLocaleDateString("en-PK", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
