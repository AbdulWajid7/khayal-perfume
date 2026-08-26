import type { Metadata } from "next";
import Reveal from "@/components/ui/Reveal";
import RevealMask from "@/components/ui/RevealMask";

export const metadata: Metadata = {
  title: "Our Story | Khayal Parfum",
  description:
    "Discover the journey of Khayal Parfum — from the first spark of imagination to the final bottle that reaches your hands.",
};

const steps = [
  {
    number: "01",
    title: "Sourcing the Extraordinary",
    description:
      "Every Khayal fragrance begins with rare, honest materials. Aged agarwood from Assam, Taif rose, Mysore sandalwood, and white musk are chosen not for convenience, but for character.",
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
    description: "Hand-blended, small-batch compositions that prioritize quality over volume.",
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
            Khayal is a quiet rebellion against the ordinary. We believe luxury should whisper, not
            shout — and that the right fragrance can turn an everyday moment into a memory.
          </p>
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
              — The Khayal Atelier
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
