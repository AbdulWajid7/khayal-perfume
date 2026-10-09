import type { ReactNode } from "react";

interface PageHeroProps {
  eyebrow: string;
  /** Main title; `accent` is appended in italic gold shimmer. */
  title: string;
  accent?: string;
  intro?: ReactNode;
  /** Small line under the intro, e.g. "Last updated August 2026". */
  meta?: ReactNode;
  align?: "left" | "center";
  children?: ReactNode;
}

/** Shared page header: gold eyebrow, large serif title with a shimmering accent, soft mist. */
export default function PageHero({ eyebrow, title, accent, intro, meta, align = "left", children }: PageHeroProps) {
  const centered = align === "center";
  return (
    <header className="relative overflow-hidden pt-36 pb-14 md:pt-44 md:pb-20">
      <div className="hero-mist" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -top-24 right-[-8%] h-[440px] w-[440px] rounded-full bg-[radial-gradient(circle,rgba(191,161,95,0.16),transparent_65%)]"
        aria-hidden="true"
      />
      <div className={`relative mx-auto max-w-7xl px-4 md:px-8 lg:px-12 ${centered ? "text-center" : ""}`}>
        <div className={`flex items-center gap-4 ${centered ? "justify-center" : ""}`}>
          <span className="h-px w-10 bg-gold" aria-hidden="true" />
          <span className="text-[11px] tracking-[0.32em] uppercase text-gold font-medium">{eyebrow}</span>
          {centered && <span className="h-px w-10 bg-gold" aria-hidden="true" />}
        </div>
        <h1 className="mt-6 font-serif-display text-ink text-[42px] md:text-[64px] lg:text-[76px] font-medium tracking-tight leading-[1.02] text-balance">
          {title} {accent && <span className="text-gold-shimmer italic">{accent}</span>}
        </h1>
        {intro && (
          <p className={`mt-5 text-stone text-base md:text-lg font-light leading-relaxed max-w-2xl ${centered ? "mx-auto" : ""}`}>{intro}</p>
        )}
        {meta && <p className="mt-4 text-[11px] uppercase tracking-[0.24em] text-stone-light">{meta}</p>}
        {children}
      </div>
    </header>
  );
}
