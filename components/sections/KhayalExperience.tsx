"use client";

/**
 * 3D homepage experience in the Khayal cream, gold and plum theme.
 * A sticky WebGL canvas sits behind six full-height sections; the Gentleman
 * bottle travels between them as the visitor scrolls (see khayalScene.ts).
 */
import { useEffect, useRef } from "react";
import Link from "next/link";
import ProductCard from "@/components/ui/ProductCard";
import Reveal from "@/components/ui/Reveal";
import type { Product } from "@/types/product";
import type { StationId } from "@/components/three/khayalScene";

const STATIONS: StationId[] = ["hero", "collection", "n360", "story", "notes", "presence"];

function metafield(product: Product | undefined, key: string): string | undefined {
  return product?.metafields.find((m) => m.namespace === "custom" && m.key === key)?.value;
}

interface Props {
  products: Product[];
}

export default function KhayalExperience({ products }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);

  const featured = products.find((p) => /gentleman/i.test(p.title)) ?? products[0];
  const featuredHref = featured ? `/shop/${featured.handle}` : "/shop";
  const collection = products.slice(0, 3);
  const notes = {
    top: metafield(featured, "scent_notes_top") ?? "Bergamot, cardamom and a cold citrus spark",
    heart: metafield(featured, "scent_notes_heart") ?? "Lavender, vetiver and soft spice",
    base: metafield(featured, "scent_notes_base") ?? "Oud, amber and warm musk",
  };
  const facts = [
    ["Family", metafield(featured, "scent_family") ?? "Fresh aromatic"],
    ["Longevity", metafield(featured, "longevity") ?? "Long lasting"],
    ["Occasion", metafield(featured, "occasion") ?? "Day into evening"],
  ];

  useEffect(() => {
    const canvas = canvasRef.current, wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    let disposed = false;
    let dispose: (() => void) | undefined;
    let setDrag: ((r: number) => void) | undefined;

    const sections = STATIONS.map((id) => wrap.querySelector<HTMLElement>(`[data-station="${id}"]`));
    const getProgress = () => {
      const mid = window.innerHeight * 0.5;
      let p = 0;
      sections.forEach((s, i) => {
        if (!s) return;
        const r = s.getBoundingClientRect();
        if (r.top <= mid) p = i + Math.min((mid - r.top) / r.height, 1) - 0.5;
      });
      return p;
    };

    // drag to rotate in the 360° section, with a little inertia
    let rot = 0, vel = 0, dragging = false, lastX = 0, spin = 0;
    const zone = dragRef.current;
    const coast = () => {
      if (dragging || Math.abs(vel) < 0.0005) return;
      vel *= 0.94; rot += vel; setDrag?.(rot);
      spin = requestAnimationFrame(coast);
    };
    const down = (e: PointerEvent) => { dragging = true; lastX = e.clientX; zone?.setPointerCapture(e.pointerId); cancelAnimationFrame(spin); };
    const move = (e: PointerEvent) => { if (!dragging) return; vel = (e.clientX - lastX) * 0.012; lastX = e.clientX; rot += vel; setDrag?.(rot); };
    const up = () => { dragging = false; spin = requestAnimationFrame(coast); };
    zone?.addEventListener("pointerdown", down);
    zone?.addEventListener("pointermove", move);
    zone?.addEventListener("pointerup", up);
    zone?.addEventListener("pointercancel", up);

    // load three.js only on the client, after first paint
    import("@/components/three/khayalScene").then(({ createKhayalScene }) => {
      if (disposed) return;
      const scene = createKhayalScene(canvas, {
        stationIds: STATIONS,
        getProgress,
        labelMarkUrl: "/images/khayal-mark-silver.png",
        labelFont: getComputedStyle(document.body).fontFamily || "sans-serif",
        reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      });
      dispose = scene.dispose;
      setDrag = scene.setDragRotation;
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(spin);
      zone?.removeEventListener("pointerdown", down);
      zone?.removeEventListener("pointermove", move);
      zone?.removeEventListener("pointerup", up);
      zone?.removeEventListener("pointercancel", up);
      dispose?.();
    };
  }, []);

  const eyebrow = "flex items-center gap-4 text-[11px] tracking-[0.42em] uppercase text-gold mb-5 before:block before:h-px before:w-7 before:bg-gold";
  const h2 = "font-serif-display font-medium text-ink text-[40px] md:text-[56px] lg:text-[72px] leading-[1.02] tracking-tight";
  const lead = "mt-6 mb-9 max-w-[42ch] text-stone text-[15px] leading-[1.8] font-light";
  const btn = "btn-sweep inline-flex items-center justify-center gap-3 bg-gold text-pure px-8 py-4 text-[12px] font-medium tracking-[0.2em] uppercase";
  const ghost = "inline-flex items-center justify-center border border-gold/40 text-ink px-8 py-4 text-[12px] font-medium tracking-[0.2em] uppercase hover:border-gold transition-colors";
  const section = "relative min-h-[100svh] flex px-4 md:px-[6vw] py-28";
  const panel = "max-w-[520px] max-md:w-full max-md:bg-gradient-to-t max-md:from-cream max-md:via-cream/80 max-md:to-transparent max-md:pt-10";

  return (
    <div ref={wrapRef} className="relative bg-cream">
      {/* sticky stage behind every section */}
      <div className="sticky top-0 h-[100svh] -mb-[100svh] z-0 pointer-events-none" aria-hidden="true">
        <canvas ref={canvasRef} className="block h-full w-full" />
        <div className="hero-mist" />
      </div>

      <div className="relative z-10">
        {/* 1 · hero */}
        <section data-station="hero" className={`${section} items-center max-md:items-end pt-40 md:pt-44`}>
          <div className={panel}>
            <p className={eyebrow}>Premium niche collection · Karachi</p>
            <h1 className="font-serif-display font-medium text-ink text-[48px] md:text-[72px] lg:text-[100px] leading-[1.0] tracking-tight">
              Some fragrances become <em className="text-gold-shimmer font-normal">memories.</em>
            </h1>
            <p className={lead}>
              Khayal means a thought, a memory, a feeling that stays with you. Premium perfumes and attars, made in
              Karachi and delivered across Pakistan.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/shop" className={btn}>Explore the collection</Link>
              <Link href="/story" className={ghost}>Our story</Link>
            </div>
          </div>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-3 text-stone text-[10px] tracking-[0.4em] uppercase" aria-hidden="true">
            Scroll<span className="block h-11 w-px bg-gradient-to-b from-gold to-transparent" />
          </div>
        </section>

        {/* 2 · collection: real bestsellers with add-to-cart */}
        <section data-station="collection" className={`${section} flex-col justify-center items-center text-center gap-12`}>
          <Reveal>
            <p className={`${eyebrow} justify-center`}>The signature line</p>
            <h2 className={h2}>Product <em className="text-gold-shimmer font-normal">collection</em></h2>
          </Reveal>
          {collection.length > 0 ? (
            <div className="grid w-full max-w-5xl grid-cols-1 sm:grid-cols-3 gap-5 text-left">
              {collection.map((p, i) => (
                <Reveal key={p.id} delay={i * 0.1} className={i === 1 ? "sm:-translate-y-5" : ""}>
                  <ProductCard product={p} />
                </Reveal>
              ))}
            </div>
          ) : null}
          <Link href="/shop" className={ghost}>View all fragrances</Link>
        </section>

        {/* 3 · 360° notes */}
        <section data-station="n360" className={`${section} items-center justify-between gap-6 max-md:flex-col max-md:justify-end max-md:items-stretch`}>
          <Reveal className="max-w-[300px] max-md:max-w-none max-md:bg-gradient-to-t max-md:from-cream max-md:to-cream/60 max-md:pt-6">
            <p className={eyebrow}>{featured?.title ?? "The Gentleman"}</p>
            <h2 className={h2}>Fragrance <em className="text-gold-shimmer font-normal">notes</em></h2>
            <ul className="mt-7 border-t border-gold/20">
              {facts.map(([k, v]) => (
                <li key={k} className="flex justify-between gap-4 border-b border-gold/20 py-3.5 text-[13px]">
                  <b className="font-normal text-gold-light uppercase tracking-[0.14em] text-[11px]">{k}</b>
                  <span className="text-stone text-right">{v}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <div
            ref={dragRef}
            role="img"
            aria-label="Drag to rotate the bottle"
            className="absolute left-1/2 top-1/2 h-[70vh] w-[min(420px,60vw)] -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing touch-pan-y max-md:top-[38%] max-md:h-[50vh]"
          />
          <Reveal className="max-w-[300px] text-right max-md:hidden">
            <p className={`${eyebrow} justify-end`}>Every angle</p>
            <div className="font-serif-display text-gold-light text-[86px] leading-none">360<sup className="text-[0.4em]">°</sup></div>
            <p className="mt-4 text-stone text-[15px] leading-[1.8] font-light">Drag the bottle to turn it. Golden trails follow the scent as it moves around you.</p>
          </Reveal>
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.35em] uppercase text-stone whitespace-nowrap max-md:hidden">Drag to rotate · 360°</div>
        </section>

        {/* 4 · story */}
        <section data-station="story" className={`${section} items-center justify-end max-md:items-end max-md:justify-start`}>
          <Reveal className={panel}>
            <p className={eyebrow}>Our story</p>
            <h2 className={h2}>A thought, <em className="text-gold-shimmer font-normal">bottled.</em></h2>
            <p className={lead}>
              A scent can return you to a person, a place or a single evening years later. Khayal was founded in Karachi
              to make fragrances that do exactly that, crafted with care and kept within reach.
            </p>
            <Link href="/story" className={ghost}>Read our story</Link>
          </Reveal>
        </section>

        {/* 5 · top / heart / base */}
        <section data-station="notes" className={`${section} flex-col items-center justify-center text-center max-md:justify-end`}>
          <Reveal>
            <p className={`${eyebrow} justify-center`}>Anatomy of a scent</p>
          </Reveal>
          <Reveal className="mt-6 grid max-w-[460px] gap-9 max-md:bg-cream/70 max-md:p-5">
            {([["First impression", "Top notes", notes.top], ["The character", "Heart notes", notes.heart], ["What stays", "Base notes", notes.base]] as const).map(([k, t, v]) => (
              <div key={t}>
                <p className="text-[10px] tracking-[0.4em] uppercase text-gold mb-2">{k}</p>
                <h3 className="font-serif-display text-ink text-[32px] md:text-[40px] font-medium">{t}</h3>
                <p className="mt-2 text-stone text-[14px] leading-[1.7]">{v}</p>
              </div>
            ))}
          </Reveal>
        </section>

        {/* 6 · presence */}
        <section data-station="presence" className={`${section} items-center max-md:items-end`}>
          <Reveal className={panel}>
            <p className={eyebrow}>{featured?.title ?? "The Gentleman"} · Eau de parfum</p>
            <h2 className={h2}>More than a fragrance. <em className="text-gold-shimmer font-normal">A presence.</em></h2>
            <p className={lead}>Fresh at the first breath, deep by evening. Made for the moments you want to be remembered.</p>
            <div className="flex flex-wrap gap-3">
              <Link href={featuredHref} className={btn}>Shop {featured?.title ?? "now"}</Link>
              <Link href="/scent-finder" className={ghost}>Find your scent</Link>
            </div>
          </Reveal>
        </section>
      </div>
    </div>
  );
}
