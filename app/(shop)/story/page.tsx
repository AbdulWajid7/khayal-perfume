import type { Metadata } from "next";
import Reveal from "@/components/ui/Reveal";
import RevealMask from "@/components/ui/RevealMask";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Our Story | Khayal Fragrance",
  description:
    "Discover the journey of Khayal Fragrance — from the first spark of imagination to the final bottle that reaches your hands.",
};

const steps = [
  {
    number: "01",
    title: "Sourcing the Extraordinary",
    description:
      "Every Khayal fragrance begins with honest materials. Rich oud, rose, sandalwood, and white musk are chosen not for convenience, but for character.",
  },
  {
    number: "02",
    title: "Born from Imagination",
    description:
      "A scent is first a feeling: a midnight conversation, a forgotten corridor, the gold of oud rising through cold air. We compose around that memory until it becomes liquid.",
  },
  {
    number: "03",
    title: "The Art of Composition",
    description:
      "Our perfumers layer top, heart, and base notes in exact proportions. Each accord is tested, adjusted, and tested again until the fragrance tells a complete story from opening to dry-down.",
  },
  {
    number: "04",
    title: "Aging with Patience",
    description:
      "Great perfumes need time. Blends rest under controlled conditions, allowing oils to marry and deepen. This patience gives Khayal scents their lasting, evolving character.",
  },
  {
    number: "05",
    title: "Grading for Perfection",
    description:
      "Each sample is evaluated for longevity, projection, balance, and how it wears on Pakistani skin and fabric. Only compositions that pass every test move forward.",
  },
  {
    number: "06",
    title: "Designing the Bottle",
    description:
      "The name, bottle, and label are designed to reflect the soul of the scent inside. Every detail — from the cap weight to the typography — is considered.",
  },
  {
    number: "07",
    title: "Ready for You",
    description:
      "When a Khayal fragrance is launched, it is more than a product. It is an invitation to wear something unforgettably yours.",
  },
];

const values = [
  {
    title: "Craft",
    description: "Compositions built with patience, detail, and care — quality over volume.",
  },
  {
    title: "Longevity",
    description: "Formulas made to last through the day, on skin and in memory.",
  },
  {
    title: "Authenticity",
    description: "Oud, musk, amber, and rose used with honesty — never shortcuts.",
  },
  {
    title: "Intention",
    description: "Every scent is created to make a moment, not just a first impression.",
  },
];

export default function StoryPage() {
  const eyebrow = "flex items-center gap-4 text-[11px] tracking-[0.32em] uppercase text-gold font-medium before:block before:h-px before:w-10 before:bg-gold";
  const h2 = "mt-5 font-serif-display text-ink text-[36px] md:text-[52px] font-medium tracking-tight leading-[1.04]";
  return (
    <div className="bg-cream overflow-x-clip">
      {/* hero: title beside the brand photograph */}
      <section className="relative pt-36 pb-20 md:pt-44 md:pb-28">
        <div className="hero-mist" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 md:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-20 lg:px-12">
          <div>
            <p className={eyebrow}>The House</p>
            <RevealMask
              as="h1"
              className="mt-6 font-serif-display text-ink text-[48px] md:text-[76px] lg:text-[92px] font-medium tracking-tight leading-[0.98]"
            >
              Our Story
            </RevealMask>
            <p className="mt-3 font-serif-display italic text-gold-shimmer text-3xl md:text-4xl">A thought, bottled.</p>
            <p className="mt-8 text-stone text-lg font-light leading-relaxed max-w-xl">
              Khayal means a thought, a memory, a feeling that stays with you. Founded in Karachi,
              we craft premium fragrances made to become memories.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/shop" className="btn-sweep inline-flex items-center justify-center bg-gold text-pure px-8 py-4 text-[12px] font-medium tracking-[0.2em] uppercase">
                Explore the collection
              </Link>
              <Link href="#process" className="btn-sweep inline-flex items-center justify-center border border-ink/30 text-ink px-8 py-4 text-[12px] font-medium tracking-[0.2em] uppercase hover:border-gold transition-colors">
                How we make it
              </Link>
            </div>
          </div>
          <Reveal className="relative">
            <div className="pointer-events-none absolute -inset-8 rounded-[48px] bg-[radial-gradient(55%_50%_at_50%_45%,rgba(191,161,95,0.24),transparent_70%)]" aria-hidden="true" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-[32px] border border-border bg-cream-dark">
              <Image src="/images/brand-story.png" alt="A Khayal bottle in soft golden light" fill priority sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover hero-kenburns" />
            </div>
            <div className="absolute -bottom-7 -left-3 md:-left-8 rounded-2xl border border-gold/30 bg-pure px-6 py-5 shadow-[0_24px_60px_-30px_rgba(191,161,95,0.6)]">
              <p className="text-[10px] uppercase tracking-[0.28em] text-stone">Founded in</p>
              <p className="font-serif-display text-ink text-2xl">Karachi, Pakistan</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* founder */}
      <section className="relative py-24 md:py-32">
        <Image src="/images/khayal-watermark.png" alt="" width={520} height={860} aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 h-[120%] w-auto -translate-x-1/2 -translate-y-1/2 opacity-[0.07]" />
        <div className="relative mx-auto max-w-4xl px-4 md:px-8 lg:px-12 text-center">
          <Reveal>
            <p className={`${eyebrow} justify-center`}>The Founder</p>
            <span className="mt-6 block font-serif-display text-gold text-[96px] leading-[0.6]" aria-hidden="true">&ldquo;</span>
            <blockquote className="mt-2 font-serif-display text-ink text-2xl md:text-[34px] font-medium leading-[1.35] text-balance">
              I started Khayal because fragrance is more than just a pleasant smell — it can
              bring back memories, emotions, and thoughts of someone special. I wanted to create
              premium fragrances that people in Pakistan could connect with emotionally, while
              keeping them affordable.
            </blockquote>
            <p className="mt-8 text-stone text-[11px] tracking-[0.3em] uppercase">
              Abdul Wajid · Founder · Karachi
            </p>
          </Reveal>
        </div>
      </section>

      {/* process: alternating timeline on a gold line */}
      <section id="process" className="scroll-mt-28 py-24 md:py-32 bg-cream-dark/60 border-y border-border">
        <div className="mx-auto max-w-6xl px-4 md:px-8 lg:px-12">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-16 md:mb-24">
              <p className={`${eyebrow} justify-center`}>The Process</p>
              <h2 className={h2}>
                From imagination <span className="text-gold-shimmer italic">to bottle</span>
              </h2>
            </div>
          </Reveal>

          <ol className="relative">
            <span className="absolute left-[27px] top-2 bottom-2 w-px bg-gradient-to-b from-gold/0 via-gold/60 to-gold/0 md:left-1/2" aria-hidden="true" />
            {steps.map((step, index) => {
              const right = index % 2 === 1;
              return (
                <li key={step.number} className="relative grid grid-cols-[56px_1fr] gap-6 pb-12 md:grid-cols-[1fr_72px_1fr] md:gap-10 md:pb-16 last:pb-0">
                  <div className={`hidden md:block ${right ? "" : "md:text-right"}`}>
                    {!right && (
                      <Reveal>
                        <h3 className="font-serif-display text-ink text-2xl md:text-[28px] font-medium">{step.title}</h3>
                        <p className="mt-3 text-stone leading-relaxed md:ml-auto max-w-md">{step.description}</p>
                      </Reveal>
                    )}
                  </div>
                  <div className="relative z-10 flex justify-center">
                    <span className="grid h-14 w-14 place-items-center rounded-full border border-gold/50 bg-pure font-serif-display text-gold text-xl shadow-[0_10px_30px_-14px_rgba(191,161,95,0.8)] md:h-[72px] md:w-[72px] md:text-2xl">
                      {step.number}
                    </span>
                  </div>
                  <div className={right ? "" : "md:hidden"}>
                    <Reveal>
                      <h3 className="font-serif-display text-ink text-2xl md:text-[28px] font-medium">{step.title}</h3>
                      <p className="mt-3 text-stone leading-relaxed max-w-md">{step.description}</p>
                    </Reveal>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* values */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-14 md:mb-20">
              <p className={`${eyebrow} justify-center`}>What We Believe</p>
              <h2 className={h2}>
                Our <span className="text-gold-shimmer italic">values</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value, index) => (
              <Reveal key={value.title} delay={index * 0.1}>
                <div className="group relative h-full overflow-hidden rounded-[24px] border border-border bg-pure p-8 transition-all duration-500 hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_28px_60px_-30px_rgba(191,161,95,0.6)]">
                  <span className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent opacity-60 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                  <span className="font-serif-display text-gold text-sm tabular">{String(index + 1).padStart(2, "0")}</span>
                  <h3 className="mt-4 font-serif-display text-ink text-3xl font-medium">{value.title}</h3>
                  <p className="mt-3 text-stone leading-relaxed">{value.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* closing */}
      <section className="relative overflow-hidden py-24 md:py-32 bg-cream-dark/60 border-t border-border">
        <div className="hero-mist" aria-hidden="true" />
        <div className="relative mx-auto max-w-3xl px-4 md:px-8 lg:px-12 text-center">
          <Reveal>
            <blockquote className="font-serif-display text-ink text-3xl md:text-[44px] font-medium leading-[1.2] text-balance">
              &ldquo;Every Khayal fragrance is a journey from the invisible world of imagination to the
              visible moment on your skin.&rdquo;
            </blockquote>
            <p className="mt-8 text-stone text-[11px] tracking-[0.3em] uppercase">
              Abdul Wajid · Founder
            </p>
            <div className="mt-12 flex flex-wrap justify-center gap-3">
              <Link href="/shop" className="btn-sweep inline-flex items-center justify-center bg-gold text-pure px-8 py-4 text-[12px] font-medium tracking-[0.2em] uppercase">
                Shop the collection
              </Link>
              <Link href="/scent-finder" className="btn-sweep inline-flex items-center justify-center border border-ink/30 text-ink px-8 py-4 text-[12px] font-medium tracking-[0.2em] uppercase hover:border-gold transition-colors">
                Find your scent
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
