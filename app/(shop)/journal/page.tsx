import { getBlogPosts } from "@/lib/blog";
import Image from "next/image";
import Link from "next/link";
import PageHero from "@/components/ui/PageHero";
import EmptyState from "@/components/ui/EmptyState";
import Reveal from "@/components/ui/Reveal";

export const metadata = {
  title: "The Journal",
  description:
    "Stories, guides, and the art of fragrance from Khayal — explore scent guides, ingredients, lifestyle, and gifting.",
};

const fmt = (d: string) =>
  new Date(d).toLocaleDateString("en-PK", { year: "numeric", month: "long", day: "numeric" });

export default async function JournalPage() {
  const posts = await getBlogPosts();
  const [lead, ...rest] = posts;

  return (
    <div className="bg-cream">
      <PageHero eyebrow="The Journal" title="Notes on scent," accent="craft & imagination" intro="Stories, guides, and the art of fragrance." />
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12 pb-24 md:pb-32">
        {!lead ? (
          <EmptyState
            title="Stories are on their way"
            text="Our first journal entries are being written. Meanwhile, explore the collection or find your signature scent."
            cta={{ label: "Explore the collection", href: "/shop" }}
            secondary={{ label: "Find your scent", href: "/scent-finder" }}
          />
        ) : (
          <>
            {/* featured story */}
            <Reveal>
              <article className="group grid overflow-hidden rounded-[28px] border border-border bg-pure transition-all duration-500 hover:border-gold/40 hover:shadow-[0_30px_70px_-34px_rgba(191,161,95,0.6)] md:grid-cols-[1.25fr_1fr]">
                <Link href={`/journal/${lead.slug}`} aria-label={`Read ${lead.title}`} className="relative block aspect-[16/11] overflow-hidden bg-cream-dark md:aspect-auto md:min-h-[420px]">
                  {lead.coverImage?.url ? (
                    <Image src={lead.coverImage.url} alt={lead.coverImage.alt || lead.title} fill priority sizes="(max-width: 768px) 100vw, 60vw" className="object-cover transition-transform duration-[1.2s] group-hover:scale-[1.04]" />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-cream-dark via-cream to-gold-pale/40" aria-hidden="true" />
                  )}
                </Link>
                <div className="flex flex-col justify-center p-8 md:p-12">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-gold">
                    Latest{lead.tags?.[0] ? ` · ${lead.tags[0]}` : ""}
                  </p>
                  <h2 className="mt-4 font-serif-display text-ink text-3xl md:text-[40px] font-medium leading-[1.12] tracking-tight">
                    <Link href={`/journal/${lead.slug}`} className="transition-colors group-hover:text-gold">{lead.title}</Link>
                  </h2>
                  {lead.excerpt && <p className="mt-4 text-stone leading-relaxed line-clamp-3">{lead.excerpt}</p>}
                  <p className="mt-6 text-[11px] uppercase tracking-[0.2em] text-stone-light">
                    {fmt(lead.publishedAt)}{lead.readTime ? ` · ${lead.readTime} min read` : ""}
                  </p>
                  <Link href={`/journal/${lead.slug}`} className="mt-8 self-start link-hover-gold text-[12px] uppercase tracking-[0.22em] text-ink">
                    Read the story
                  </Link>
                </div>
              </article>
            </Reveal>

            {rest.length > 0 && (
              <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((post, i) => (
                  <Reveal key={post._id} delay={(i % 3) * 0.08}>
                    <article className="group">
                      <Link href={`/journal/${post.slug}`} aria-label={`Read ${post.title}`} className="relative block aspect-[4/3] overflow-hidden rounded-[22px] border border-border bg-cream-dark">
                        {post.coverImage?.url ? (
                          <Image src={post.coverImage.url} alt={post.coverImage.alt || post.title} fill loading="lazy" sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover transition-transform duration-[1.2s] group-hover:scale-[1.05]" />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-cream-dark to-cream" aria-hidden="true" />
                        )}
                      </Link>
                      <p className="mt-5 text-[10px] uppercase tracking-[0.28em] text-gold">{post.tags?.[0] || "Journal"}</p>
                      <h2 className="mt-2 font-serif-display text-ink text-2xl font-medium leading-snug">
                        <Link href={`/journal/${post.slug}`} className="transition-colors group-hover:text-gold">{post.title}</Link>
                      </h2>
                      {post.excerpt && <p className="mt-2 text-stone text-sm leading-relaxed line-clamp-2">{post.excerpt}</p>}
                      <p className="mt-3 text-[11px] uppercase tracking-[0.18em] text-stone-light">{fmt(post.publishedAt)}</p>
                    </article>
                  </Reveal>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
