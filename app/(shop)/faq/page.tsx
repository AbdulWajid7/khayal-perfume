import type { Metadata } from "next";
import FAQAccordion from "@/components/ui/FAQAccordion";
import FAQSchema from "@/components/seo/FAQSchema";

export const metadata: Metadata = {
  title: "FAQ | Khayal Parfum",
  description:
    "Answers to common questions about Khayal Parfum — ordering, shipping, returns, attars, and choosing your fragrance.",
};

const items = [
  {
    question: "What makes Khayal Parfum different?",
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
    <section className="py-20 md:py-28 bg-cream">
      <FAQSchema items={items} />
      <div className="mx-auto max-w-3xl px-4 md:px-8 lg:px-12">
        <span className="eyebrow">Support</span>
        <h1 className="mt-3 font-serif-display text-ink text-3xl md:text-5xl font-medium tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="mt-4 text-stone leading-relaxed">
          Everything you need to know about ordering, wearing, and caring for your Khayal fragrance.
        </p>
        <div className="mt-12">
          <FAQAccordion items={items} />
        </div>
      </div>
    </section>
  );
}
