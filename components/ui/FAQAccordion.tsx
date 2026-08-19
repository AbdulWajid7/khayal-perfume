"use client";

import { useState } from "react";

export interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-border-subtle border-t border-b border-border-subtle">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={item.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              className="w-full flex items-center justify-between py-5 text-left"
            >
              <span className="text-parchment text-sm font-medium pr-4">{item.question}</span>
              <span
                className={[
                  "text-oud-gold text-lg transition-transform duration-200 flex-shrink-0",
                  isOpen ? "rotate-45" : "",
                ].join(" ")}
                aria-hidden="true"
              >
                +
              </span>
            </button>
            {isOpen && (
              <p className="pb-5 text-warm-taupe text-sm leading-relaxed pr-8">{item.answer}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
