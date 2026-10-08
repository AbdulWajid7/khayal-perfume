import Link from "next/link";

const CATEGORY_LINKS = [
  { label: "All", href: "/shop", value: "" },
  { label: "Men", href: "/shop/men", value: "men" },
  { label: "Women", href: "/shop/women", value: "women" },
  { label: "Unisex", href: "/shop/unisex", value: "unisex" },
] as const;

interface ShopHeaderProps {
  title: string;
  intro: string;
  count: number;
  activeCategory: string;
  tags?: { label: string; href: string; active: boolean }[];
}

/** Cinematic header shared by /shop and the men / women / unisex pages. */
export default function ShopHeader({ title, intro, count, activeCategory, tags = [] }: ShopHeaderProps) {
  const words = title.split(" ");
  const last = words.pop();

  return (
    <header className="relative overflow-hidden">
      <div className="hero-mist" aria-hidden="true" />
      <div
        className="pointer-events-none absolute -top-24 right-[-10%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(191,161,95,0.18),transparent_65%)]"
        aria-hidden="true"
      />
      <div className="relative">
        <div className="flex items-center gap-4 mb-6">
          <span className="h-px w-10 bg-gold" aria-hidden="true" />
          <span className="text-[11px] tracking-[0.32em] uppercase text-gold font-medium">Khayal — Karachi</span>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h1 className="font-serif-display text-ink text-[44px] md:text-[64px] lg:text-[76px] font-medium tracking-tight leading-[1.02]">
            {words.join(" ")} {last && <span className="text-gold-shimmer italic">{last}</span>}
          </h1>
          <p className="text-[11px] uppercase tracking-[0.25em] text-stone tabular pb-3">
            {count} {count === 1 ? "fragrance" : "fragrances"}
          </p>
        </div>
        <p className="mt-4 text-stone text-base md:text-lg font-light max-w-2xl leading-relaxed">{intro}</p>

        <nav aria-label="Filter by category" className="mt-10 inline-flex flex-wrap gap-1 rounded-full border border-border bg-pure/70 p-1 backdrop-blur-sm">
          {CATEGORY_LINKS.map((c) => {
            const isActive = c.value === activeCategory;
            return (
              <Link
                key={c.value || "all"}
                href={c.href}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "px-5 py-2.5 rounded-full text-[11px] uppercase tracking-[0.2em] transition-all duration-300",
                  isActive ? "bg-gold text-pure shadow-[0_8px_24px_-12px_rgba(191,161,95,0.9)]" : "text-stone hover:text-ink",
                ].join(" ")}
              >
                {c.label}
              </Link>
            );
          })}
        </nav>

        {tags.length > 0 && (
          <nav aria-label="Browse by scent" className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="text-[10px] uppercase tracking-[0.18em] text-stone-light">Scents</span>
            {tags.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className={[
                  "link-hover-gold text-[11px] uppercase tracking-[0.14em] transition-colors duration-300",
                  t.active ? "text-gold" : "text-stone hover:text-gold",
                ].join(" ")}
              >
                {t.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
