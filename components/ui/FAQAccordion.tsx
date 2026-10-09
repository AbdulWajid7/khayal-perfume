"use client";

import { useId, useState } from "react";

export interface FAQItem {
  question: string;
  answer: string;
}

export default function FAQAccordion({ items }: { items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const uid = useId();

  return (
    <div className="border-t border-border">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const panelId = `${uid}-faq-${index}`;
        return (
          <div key={item.question} className="border-b border-border">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              aria-controls={panelId}
              className="group flex w-full items-center justify-between gap-6 py-6 text-left"
            >
              <span className={`font-serif-display text-lg md:text-xl leading-snug transition-colors ${isOpen ? "text-ink" : "text-ink/85 group-hover:text-ink"}`}>
                {item.question}
              </span>
              <span
                className={[
                  "relative grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-all duration-300",
                  isOpen ? "border-gold bg-gold text-pure rotate-45" : "border-border text-gold group-hover:border-gold",
                ].join(" ")}
                aria-hidden="true"
              >
                <span className="text-lg leading-none">+</span>
              </span>
            </button>
            <div
              id={panelId}
              role="region"
              className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(.22,1,.36,1)] ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
            >
              <div className="overflow-hidden">
                <p className="pb-7 pr-14 text-stone text-[15px] leading-[1.8]">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
