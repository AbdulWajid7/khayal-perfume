import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import RevealMask from "@/components/ui/RevealMask";
import Parallax from "@/components/ui/Parallax";

export default function BrandStoryTeaser() {
  return (
    <section className="py-20 md:py-28 bg-cream-dark border-y border-border">
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <Reveal>
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-cream border border-border">
              <Parallax strength={10}>
                <Image
                  src="/images/brand-story.png"
                  alt="A sculptural Khayal perfume bottle in soft light"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  loading="lazy"
                />
              </Parallax>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="lg:pl-8">
              <span className="text-stone-light text-6xl font-serif-display font-medium leading-none opacity-30 select-none">
                01
              </span>
              <RevealMask as="h2" className="mt-4 font-serif-display text-ink text-[36px] md:text-[44px] font-medium tracking-tight leading-tight">
                Born from Imagination
              </RevealMask>
              <p className="mt-6 text-stone text-base leading-relaxed">
                Khayal is not merely a fragrance house — it is a quiet rebellion against the
                ordinary. Every scent begins as a vision: a midnight conversation, a forgotten
                memory, a golden thread of oud rising through cold air. We compose with rare
                resins, hand-picked blooms, and the patience of artisans who believe luxury should
                whisper, not shout.
              </p>
              <p className="mt-4 text-stone text-base leading-relaxed">
                Our perfumes are made for the moments when you want to feel unforgettably yourself.
              </p>
              <div className="mt-8">
                <Link
                  href="/story"
                  className="inline-flex items-center justify-center border border-ink/30 text-ink rounded-lg px-6 py-3 text-sm font-medium hover:border-gold hover:text-gold transition-colors"
                >
                  Our Story
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
