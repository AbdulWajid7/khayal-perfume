"use client";

import { useId, useState } from "react";

export interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const baseId = useId();

  return (
    <div className="divide-y divide-border border-t border-b border-border">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const panelId = `${baseId}-faq-${index}`;
        return (
          <div key={item.question}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              aria-controls={panelId}
              className="w-full flex items-center justify-between py-5 text-left"
            >
              <span className="text-ink text-sm font-medium pr-4">{item.question}</span>
              <span
                className={[
                  "text-gold text-lg transition-transform duration-200 flex-shrink-0",
                  isOpen ? "rotate-45" : "",
                ].join(" ")}
                aria-hidden="true"
              >
                +
              </span>
            </button>
            {/* Always rendered (just hidden when closed) so search engines and AI assistants can read every answer. */}
            <p id={panelId} hidden={!isOpen} className="pb-5 text-stone text-sm leading-relaxed pr-8">
              {item.answer}
            </p>
          </div>
        );
      })}
    </div>
  );
}
