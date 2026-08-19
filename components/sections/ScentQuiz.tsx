"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/types/product";

interface QuizOption {
  label: string;
  tags: string[];
}

interface QuizQuestion {
  id: string;
  title: string;
  options: QuizOption[];
}

const QUESTIONS: QuizQuestion[] = [
  {
    id: "occasion",
    title: "When do you reach for a fragrance?",
    options: [
      { label: "Everyday, morning to evening", tags: ["daily", "office"] },
      { label: "Evening occasions & date nights", tags: ["evening", "date night"] },
      { label: "Special celebrations only", tags: ["special", "evening"] },
    ],
  },
  {
    id: "mood",
    title: "Which mood pulls you in?",
    options: [
      { label: "Bold & magnetic", tags: ["oriental woody", "woody", "oud"] },
      { label: "Warm & comforting", tags: ["floral musk", "musk", "vanilla"] },
      { label: "Fresh & radiant", tags: ["woody", "fresh"] },
      { label: "Romantic & sensual", tags: ["oriental floral", "rose", "floral"] },
    ],
  },
  {
    id: "note",
    title: "Which note calls to you first?",
    options: [
      { label: "Oud & amber", tags: ["oud", "amber", "saffron"] },
      { label: "Rose & florals", tags: ["rose", "jasmine", "floral"] },
      { label: "Musk & vanilla", tags: ["musk", "vanilla", "cashmere"] },
      { label: "Sandalwood & woods", tags: ["sandalwood", "vetiver", "woody"] },
    ],
  },
  {
    id: "longevity",
    title: "How long should it linger?",
    options: [
      { label: "A soft veil, 6–8 hours", tags: ["8-10 hours"] },
      { label: "All day, 8–10 hours", tags: ["8-10 hours", "9-11 hours"] },
      { label: "A long-lasting statement, 10+ hours", tags: ["10-12 hours", "9-11 hours"] },
    ],
  },
  {
    id: "recipient",
    title: "Who is this fragrance for?",
    options: [
      { label: "Just for me", tags: ["unisex"] },
      { label: "A gift for someone bold", tags: ["oud", "woody"] },
      { label: "A gift for someone romantic", tags: ["rose", "floral"] },
    ],
  },
];

function getMetafield(product: Product, key: string): string | undefined {
  return product.metafields.find((m) => m.namespace === "custom" && m.key === key)?.value;
}

function buildSearchableText(product: Product): string {
  const scentFamily = getMetafield(product, "scent_family") || "";
  const occasion = getMetafield(product, "occasion") || "";
  const longevity = getMetafield(product, "longevity") || "";
  let notesText = "";
  try {
    const raw = getMetafield(product, "scent_notes");
    if (raw) {
      const notes = JSON.parse(raw) as { top?: string[]; heart?: string[]; base?: string[] };
      notesText = [...(notes.top || []), ...(notes.heart || []), ...(notes.base || [])].join(" ");
    }
  } catch {
    // ignore malformed scent notes
  }

  return [scentFamily, occasion, longevity, notesText, product.tags.join(" ")]
    .join(" ")
    .toLowerCase();
}

function matchProduct(products: Product[], selectedTags: string[]): Product {
  let bestProduct = products[0];
  let bestScore = -1;

  for (const product of products) {
    const haystack = buildSearchableText(product);
    const score = selectedTags.reduce(
      (total, tag) => total + (haystack.includes(tag.toLowerCase()) ? 1 : 0),
      0
    );
    if (score > bestScore) {
      bestScore = score;
      bestProduct = product;
    }
  }

  return bestProduct;
}

interface ScentQuizProps {
  products: Product[];
}

export default function ScentQuiz({ products }: ScentQuizProps) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Record<string, QuizOption>>({});

  const isComplete = step >= QUESTIONS.length;
  const progress = Math.min(step, QUESTIONS.length) / QUESTIONS.length;

  const result = useMemo(() => {
    if (!isComplete || products.length === 0) return null;
    const selectedTags = Object.values(answers).flatMap((option) => option.tags);
    return matchProduct(products, selectedTags);
  }, [isComplete, answers, products]);

  function selectOption(question: QuizQuestion, option: QuizOption) {
    setAnswers((prev) => ({ ...prev, [question.id]: option }));
    setDirection(1);
    setStep((prev) => prev + 1);
  }

  function goBack() {
    setDirection(-1);
    setStep((prev) => Math.max(0, prev - 1));
  }

  function restart() {
    setDirection(-1);
    setAnswers({});
    setStep(0);
  }

  const currentQuestion = QUESTIONS[step];

  return (
    <div className="mx-auto max-w-2xl">
      {/* Progress bar */}
      <div className="h-px w-full bg-border-subtle mb-10 overflow-hidden">
        <motion.div
          className="h-full bg-oud-gold"
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        {!isComplete ? (
          <motion.div
            key={currentQuestion.id}
            custom={direction}
            initial={{ opacity: 0, x: direction * 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -24 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="eyebrow">
              Question {step + 1} of {QUESTIONS.length}
            </span>
            <h2 className="mt-3 text-parchment text-[28px] md:text-[36px] font-medium tracking-[0.02em] leading-tight">
              {currentQuestion.title}
            </h2>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentQuestion.options.map((option) => (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => selectOption(currentQuestion, option)}
                  className="group text-left border border-border-subtle rounded-xl px-5 py-4 text-parchment text-sm font-medium tracking-wide bg-charcoal hover:border-oud-gold hover:bg-oud-gold/5 transition-colors"
                >
                  {option.label}
                  <span className="block mt-2 text-oud-gold text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    Select →
                  </span>
                </button>
              ))}
            </div>

            {step > 0 && (
              <button
                type="button"
                onClick={goBack}
                className="mt-8 text-warm-taupe text-sm hover:text-oud-gold transition-colors"
              >
                ← Back
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="eyebrow">Your Match</span>
            {result ? (
              <>
                <h2 className="mt-3 text-parchment text-[28px] md:text-[36px] font-medium tracking-[0.02em] leading-tight">
                  {result.title}
                </h2>
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-6 items-start">
                  <div className="relative aspect-[4/5] w-full max-w-[160px] overflow-hidden rounded-xl border border-border-subtle bg-midnight">
                    {result.featuredImage && (
                      <Image
                        src={result.featuredImage.url}
                        alt={result.featuredImage.altText || result.title}
                        fill
                        className="object-cover"
                        sizes="160px"
                      />
                    )}
                  </div>
                  <div>
                    <p className="text-warm-taupe text-base leading-relaxed">{result.description}</p>
                    <p className="mt-4 text-oud-gold text-lg tabular-nums">
                      {formatPrice(
                        Number.parseFloat(result.priceRange.minVariantPrice.amount),
                        result.priceRange.minVariantPrice.currencyCode
                      )}
                    </p>
                    <div className="mt-6 flex flex-wrap gap-4">
                      <Link
                        href={`/shop/${result.handle}`}
                        className="inline-flex items-center justify-center bg-oud-gold text-midnight rounded-lg px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
                      >
                        Shop This Fragrance
                      </Link>
                      <button
                        type="button"
                        onClick={restart}
                        className="inline-flex items-center justify-center border border-warm-taupe/50 text-parchment rounded-lg px-6 py-3 text-sm font-medium hover:border-oud-gold hover:text-oud-gold transition-colors"
                      >
                        Retake the Quiz
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <p className="mt-4 text-warm-taupe text-base">
                We couldn&apos;t find a match just yet — please try again.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
