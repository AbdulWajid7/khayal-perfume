import type { ReactNode } from "react";
import Link from "next/link";
import PageHero from "@/components/ui/PageHero";
import { siteConfig } from "@/lib/site-config";

export interface LegalSection {
  id: string;
  title: string;
  body: ReactNode;
}

interface LegalPageProps {
  eyebrow: string;
  title: string;
  accent?: string;
  intro?: ReactNode;
  meta?: ReactNode;
  sections: LegalSection[];
  children?: ReactNode;
}

/** Policy / support page: hero, sticky contents list, readable sections, help card. */
export default function LegalPage({ eyebrow, title, accent, intro, meta, sections, children }: LegalPageProps) {
  return (
    <div className="bg-cream">
      <PageHero eyebrow={eyebrow} title={title} accent={accent} intro={intro} meta={meta} />
      {children}
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12 pb-24 md:pb-32">
        <div className="grid gap-12 lg:grid-cols-[240px_1fr] lg:gap-20">
          <nav aria-label="On this page" className="hidden lg:block">
            <div className="sticky top-32">
              <p className="text-[10px] uppercase tracking-[0.3em] text-stone-light mb-5">On this page</p>
              <ol className="space-y-3 border-l border-border">
                {sections.map((s, i) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="-ml-px flex gap-3 border-l border-transparent pl-4 text-sm text-stone transition-colors hover:border-gold hover:text-ink">
                      <span className="text-gold tabular">{String(i + 1).padStart(2, "0")}</span>
                      {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>

          <div className="max-w-3xl">
            {sections.map((s, i) => (
              <section key={s.id} id={s.id} className="scroll-mt-32 border-t border-border py-10 first:border-t-0 first:pt-0">
                <div className="flex items-baseline gap-5">
                  <span className="font-serif-display text-gold text-2xl tabular">{String(i + 1).padStart(2, "0")}</span>
                  <h2 className="font-serif-display text-ink text-2xl md:text-3xl font-medium tracking-tight">{s.title}</h2>
                </div>
                <div className="legal-body mt-5 md:pl-12 text-stone text-[15px] md:text-base leading-[1.85]">{s.body}</div>
              </section>
            ))}

            <aside className="mt-6 rounded-[24px] border border-gold/25 bg-gradient-to-br from-pure via-cream to-cream-dark p-8 md:p-10">
              <p className="text-[11px] uppercase tracking-[0.3em] text-gold">Need a hand?</p>
              <h2 className="mt-3 font-serif-display text-ink text-2xl md:text-3xl font-medium">We usually reply within 24 hours.</h2>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href={`mailto:${siteConfig.email}`} className="btn-sweep inline-flex items-center justify-center bg-gold text-pure px-7 py-3.5 text-[12px] font-medium tracking-[0.2em] uppercase">
                  Email us
                </a>
                <Link href="/faq" className="btn-sweep inline-flex items-center justify-center border border-ink/30 text-ink px-7 py-3.5 text-[12px] font-medium tracking-[0.2em] uppercase hover:border-gold transition-colors">
                  Read the FAQ
                </Link>
              </div>
              <p className="mt-5 text-sm text-stone">{siteConfig.email} · {siteConfig.phoneDisplay}</p>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
