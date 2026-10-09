import type { Metadata } from "next";
import FAQAccordion from "@/components/ui/FAQAccordion";
import FAQSchema from "@/components/seo/FAQSchema";
import Link from "next/link";
import PageHero from "@/components/ui/PageHero";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "FAQ | Khayal Fragrance",
  description:
    "Answers to common questions about Khayal Fragrance — ordering, shipping, returns, attars, and choosing your fragrance.",
};

const items = [
  {
    question: "What makes Khayal Fragrance different?",
    answer:
      "Khayal creates long-lasting niche perfumes and attars inspired by South Asian, Middle Eastern, and modern Western perfumery. Every composition is built around high-quality ingredients like oud, rose, amber, and musk, blended for projection and character.",
  },
  {
    question: "How do I choose a fragrance?",
    answer:
      "Use our Scent Finder to answer a few questions about your mood, occasion, and intensity preferences. You can also explore collections by Men, Women, Unisex, or Scent Family.",
  },
  {
    question: "Do you ship across Pakistan?",
    answer:
      "Yes. Karachi orders are expected within 24 hours after confirmation. Other cities in Pakistan are expected within 3–4 working days. Delivery may be affected by holidays, weather, courier delays or remote-area availability. Delivery is free on orders of PKR 5,000 or more.",
  },
  {
    question: "How long do Khayal fragrances last?",
    answer:
      "Our eau de parfums are designed to last 8–12 hours on skin and much longer on fabric. Attars are oil-based and typically last 12+ hours with just a small dab.",
  },
  {
    question: "What is an attar?",
    answer:
      "Attars are concentrated, oil-based perfumes traditionally distilled into a base of sandalwood or other natural oils. They are alcohol-free, skin-friendly, and deeply long-lasting.",
  },
  {
    question: "What is your return policy?",
    answer:
      "Every fragrance order includes a separate tester. If the fragrance is unsuitable, contact KHAYAL on the same day of delivery while the full-size bottle remains unopened, unused and sealed. For damaged or incorrect products, notify us within 24 hours with clear photos or an unboxing video. After verification, we will arrange the appropriate exchange; requests do not qualify for an automatic refund.",
  },
  {
    question: "Can I order samples?",
    answer:
      "Sample discovery sets are released with limited collections. Subscribe to our newsletter to be the first to know when samples are available.",
  },
  {
    question: "How can I contact Khayal?",
    answer:
      "Email us at official@khayalparfum.com or send a message through Instagram or WhatsApp. We usually respond within 24 hours.",
  },
];

export default function FAQPage() {
  return (
    <div className="bg-cream">
      <FAQSchema items={items} />
      <PageHero
        eyebrow="Support"
        title="Frequently asked"
        accent="questions"
        intro="Everything you need to know about ordering, wearing, and caring for your Khayal fragrance."
      />
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12 pb-24 md:pb-32">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-20">
          <FAQAccordion items={items} />
          <aside className="lg:sticky lg:top-32 lg:self-start space-y-4">
            <div className="rounded-[24px] border border-gold/25 bg-gradient-to-br from-pure via-cream to-cream-dark p-8">
              <p className="text-[11px] uppercase tracking-[0.3em] text-gold">
                Still deciding?
              </p>
              <h2 className="mt-3 font-serif-display text-ink text-2xl font-medium leading-snug">
                Find your signature scent in two minutes.
              </h2>
              <Link
                href="/scent-finder"
                className="btn-sweep mt-6 inline-flex items-center justify-center bg-gold text-pure px-7 py-3.5 text-[12px] font-medium tracking-[0.2em] uppercase"
              >
                Take the scent finder
              </Link>
            </div>
            <div className="rounded-[24px] border border-border bg-pure p-8">
              <p className="text-[11px] uppercase tracking-[0.3em] text-gold">
                Talk to us
              </p>
              <p className="mt-3 text-stone leading-relaxed">
                We usually reply within 24 hours.
              </p>
              <p className="mt-4 font-serif-display text-ink text-lg">
                {siteConfig.email}
              </p>
              <p className="font-serif-display text-ink text-lg">
                {siteConfig.phoneDisplay}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
