"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signatureFragrances } from "@/lib/fragrance-copy";

const SLIDE_MS = 6000;

interface HeroSliderProps {
  /** Handles of products that are live in the shop; other slides link to /shop. */
  activeHandles: string[];
}

export default function HeroSlider({ activeHandles }: HeroSliderProps) {
  const slides = signatureFragrances;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback(
    (i: number) => setIndex(((i % slides.length) + slides.length) % slides.length),
    [slides.length],
  );

  const isPaused = paused || userPaused;

  useEffect(() => {
    if (isPaused) return;
    timer.current = setTimeout(() => goTo(index + 1), SLIDE_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [index, isPaused, goTo]);

  const hrefFor = (handle: string) => (activeHandles.includes(handle) ? `/shop/${handle}` : "/shop");

  return (
    <section
      className="relative overflow-hidden bg-cream pt-28 md:pt-32"
      aria-roledescription="carousel"
      aria-label="Signature fragrances"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      style={{ ["--kh-slide-ms" as string]: `${SLIDE_MS}ms` }}
    >
      <span
        aria-hidden="true"
        className="kh-mark pointer-events-none absolute -left-16 top-24 h-[760px] text-aubergine opacity-[0.05]"
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 pb-16 md:px-8 lg:grid-cols-[1fr_1.05fr] lg:gap-16 lg:px-12 lg:pb-24">
        <div className="relative z-10 flex flex-col gap-7 pt-6 lg:pt-0">
          <span lang="ur" className="kh-in kh-d1 font-urdu text-3xl leading-[1.9] text-gold-deep">
            خیال
          </span>
          <h1 className="kh-in kh-d2 font-serif-display text-[52px] font-normal leading-[0.98] tracking-[-0.01em] text-ink sm:text-[68px] lg:text-[92px]">
            Some fragrances become <em className="text-gold-deep">memories.</em>
          </h1>
          <p className="kh-in kh-d3 max-w-md text-lg leading-relaxed text-stone">
            Eleven eau de parfums that last from morning to the last dance. Each one travels with its
            own tester.
          </p>
          <div className="kh-in kh-d4 flex flex-wrap items-center gap-7">
            <Link
              href="/shop"
              className="kh-btn inline-flex min-h-[54px] items-center bg-ink px-8 text-xs font-medium uppercase tracking-[0.24em] text-cream hover:bg-aubergine"
            >
              Discover the collection
            </Link>
            <Link
              href="/scent-finder"
              className="border-b border-ink/40 py-3 text-xs font-medium uppercase tracking-[0.24em] text-ink transition-colors hover:border-gold-deep hover:text-gold-deep"
            >
              Find your scent
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[560px] overflow-hidden bg-[#0d1016] shadow-[0_40px_80px_-30px_rgba(26,26,26,0.45)]">
            {slides.map((slide, i) => (
              <div key={slide.handle} className="kh-slide" data-active={i === index} aria-hidden={i !== index}>
                <Image
                  src={slide.image}
                  alt={`${slide.name} eau de parfum bottle on dark stone`}
                  fill
                  priority={i === 0}
                  sizes="(max-width: 1024px) 92vw, 560px"
                  className="object-cover"
                />
              </div>
            ))}

            <div className="absolute inset-x-6 bottom-6 h-[76px] text-cream">
              {slides.map((slide, i) => (
                <Link
                  key={slide.handle}
                  href={hrefFor(slide.handle)}
                  className="kh-cap flex flex-col items-end gap-1 text-right"
                  data-active={i === index}
                  aria-hidden={i !== index}
                  tabIndex={i === index ? 0 : -1}
                >
                  <span className="text-[11px] uppercase tracking-[0.24em] text-gold-pale">{slide.audience}</span>
                  <span className="font-serif-display text-2xl tracking-[0.08em]">{slide.name}</span>
                  <span className="hidden text-sm text-cream/80 sm:block">{slide.notes}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="mx-auto mt-6 flex max-w-[560px] items-center justify-between gap-4 text-ink">
            <div className="flex gap-3">
              {slides.map((slide, i) => (
                <button
                  key={slide.handle}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Show ${slide.name}`}
                  aria-current={i === index}
                  className="kh-bar flex h-11 w-12 items-center"
                  data-state={i === index ? "active" : i < index ? "done" : "idle"}
                  data-paused={isPaused}
                >
                  <span />
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setUserPaused((p) => !p)}
                aria-label={userPaused ? "Play slideshow" : "Pause slideshow"}
                className="flex h-11 w-11 items-center justify-center rounded-full text-stone transition-colors hover:text-ink"
              >
                {userPaused ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4l13 8-13 8z" /></svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6 4h4v16H6zM14 4h4v16h-4z" /></svg>
                )}
              </button>
              <button
                type="button"
                onClick={() => goTo(index - 1)}
                aria-label="Previous fragrance"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border transition-colors hover:border-gold hover:bg-gold/10"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
              </button>
              <button
                type="button"
                onClick={() => goTo(index + 1)}
                aria-label="Next fragrance"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border transition-colors hover:border-gold hover:bg-gold/10"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
