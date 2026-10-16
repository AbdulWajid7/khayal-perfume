import type { Metadata } from "next";
import Reveal from "@/components/ui/Reveal";
import RevealMask from "@/components/ui/RevealMask";

export const metadata: Metadata = {
  title: "Our Story",
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

const team: { name: string; title: string; subtitle?: string }[] = [
  { name: "Abdul Wajid", title: "Founder" },
  { name: "Ammar Bukhari", title: "Co-Founder", subtitle: "Sales Team Lead" },
];

export default function StoryPage() {
  return (
    <div className="bg-cream">
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(191,161,95,0.08),_transparent_50%),radial-gradient(circle_at_70%_80%,_rgba(122,59,154,0.06),_transparent_50%)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-4xl px-4 md:px-8 lg:px-12 text-center">
          <span className="eyebrow">The House</span>
          <RevealMask
            as="h1"
            className="mt-4 font-serif-display text-ink text-4xl md:text-6xl font-medium tracking-tight"
          >
            Our Story
          </RevealMask>
          <p className="mt-6 text-stone text-lg leading-relaxed max-w-2xl mx-auto">
            Khayal means a thought, a memory, a feeling that stays with you. Founded in Karachi,
            we craft premium fragrances made to become memories.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-cream">
        <div className="mx-auto max-w-3xl px-4 md:px-8 lg:px-12 text-center">
          <Reveal>
            <span className="eyebrow">The Founder</span>
            <blockquote className="mt-6 font-serif-display text-ink text-xl md:text-2xl font-medium leading-relaxed">
              &ldquo;I started Khayal because fragrance is more than just a pleasant smell — it can
              bring back memories, emotions, and thoughts of someone special. I wanted to create
              premium fragrances that people in Pakistan could connect with emotionally, while
              keeping them affordable.&rdquo;
            </blockquote>
            <p className="mt-6 text-stone text-sm tracking-[0.2em] uppercase">
              — Abdul Wajid, Founder · Karachi
            </p>
          </Reveal>
        </div>
      </section>

      <section
        className="relative overflow-hidden bg-aubergine py-20 md:py-28 text-cream"
        aria-labelledby="team-heading"
      >
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(191,161,95,0.18),_transparent_60%)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-5xl px-4 md:px-8 lg:px-12">
          <Reveal>
            <div className="text-center">
              <span className="text-[11px] font-medium uppercase tracking-[0.32em] text-gold-pale">The Team</span>
              <h2
                id="team-heading"
                className="mt-4 font-serif-display text-3xl md:text-5xl font-normal leading-tight"
              >
                The people behind <span className="italic text-gold-light">Khayal</span>
              </h2>
              <div className="mx-auto mt-6 flex items-center justify-center gap-3" aria-hidden="true">
                <span className="h-px w-12 bg-gold/50" />
                <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
                <span className="h-px w-12 bg-gold/50" />
              </div>
            </div>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 md:gap-10" role="list">
            {team.map((person, i) => (
              <Reveal key={person.name} delay={i * 0.12}>
                <div className="group relative h-full" role="listitem">
                  <div className="relative overflow-hidden border border-gold/30 bg-gradient-to-b from-[#4a2341] to-[#1f0d1b] transition-transform duration-500 group-hover:-translate-y-1.5">
                    <div className="pointer-events-none absolute inset-3 border border-gold/20" aria-hidden="true" />
                    <div className="relative flex aspect-square items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/images/khayal-watermark.png"
                        alt=""
                        aria-hidden="true"
                        className="absolute right-[-12%] top-1/2 h-[90%] -translate-y-1/2 opacity-[0.07] invert"
                      />
                      <span
                        className="relative font-serif-display italic text-[96px] md:text-[120px] leading-none text-transparent bg-clip-text bg-gradient-to-b from-gold-pale via-gold to-gold-deep"
                        aria-hidden="true"
                      >
                        {person.name.split(" ").map((w) => w[0]).join("")}
                      </span>
                      <span className="absolute left-6 top-6 text-[10px] uppercase tracking-[0.3em] text-gold-pale/70">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="relative flex min-h-[150px] flex-col items-center justify-center border-t border-gold/20 bg-[#1f0d1b]/80 px-6 py-7 text-center backdrop-blur">
                      <p className="font-serif-display text-2xl md:text-3xl text-cream">{person.name}</p>
                      <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.3em] text-gold">{person.title}</p>
                      {person.subtitle && (
                        <p className="mt-2 font-serif-display italic text-base text-cream/70">{person.subtitle}</p>
                      )}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <p className="mt-12 text-center text-xs uppercase tracking-[0.3em] text-cream/50">Karachi, Pakistan</p>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-cream-dark border-y border-border">
        <div className="mx-auto max-w-6xl px-4 md:px-8 lg:px-12">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="eyebrow">The Process</span>
              <h2 className="mt-3 font-serif-display text-ink text-3xl md:text-4xl font-medium tracking-tight">
                From Imagination to Bottle
              </h2>
            </div>
          </Reveal>

          <div className="space-y-12 md:space-y-0">
            {steps.map((step, index) => (
              <Reveal key={step.number} delay={index * 0.05}>
                <div className="md:grid md:grid-cols-[80px_1fr] gap-6 md:gap-10 items-start">
                  <div className="hidden md:flex items-center justify-center w-20 h-20 rounded-full border border-border bg-pure text-gold font-serif-display text-2xl">
                    {step.number}
                  </div>
                  <div className="border-l border-gold pl-6 md:pl-0 md:border-l-0 md:py-4">
                    <div className="md:hidden text-gold font-serif-display text-2xl mb-2">
                      {step.number}
                    </div>
                    <h3 className="text-ink text-xl md:text-2xl font-medium font-serif-display">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-stone leading-relaxed max-w-2xl">
                      {step.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-cream">
        <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="eyebrow">What We Believe</span>
              <h2 className="mt-3 font-serif-display text-ink text-3xl md:text-4xl font-medium tracking-tight">
                Our Values
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <Reveal key={value.title} delay={index * 0.1}>
                <div className="bg-pure border border-border rounded-2xl p-8 h-full">
                  <h3 className="font-serif-display text-ink text-2xl font-medium">{value.title}</h3>
                  <p className="mt-3 text-stone text-sm leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-cream-dark border-t border-border">
        <div className="mx-auto max-w-3xl px-4 md:px-8 lg:px-12 text-center">
          <Reveal>
            <blockquote className="font-serif-display text-ink text-2xl md:text-3xl font-medium leading-snug">
              &ldquo;Every Khayal fragrance is a journey from the invisible world of imagination to the
              visible moment on your skin.&rdquo;
            </blockquote>
            <p className="mt-6 text-stone text-sm tracking-[0.2em] uppercase">
              — Abdul Wajid, Founder
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
