/** Shared FAQ: the /faq page, its FAQ schema and the WhatsApp assistant all read this list. */
export interface FaqItem {
  question: string;
  answer: string;
}

export const faqItems: FaqItem[] = [
  {
    question: "What makes Khayal Fragrance different?",
    answer:
      "KHAYAL makes long-lasting extraits de parfum in Karachi, each with its own name and character, from fresh citrus to floral, woody and oud. Every order includes a separate tester, so you can try the scent before opening the full bottle.",
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
      "Our extraits de parfum are designed to last 6–12 hours on skin depending on the scent, and longer on fabric. Each product page lists that fragrance's longevity.",
  },
  {
    question: "Are KHAYAL fragrances attars?",
    answer:
      "No. KHAYAL fragrances are extrait de parfum sprays with 38% perfume oil, the strongest spray concentration. An attar is a pure oil that sits close to the skin; an extrait de parfum is nearly as concentrated but spreads further and dries in seconds.",
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
      "To choose a scent or place an order, WhatsApp our order assistant at +92 304 3190718 any time. For help with an order you have already placed, WhatsApp the team at +92 320 2704617, email official@khayalparfum.com, or message us on Instagram. We usually respond within 24 hours.",
  },
];
