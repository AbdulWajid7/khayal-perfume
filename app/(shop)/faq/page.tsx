import type { Metadata } from "next";
import FAQAccordion from "@/components/ui/FAQAccordion";
import FAQSchema from "@/components/seo/FAQSchema";
import { faqItems } from "@/lib/content/faq";

export const metadata: Metadata = {
  title: "Perfume FAQ: Delivery, Returns & Longevity",
  description:
    "KHAYAL perfume FAQ: cash on delivery, delivery times, the tester in every order, returns, longevity and how to choose your scent.",
};

const items = faqItems;

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
