import type { Metadata } from "next";
import FAQAccordion from "@/components/ui/FAQAccordion";
import FAQSchema from "@/components/seo/FAQSchema";

export const metadata: Metadata = {
  title: "Perfume FAQ: Delivery, Returns & Longevity",
  description:
    "KHAYAL perfume FAQ: cash on delivery, delivery times, the tester in every order, returns, longevity and how to choose your scent.",
};

const items = [
  {
    question: "What makes Khayal Fragrance different?",
    answer:
      "KHAYAL makes long-lasting eau de parfums in Karachi, each with its own name and character, from fresh citrus to floral, woody and oud. Every order includes a separate tester, so you can try the scent before opening the full bottle.",
  },
  {
    question: "How do I choose a fragrance?",
    answer:
      "Use our Scent Finder to answer a few questions about your mood, occasion, and intensity preferences. You can also explore collections by Men, Women, Unisex, or Scent Family.",
  },
  {
    question: "Do you ship across Pakistan?",
    answer:
      "Yes. Karachi orders are expected within 24 hours after confirmation. Other cities in Pakistan are expected within 3–4 working days. Delivery may be affected by holidays, weather, courier delays or remote-area availability. Delivery is PKR 250, and free on orders of PKR 5,000 or more.",
  },
  {
    question: "Do you offer cash on delivery?",
    answer:
      "Yes. You can pay cash on delivery anywhere in Pakistan. Bank transfer and QR payment are also offered at checkout when available.",
  },
  {
    question: "How long do Khayal fragrances last?",
    answer:
      "Our eau de parfums are designed to last 6–12 hours on skin depending on the scent, and longer on fabric. Each product page lists that fragrance's longevity.",
  },
  {
    question: "Are KHAYAL fragrances attars?",
    answer:
      "No. KHAYAL fragrances are alcohol-based eau de parfum sprays. An attar is a concentrated, oil-based perfume that sits close to the skin; an eau de parfum spreads further and dries faster.",
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
      "Message us on WhatsApp at +92 320 2704617, email official@khayalparfum.com, or send a message on Instagram. We usually respond within 24 hours.",
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
