"use client";

/**
 * 3D homepage experience in the Khayal cream, gold and plum theme.
 *
 * A sticky WebGL canvas sits behind six full-height sections; the bottle
 * travels between them (see khayalScene.ts).
 * - Desktop: each wheel / arrow-key step glides to the next section, like
 *   slides, with a zoom-and-blur transition. Leaving the last section hands
 *   back to normal scrolling for the rest of the page.
 * - Mobile, touch and reduced motion: normal smooth scrolling.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "@/components/ui/AddToCartButton";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types/product";
import type { BottleVariant, KhayalScene, StationId } from "@/components/three/khayalScene";

const STATIONS: StationId[] = ["hero", "collection", "n360", "story", "notes", "presence"];
const LABELS = ["Welcome", "Collection", "Notes", "Our story", "Anatomy", "The Gentleman"];

function metafield(product: Product | undefined, key: string): string | undefined {
  return product?.metafields.find((m) => m.namespace === "custom" && m.key === key)?.value;
}

/** Bottle colourway per product: blue for men, rose for women, amber for unisex. */
function variantFor(p: Product | undefined): BottleVariant {
  const type = (p?.productType || "").toLowerCase();
  const name = p?.title || "The Gentleman";
  if (/gentleman/i.test(name) || type === "men")
    return { name, line: "For men", top: 0x4fb6e3, mid: 0x1d5c9e, low: 0x0a1230, base: 0x1a2a7a };
  if (type === "women")
    return { name, line: "For her", top: 0xf2b6c6, mid: 0xb24a6e, low: 0x3a0f22, base: 0x6a1a3a };
  return { name, line: "Unisex", top: 0xf0c27a, mid: 0xa2561e, low: 0x2a1206, base: 0x5a2a0c };
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

interface Props {
  products: Product[];
}

export default function KhayalExperience({ products }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<KhayalScene | null>(null);
  const goToRef = useRef<(i: number) => void>(() => {});

  const slides = products.slice(0, 4);
  const [heroIdx, setHeroIdx] = useState(0);
  const [carIdx, setCarIdx] = useState(Math.min(1, Math.max(0, products.length - 1)));
  const [noteTab, setNoteTab] = useState(0);
  const [active, setActive] = useState(0);

  const featured = products.find((p) => /gentleman/i.test(p.title)) ?? products[0];
  const heroProduct = slides[heroIdx] ?? featured;

  const notes = [
    { k: "Top notes", sub: "First impression", v: metafield(featured, "scent_notes_top") ?? "Bergamot, cardamom and a cold citrus spark" },
    { k: "Heart notes", sub: "The character", v: metafield(featured, "scent_notes_heart") ?? "Lavender, vetiver and soft spice" },
    { k: "Base notes", sub: "What stays", v: metafield(featured, "scent_notes_base") ?? "Oud, amber and warm musk" },
  ];
  const facts = [
    ["Family", metafield(featured, "scent_family") ?? "Fresh aromatic"],
    ["Longevity", metafield(featured, "longevity") ?? "Long lasting"],
    ["Sillage", metafield(featured, "sillage") ?? "Moderate"],
    ["Occasion", metafield(featured, "occasion") ?? "Day into evening"],
  ];

  // the hero slider recolours the 3D bottle; every later section shows the featured bottle
  const shown = active === 0 ? heroProduct : featured;
  const shownRef = useRef(shown);
  shownRef.current = shown;
  useEffect(() => {
    sceneRef.current?.setVariant(variantFor(shown));
  }, [shown]);

  const stepHero = useCallback((d: number) => {
    if (slides.length < 2) return;
    setHeroIdx((i) => (i + d + slides.length) % slides.length);
  }, [slides.length]);
  const stepCar = useCallback((d: number) => {
    if (products.length < 2) return;
    setCarIdx((i) => (i + d + products.length) % products.length);
  }, [products.length]);

  useEffect(() => {
    const canvas = canvasRef.current, wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    let disposed = false;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const sections = STATIONS.map((id) => wrap.querySelector<HTMLElement>(`[data-station="${id}"]`)!);
    const contents = sections.map((s) => [...s.querySelectorAll<HTMLElement>("[data-content]")]);

    const getProgress = () => {
      const mid = window.innerHeight * 0.5;
      let p = 0;
      sections.forEach((s, i) => {
        const r = s.getBoundingClientRect();
        if (r.top <= mid) p = i + Math.min((mid - r.top) / r.height, 1) - 0.5;
      });
      return Math.max(0, Math.min(p, STATIONS.length - 1));
    };

    /* ---- slide navigation (desktop with a fine pointer only) ---- */
    const slideMode = () => !reduce && window.innerWidth >= 1024 && window.matchMedia("(pointer: fine)").matches;
    let animating = false, lockUntil = 0, tween = 0;
    const sectionTop = (i: number) => window.scrollY + sections[i].getBoundingClientRect().top;
    const goTo = (i: number) => {
      const target = sectionTop(Math.max(0, Math.min(i, STATIONS.length - 1)));
      if (!slideMode()) { window.scrollTo({ top: target, behavior: reduce ? "auto" : "smooth" }); return; }
      animating = true; cancelAnimationFrame(tween);
      const lenis = window.__lenis;
      if (lenis) {
        // let the site's smooth-scroll library run the glide so the two never fight
        lenis.scrollTo(target, {
          duration: 1.1, easing: ease, lock: true, force: true,
          onComplete: () => { animating = false; lockUntil = performance.now() + 450; },
        });
        return;
      }
      const from = window.scrollY, dist = target - from, dur = 1100, start = performance.now();
      const stepF = (now: number) => {
        const k = Math.min(1, (now - start) / dur);
        window.scrollTo(0, from + dist * ease(k));
        if (k < 1) tween = requestAnimationFrame(stepF);
        else { animating = false; lockUntil = performance.now() + 450; }
      };
      tween = requestAnimationFrame(stepF);
    };
    goToRef.current = goTo;
    // slide mode only engages while the experience fills the viewport
    const engaged = () => {
      const r = wrap.getBoundingClientRect();
      return r.top <= 2 && r.bottom >= window.innerHeight - 2;
    };
    const currentIndex = () => Math.round(getProgress());
    const onWheel = (e: WheelEvent) => {
      if (!slideMode() || !engaged()) return;
      const dir = Math.sign(e.deltaY);
      if (!dir) return;
      const idx = currentIndex();
      // hand back to normal scrolling past the last section, and above the first
      if (!animating && ((dir > 0 && idx >= STATIONS.length - 1) || (dir < 0 && idx <= 0))) return;
      e.preventDefault();
      e.stopPropagation();
      if (animating || performance.now() < lockUntil || Math.abs(e.deltaY) < 4) return;
      goTo(idx + dir);
    };
    const onKey = (e: KeyboardEvent) => {
      if (!slideMode() || !engaged()) return;
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || tag === "BUTTON" || tag === "A") return;
      const down = ["ArrowDown", "PageDown", " "].includes(e.key), up = ["ArrowUp", "PageUp"].includes(e.key);
      if (!down && !up) return;
      const idx = currentIndex();
      if ((down && idx >= STATIONS.length - 1) || (up && idx <= 0)) return;
      e.preventDefault();
      if (!animating) goTo(idx + (down ? 1 : -1));
    };
    // capture phase so the site's smooth-scroll library doesn't also react
    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    window.addEventListener("keydown", onKey);

    /* ---- per-frame UI: zoom/blur transitions and dots ---- */
    let ui = 0, lastActive = -1;
    const uiFrame = () => {
      ui = requestAnimationFrame(uiFrame);
      const p = getProgress();
      contents.forEach((els, i) => {
        const d = Math.min(1, Math.abs(p - i));
        const k = reduce ? (d > 0.5 ? 1 : 0) : d;
        els.forEach((el) => {
          el.style.opacity = String(1 - Math.min(1, Math.max(0, (k - 0.12) / 0.45)));
          if (!reduce) {
            el.style.filter = k > 0.1 ? `blur(${((k - 0.1) * 10).toFixed(2)}px)` : "";
            el.style.transform = `scale(${(1 - k * 0.07).toFixed(4)}) translateY(${((p - i) * -40).toFixed(1)}px)`;
          }
        });
      });
      const idx = Math.round(p);
      if (idx !== lastActive) { lastActive = idx; setActive(idx); }
      const dots = dotsRef.current;
      if (dots) {
        const r = wrap.getBoundingClientRect();
        const show = r.top <= 2 && r.bottom > window.innerHeight * 0.6;
        dots.style.opacity = show ? "1" : "0";
        dots.style.pointerEvents = show ? "auto" : "none";
      }
    };
    ui = requestAnimationFrame(uiFrame);

    /* ---- drag to rotate in the 360° section ---- */
    let rot = 0, vel = 0, dragging = false, lastX = 0, spin = 0;
    const zone = dragRef.current;
    const coast = () => {
      if (dragging || Math.abs(vel) < 0.0005) return;
      vel *= 0.94; rot += vel; sceneRef.current?.setDragRotation(rot);
      spin = requestAnimationFrame(coast);
    };
    const down = (e: PointerEvent) => { dragging = true; lastX = e.clientX; zone?.setPointerCapture(e.pointerId); cancelAnimationFrame(spin); };
    const move = (e: PointerEvent) => { if (!dragging) return; vel = (e.clientX - lastX) * 0.012; lastX = e.clientX; rot += vel; sceneRef.current?.setDragRotation(rot); };
    const up = () => { dragging = false; spin = requestAnimationFrame(coast); };
    zone?.addEventListener("pointerdown", down);
    zone?.addEventListener("pointermove", move);
    zone?.addEventListener("pointerup", up);
    zone?.addEventListener("pointercancel", up);

    // three.js loads on the client after first paint
    import("@/components/three/khayalScene").then(({ createKhayalScene }) => {
      if (disposed) return;
      sceneRef.current = createKhayalScene(canvas, {
        stationIds: STATIONS,
        getProgress,
        labelMarkUrl: "/images/khayal-mark-silver.png",
        labelFont: getComputedStyle(document.body).fontFamily || "sans-serif",
        reducedMotion: reduce,
      });
      sceneRef.current.setVariant(variantFor(shownRef.current));
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(ui); cancelAnimationFrame(spin); cancelAnimationFrame(tween);
      window.removeEventListener("wheel", onWheel, { capture: true });
      window.removeEventListener("keydown", onKey);
      zone?.removeEventListener("pointerdown", down);
      zone?.removeEventListener("pointermove", move);
      zone?.removeEventListener("pointerup", up);
      zone?.removeEventListener("pointercancel", up);
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, []);

  // carousel swipe
  const swipe = useRef<number | null>(null);

  const eyebrow = "flex items-center gap-4 text-[11px] tracking-[0.32em] uppercase text-gold font-medium mb-5 before:block before:h-px before:w-10 before:bg-gold";
  const h2 = "font-serif-display font-medium text-ink text-[40px] md:text-[56px] lg:text-[68px] leading-[1.02] tracking-tight";
  const lead = "mt-6 mb-9 max-w-[42ch] text-stone text-base md:text-lg font-light leading-relaxed";
  const btn = "btn-sweep inline-flex items-center justify-center gap-3 bg-gold text-pure px-8 py-4 text-[12px] font-medium tracking-[0.2em] uppercase";
  const ghost = "btn-sweep inline-flex items-center justify-center border border-ink/40 text-ink px-8 py-4 text-[12px] font-medium tracking-[0.2em] uppercase hover:border-gold transition-colors";
  const arrow = "inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink/25 text-ink hover:border-gold hover:text-gold transition-colors bg-cream/70 backdrop-blur-sm";
  const section = "relative min-h-[100svh] lg:h-[100svh] lg:min-h-0 flex px-4 md:px-[6vw] py-28 lg:py-20";
  const panel = "max-w-[540px] max-md:w-full max-md:bg-gradient-to-t max-md:from-cream max-md:via-cream/85 max-md:to-transparent max-md:pt-10";
  const dot = (on: boolean) => `h-1.5 rounded-full transition-all duration-500 ${on ? "w-6 bg-gold" : "w-1.5 bg-ink/25 hover:bg-gold/60"}`;

  return (
    <div ref={wrapRef} className="relative bg-cream overflow-x-clip">
      {/* sticky stage behind every section */}
      <div className="sticky top-0 h-[100svh] -mb-[100svh] z-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="hero-mist" />
        <canvas ref={canvasRef} className="relative block h-full w-full" />
      </div>

      {/* section dots */}
      <nav ref={dotsRef} aria-label="Homepage sections" className="fixed right-4 md:right-7 top-1/2 -translate-y-1/2 z-30 flex flex-col items-end gap-3 transition-opacity duration-500 opacity-0">
        {STATIONS.map((id, i) => (
          <button key={id} type="button" onClick={() => goToRef.current(i)} aria-label={`Go to ${LABELS[i]}`} aria-current={active === i ? "true" : undefined}
            className="group flex items-center justify-end gap-3 py-0.5">
            <span className="hidden lg:block text-[10px] uppercase tracking-[0.25em] text-stone opacity-0 group-hover:opacity-100 transition-opacity">{LABELS[i]}</span>
            <span className={`block rounded-full transition-all duration-500 ${active === i ? "h-6 w-1.5 bg-gold" : "h-1.5 w-1.5 bg-ink/30 group-hover:bg-gold/70"}`} />
          </button>
        ))}
      </nav>

      <div className="relative z-10">
        {/* 1 · hero slider */}
        <section data-station="hero" className={`${section} items-center max-md:items-end pt-40 md:pt-44 lg:pt-28`}>
          <div data-content className={`${panel} will-change-transform`}>
            <p className={eyebrow}>Premium niche collection — Karachi</p>
            <h1 className="font-serif-display font-medium text-ink text-[46px] md:text-[64px] xl:text-[80px] leading-[1.0] tracking-tight">
              Some fragrances
              <br />
              <span className="text-gold-shimmer">become memories.</span>
            </h1>
            <p key={heroProduct?.id ?? "intro"} className={`${lead} kx-fade-up`}>
              {heroProduct ? (
                <>
                  Meet <span className="text-ink font-normal">{heroProduct.title}</span>
                  {metafield(heroProduct, "scent_family") ? `, ${metafield(heroProduct, "scent_family")!.toLowerCase()}` : ""}.
                  {" "}Premium perfumes and attars, made in Karachi and delivered across Pakistan.
                </>
              ) : (
                "Khayal means a thought, a memory, a feeling that stays with you. Premium perfumes and attars, made in Karachi and delivered across Pakistan."
              )}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href={heroProduct ? `/shop/${heroProduct.handle}` : "/shop"} className={btn}>
                {heroProduct ? `Shop ${heroProduct.title}` : "Explore the collection"}
              </Link>
              <Link href="/story" className={ghost}>Our story</Link>
            </div>
            {slides.length > 1 && (
              <div className="mt-10 flex items-center gap-4">
                <button type="button" className={arrow} onClick={() => stepHero(-1)} aria-label="Previous fragrance">←</button>
                <div className="flex items-center gap-2">
                  {slides.map((p, i) => (
                    <button key={p.id} type="button" onClick={() => setHeroIdx(i)} aria-label={`Show ${p.title}`} className={dot(i === heroIdx)} />
                  ))}
                </div>
                <button type="button" className={arrow} onClick={() => stepHero(1)} aria-label="Next fragrance">→</button>
                <span className="ml-2 text-[11px] uppercase tracking-[0.25em] text-stone tabular">
                  {String(heroIdx + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
                </span>
              </div>
            )}
          </div>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-3 text-stone text-[10px] tracking-[0.34em] uppercase" aria-hidden="true">
            Scroll<span className="block h-10 w-px bg-stone/60" />
          </div>
        </section>

        {/* 2 · collection carousel */}
        <section data-station="collection" className={`${section} flex-col justify-center items-center text-center lg:pt-28 overflow-x-clip`}>
          <div data-content className="w-full will-change-transform">
            <p className={`${eyebrow} justify-center`}>The signature line</p>
            <h2 className="font-serif-display font-medium text-ink text-[40px] md:text-[52px] leading-[1.02] tracking-tight">Product <span className="text-gold-shimmer italic">collection</span></h2>
            {products.length > 0 && (
              <>
                <div
                  className="relative mx-auto mt-8 h-[450px] md:h-[440px] w-full max-w-5xl [perspective:1400px] select-none"
                  onPointerDown={(e) => { swipe.current = e.clientX; }}
                  onPointerUp={(e) => {
                    if (swipe.current !== null && Math.abs(e.clientX - swipe.current) > 40) stepCar(e.clientX < swipe.current ? 1 : -1);
                    swipe.current = null;
                  }}
                >
                  {products.map((p, i) => {
                    const n = products.length;
                    let k = i - carIdx;
                    if (k > n / 2) k -= n;
                    if (k < -n / 2) k += n;
                    const abs = Math.abs(k);
                    const img = p.featuredImage || p.images[0];
                    const centre = k === 0;
                    return (
                      <div
                        key={p.id}
                        className="absolute left-1/2 top-0 w-[230px] md:w-[250px] transition-all duration-700 ease-[cubic-bezier(.22,1,.36,1)]"
                        style={{
                          transform: `translateX(calc(-50% + ${k * 78}%)) translateZ(${centre ? 60 : -120 * abs}px) rotateY(${-k * 22}deg) scale(${centre ? 1 : 0.84})`,
                          opacity: abs > 2 ? 0 : centre ? 1 : 0.55,
                          filter: centre ? "none" : "blur(1.5px) saturate(.8)",
                          zIndex: 10 - abs,
                          pointerEvents: abs > 1 ? "none" : "auto",
                        }}
                      >
                        <article className={`relative overflow-hidden rounded-2xl border bg-pure text-left transition-shadow duration-500 ${centre ? "border-gold/40 shadow-[0_30px_80px_-30px_rgba(191,161,95,.55)]" : "border-border"}`}>
                          <button type="button" onClick={() => !centre && setCarIdx(i)} tabIndex={centre ? -1 : 0}
                            aria-label={centre ? `${p.title}` : `Show ${p.title}`} className="block w-full cursor-pointer">
                            <div className="relative aspect-[4/5] bg-cream-dark overflow-hidden">
                              <div className="absolute inset-0 bg-[radial-gradient(60%_55%_at_50%_45%,rgba(191,161,95,.28),transparent_70%)]" />
                              {img && (
                                <Image src={img.url} alt={img.altText || p.title} fill sizes="300px"
                                  className={`object-cover ${centre ? "kx-float-tilt" : ""}`} />
                              )}
                              {centre && (
                                <span className="absolute top-3 left-3 bg-gold text-pure text-[10px] uppercase tracking-[0.15em] px-2.5 py-1 rounded-md font-medium">Signature</span>
                              )}
                            </div>
                          </button>
                          <div className="p-4">
                            <Link href={`/shop/${p.handle}`} tabIndex={centre ? 0 : -1} className="block">
                              <h3 className="font-serif-display text-ink text-xl font-medium line-clamp-1">{p.title}</h3>
                            </Link>
                            <p className="mt-1 text-gold text-sm font-medium tabular">
                              {formatPrice(Number.parseFloat(p.priceRange.minVariantPrice.amount), p.priceRange.minVariantPrice.currencyCode)}
                            </p>
                            <div className={`mt-3 transition-opacity duration-500 ${centre ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                              <AddToCartButton product={p} fullWidth />
                            </div>
                          </div>
                        </article>
                      </div>
                    );
                  })}
                </div>
                {products.length > 1 && (
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-4">
                    <button type="button" className={arrow} onClick={() => stepCar(-1)} aria-label="Previous product">←</button>
                    <div className="flex items-center gap-2">
                      {products.map((p, i) => (
                        <button key={p.id} type="button" onClick={() => setCarIdx(i)} aria-label={`Show ${p.title}`} className={dot(i === carIdx)} />
                      ))}
                    </div>
                    <button type="button" className={arrow} onClick={() => stepCar(1)} aria-label="Next product">→</button>
                    <Link href="/shop" className="ml-2 link-hover-gold text-[11px] uppercase tracking-[0.22em] text-ink">View all fragrances</Link>
                  </div>
                )}
              </>
            )}
            {products.length < 2 && <div className="mt-8"><Link href="/shop" className={ghost}>View all fragrances</Link></div>}
          </div>
        </section>

        {/* 3 · 360° notes with tabs */}
        <section data-station="n360" className={`${section} items-center justify-between gap-6 max-md:flex-col max-md:justify-end max-md:items-stretch`}>
          <div data-content className="relative z-10 max-w-[330px] max-md:max-w-none max-md:bg-gradient-to-t max-md:from-cream max-md:to-cream/60 max-md:pt-6 will-change-transform">
            <p className={eyebrow}>{featured?.title ?? "The Gentleman"}</p>
            <h2 className={h2}>Fragrance <span className="text-gold-shimmer italic">notes</span></h2>
            <div role="tablist" aria-label="Scent notes" className="mt-7 flex gap-2">
              {notes.map((n, i) => (
                <button key={n.k} role="tab" type="button" aria-selected={noteTab === i} onClick={() => setNoteTab(i)}
                  className={`px-4 py-2 rounded-full text-[11px] uppercase tracking-[0.18em] border transition-colors duration-300 ${noteTab === i ? "bg-ink text-pure border-ink" : "text-stone border-border hover:border-gold hover:text-ink"}`}>
                  {n.k.split(" ")[0]}
                </button>
              ))}
            </div>
            <div key={noteTab} role="tabpanel" className="mt-5 kx-fade-up">
              <p className="text-[10px] uppercase tracking-[0.3em] text-gold">{notes[noteTab].sub}</p>
              <p className="mt-2 font-serif-display text-ink text-2xl leading-snug">{notes[noteTab].v}</p>
            </div>
          </div>
          <div ref={dragRef} role="img" aria-label="Drag to rotate the bottle"
            className="absolute left-1/2 top-1/2 h-[70vh] w-[min(420px,60vw)] -translate-x-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing touch-pan-y max-md:top-[38%] max-md:h-[50vh]" />
          <div data-content className="relative z-10 max-w-[300px] text-right max-md:hidden will-change-transform">
            <p className={`${eyebrow} justify-end`}>Every angle</p>
            <div className="font-serif-display text-gold text-[86px] leading-none">360<sup className="text-[0.4em]">°</sup></div>
            <ul className="mt-5 border-t border-border text-left">
              {facts.map(([k, v]) => (
                <li key={k} className="flex justify-between gap-4 border-b border-border py-3 text-[13px]">
                  <b className="font-medium text-gold uppercase tracking-[0.14em] text-[11px]">{k}</b>
                  <span className="text-stone text-right">{v}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[10px] tracking-[0.3em] uppercase text-stone">Drag the bottle to turn it</p>
          </div>
        </section>

        {/* 4 · story: the cap floats away, golden leaves drift */}
        <section data-station="story" className={`${section} items-center justify-end max-md:items-end max-md:justify-start`}>
          <div data-content className={`${panel} will-change-transform`}>
            <p className={eyebrow}>Our story</p>
            <h2 className={h2}>A thought, <span className="text-gold-shimmer italic">bottled.</span></h2>
            <p className={lead}>
              A scent can return you to a person, a place or a single evening years later. Khayal was founded in Karachi
              to make fragrances that do exactly that, crafted with care and kept within reach.
            </p>
            <dl className="mb-9 grid grid-cols-3 gap-4 border-y border-border py-5 max-w-md">
              {[["Karachi", "Crafted in"], ["Small", "Batch blending"], ["Nationwide", "Delivery"]].map(([v, k]) => (
                <div key={k}>
                  <dt className="text-[10px] uppercase tracking-[0.22em] text-stone">{k}</dt>
                  <dd className="mt-1 font-serif-display text-ink text-xl">{v}</dd>
                </div>
              ))}
            </dl>
            <Link href="/story" className={ghost}>Read our story</Link>
          </div>
        </section>

        {/* 5 · top / heart / base, between the liquid-gold swirl and the dropper */}
        <section data-station="notes" className={`${section} flex-col items-center justify-center text-center max-md:justify-end`}>
          <div data-content className="will-change-transform">
            <p className={`${eyebrow} justify-center`}>Anatomy of a scent</p>
            <div className="mt-4 grid max-w-[460px] gap-8 max-md:bg-cream/80 max-md:p-5 max-md:rounded-xl">
              {notes.map((n) => (
                <div key={n.k}>
                  <p className="text-[10px] tracking-[0.32em] uppercase text-gold mb-2">{n.sub}</p>
                  <h3 className="font-serif-display text-ink text-[32px] md:text-[40px] font-medium">{n.k}</h3>
                  <p className="mt-2 text-stone text-[15px] leading-relaxed">{n.v}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6 · presence */}
        <section data-station="presence" className={`${section} items-center max-md:items-end`}>
          <div data-content className={`${panel} will-change-transform`}>
            <p className={eyebrow}>{featured?.title ?? "The Gentleman"} — Eau de parfum</p>
            <h2 className={h2}>More than a fragrance. <span className="text-gold-shimmer italic">A presence.</span></h2>
            <p className={lead}>Fresh at the first breath, deep by evening. Made for the moments you want to be remembered.</p>
            <div className="flex flex-wrap gap-3">
              <Link href={featured ? `/shop/${featured.handle}` : "/shop"} className={btn}>Shop {featured?.title ?? "now"}</Link>
              <Link href="/scent-finder" className={ghost}>Find your scent</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
