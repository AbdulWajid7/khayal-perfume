"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import ScentPoster from "@/components/ui/ScentPoster";
import { formatPrice } from "@/lib/utils";
import { getFragranceLine } from "@/lib/fragrance-copy";
import { scentMood } from "@/lib/scent-moods";
import { productToAnalyticsItem, trackCommerce } from "@/lib/analytics";
import type { Product } from "@/types/product";

const TABS = ["All", "Men", "Women", "Unisex"] as const;
type Tab = (typeof TABS)[number];

function meta(p: Product, key: string) {
  return p.metafields.find((m) => m.namespace === "custom" && m.key === key)?.value;
}

export default function CollectionRail({ products }: { products: Product[] }) {
  const [tab, setTab] = useState<Tab>("All");
  const [progress, setProgress] = useState(0);
  const rail = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLElement>(null);

  const visible = useMemo(
    () => products.filter((p) => tab === "All" || (p.productType || "").toLowerCase() === tab.toLowerCase()),
    [products, tab],
  );
  const counts = useMemo(() => {
    const c: Record<Tab, number> = { All: products.length, Men: 0, Women: 0, Unisex: 0 };
    for (const p of products) {
      const t = (p.productType || "") as Tab;
      if (t in c && t !== "All") c[t] += 1;
    }
    return c;
  }, [products]);

  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollWidth - el.clientWidth;
      setProgress(max > 0 ? el.scrollLeft / max : 0);
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [visible]);

  function scroll(dir: 1 | -1) {
    const el = rail.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 720), behavior: "smooth" });
  }

  /** The stage takes on the colour of the scent you are looking at. */
  function setMood(handle: string | null) {
    stage.current?.style.setProperty("--stage", handle ? scentMood(handle).mid : "#5a2a4c");
  }

  if (products.length === 0) return null;

  return (
    <section
      id="collection"
      ref={stage}
      className="kh-stage overflow-hidden py-24 md:py-32"
      aria-label="The collection"
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        e.currentTarget.style.setProperty("--gx", `${((e.clientX - r.left) / r.width) * 100}%`);
        e.currentTarget.style.setProperty("--gy", `${((e.clientY - r.top) / r.height) * 100}%`);
      }}
    >
      <span aria-hidden="true" className="kh-stage-glow" />
      <span aria-hidden="true" className="kh-stage-grain" />

      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
        <Reveal className="mb-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.42em] text-gold-pale/80">
              The collection · {products.length} extraits de parfum
            </p>
            <h2 className="mt-4 font-serif-display text-[40px] font-normal leading-[1.02] text-[#faf6ef] md:text-[60px]">
              A scent to be <span className="whitespace-nowrap"><em className="text-gold-pale">remembered</em> by</span>
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[#faf6ef]/60">
              38% perfume oil, made in Karachi. See how each scent opens, settles and stays.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
            <div role="group" aria-label="Filter the collection" className="flex gap-6">
              {TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={tab === t}
                  onClick={() => {
                    setTab(t);
                    rail.current?.scrollTo({ left: 0, behavior: "smooth" });
                  }}
                  className={[
                    "min-h-[44px] border-b text-xs uppercase tracking-[0.24em] transition-colors",
                    tab === t ? "border-gold text-[#faf6ef]" : "border-transparent text-[#faf6ef]/45 hover:text-[#faf6ef]",
                  ].join(" ")}
                >
                  {t} <sup className="text-[9px] text-gold-pale/70">{counts[t]}</sup>
                </button>
              ))}
            </div>
            <div className="hidden gap-2 md:flex">
              {([-1, 1] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => scroll(d)}
                  aria-label={d < 0 ? "Scroll collection left" : "Scroll collection right"}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-[#faf6ef]/20 text-[#faf6ef] transition-colors hover:border-gold hover:bg-gold/15"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                    <path d={d < 0 ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      <div
        ref={rail}
        onMouseLeave={() => setMood(null)}
        className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-6 pt-3 md:px-8 lg:px-[max(3rem,calc((100vw-80rem)/2+3rem))]"
      >
        {visible.map((p, i) => {
          const image = p.featuredImage || p.images[0];
          const line = getFragranceLine(p.handle);
          const mood = scentMood(p.handle);
          const price = Number.parseFloat(p.priceRange.minVariantPrice.amount);
          const notes = [
            ["Opens", meta(p, "scent_notes_top")],
            ["Heart", meta(p, "scent_notes_heart")],
            ["Stays", meta(p, "scent_notes_base")],
          ].filter(([, v]) => v) as [string, string][];
          return (
            <Link
              key={p.id}
              href={`/shop/${p.handle}`}
              onMouseEnter={() => setMood(p.handle)}
              onFocus={() => setMood(p.handle)}
              onClick={() =>
                trackCommerce("select_item", { item_list_name: "home_collection", items: [productToAnalyticsItem(p)] })
              }
              style={{ "--card-accent": `${mood.accent}66` } as React.CSSProperties}
              className="kh-card group relative flex w-[78vw] max-w-[340px] flex-none snap-start flex-col overflow-hidden rounded-[2px] outline-none sm:w-[330px]"
            >
              <div className="kh-card-media relative aspect-[3/4] overflow-hidden">
                {image ? (
                  <>
                    <Image
                      src={image.url}
                      alt={image.altText || p.title}
                      fill
                      sizes="340px"
                      className="object-cover"
                      priority={i < 2}
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0"
                      style={{ background: `linear-gradient(180deg, transparent 40%, ${mood.deep}f2 96%)` }}
                    />
                    <div className="absolute inset-x-0 bottom-0 p-6" style={{ color: mood.accent }}>
                      <span className="block text-[10px] uppercase tracking-[0.42em] opacity-80">Signature</span>
                      <span className="mt-2 block font-serif-display text-3xl tracking-[0.1em] text-[#faf6ef]">{p.title}</span>
                      {line && <span className="mt-2 block font-serif-display text-sm italic opacity-85">{line}</span>}
                    </div>
                  </>
                ) : (
                  <ScentPoster handle={p.handle} name={p.title} line={line} />
                )}
                <span aria-hidden="true" className="kh-card-sheen" />

                {notes.length > 0 && (
                  <div
                    className="kh-card-notes absolute inset-x-0 top-0 grid gap-2 p-5 text-[11px] leading-snug"
                    style={{ background: `linear-gradient(180deg, ${mood.deep}f0, transparent)`, color: "#faf6ef" }}
                  >
                    {notes.map(([label, value]) => (
                      <div key={label} className="flex gap-3">
                        <span className="w-12 flex-none uppercase tracking-[0.24em]" style={{ color: mood.accent }}>
                          {label}
                        </span>
                        <span className="opacity-90">{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-[#faf6ef]/10 bg-[#faf6ef]/[0.03] px-5 py-4">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-[0.3em] text-[#faf6ef]/50">{p.productType} · 50 ml</span>
                  <span className="mt-1 text-[15px] text-[#faf6ef]">
                    {price > 0 ? formatPrice(price) : "Price coming soon"}
                  </span>
                </div>
                <span
                  className="flex h-10 items-center rounded-full border px-4 text-[10px] uppercase tracking-[0.24em] transition-colors group-hover:text-[#0d080c]"
                  style={{ borderColor: `${mood.accent}80`, color: mood.accent }}
                >
                  <span className="relative">Discover</span>
                </span>
              </div>
            </Link>
          );
        })}
        <Link
          href="/shop"
          className="flex w-[60vw] max-w-[260px] flex-none snap-start flex-col items-center justify-center gap-4 border border-[#faf6ef]/20 text-center text-[#faf6ef] transition-colors hover:border-gold hover:bg-gold/10 sm:w-[260px]"
        >
          <span aria-hidden="true" className="kh-mark h-24 text-gold-pale opacity-70" />
          <span className="font-serif-display text-2xl">See every fragrance</span>
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      <div className="mx-auto mt-8 max-w-7xl px-4 md:px-8 lg:px-12">
        <div className="h-px w-full bg-[#faf6ef]/10">
          <div className="h-px bg-gold transition-[width] duration-300" style={{ width: `${Math.max(8, progress * 100)}%` }} />
        </div>
      </div>
    </section>
  );
}
