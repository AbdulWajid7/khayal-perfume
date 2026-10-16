/**
 * Pure helpers for the WhatsApp assistant: the knowledge text the AI answers from, the
 * no-AI answer library matcher, and the safety check on AI replies. No database access here,
 * so everything in this file is unit-tested.
 */

import type { FaqItem } from "@/lib/content/faq";
import { DUO_SAVING } from "@/lib/bundles";

export interface KnowledgeProduct {
  id: string;
  handle: string;
  title: string;
  category?: string;
  /** Lowest real price, or null when no price is set yet. */
  price: number | null;
  inStock: boolean;
  orderable: boolean;
  sizeMl?: number;
  top: string[];
  heart: string[];
  base: string[];
  longevity?: string;
  occasion?: string;
  description?: string;
}

export interface KnowledgeAnswer {
  question: string;
  answer: string;
  keywords?: string[];
}

export interface StoreFacts {
  siteUrl: string;
  phone: string;
  email: string;
  instagram: string;
  shippingFee: number;
  freeShippingThreshold: number;
  bankTransferAvailable: boolean;
  testerLine: string;
}

const pkr = (n: number) => `PKR ${n.toLocaleString("en-PK")}`;

export function productLine(p: KnowledgeProduct): string {
  const status = !p.orderable
    ? "launching soon, cannot be ordered yet"
    : p.inStock
      ? "in stock"
      : "out of stock right now";
  const price = p.price ? pkr(p.price) : "price not announced yet (do not quote a price)";
  const notes = [
    p.top.length ? `top ${p.top.join(", ")}` : "",
    p.heart.length ? `heart ${p.heart.join(", ")}` : "",
    p.base.length ? `base ${p.base.join(", ")}` : "",
  ]
    .filter(Boolean)
    .join("; ");
  return [
    `- ${p.title} [handle: ${p.handle}] (${p.category || "Unisex"}, ${p.sizeMl || 50} ml): ${price}, ${status}.`,
    notes ? ` Notes: ${notes}.` : "",
    p.longevity ? ` Longevity: ${p.longevity}.` : "",
    p.occasion ? ` Best for: ${p.occasion}.` : "",
    p.description ? ` ${p.description.replace(/\s+/g, " ").slice(0, 220)}` : "",
  ].join("");
}

export function buildKnowledge(
  products: KnowledgeProduct[],
  faq: FaqItem[],
  answers: KnowledgeAnswer[],
  facts: StoreFacts
): string {
  return [
    "BRAND",
    "KHAYAL is a Karachi fragrance house. Every fragrance is an extrait de parfum with 38% perfume oil, in a 50 ml spray bottle.",
    facts.testerLine,
    "",
    "DELIVERY AND PAYMENT",
    `Karachi: within 24 hours after the order is confirmed. Other cities in Pakistan: 3-4 working days after confirmation.`,
    `Delivery fee ${pkr(facts.shippingFee)}, free on orders of ${pkr(facts.freeShippingThreshold)} or more.`,
    `Duo offer: any two bottles in one order save ${pkr(DUO_SAVING)} (for every pair), ready-made pairs or the customer's own choice at ${facts.siteUrl}/shop/duos. It does not combine with discount codes; the bigger saving applies.`,
    `Payment: cash on delivery anywhere in Pakistan${facts.bankTransferAvailable ? ", or bank transfer / QR" : ""}.`,
    "",
    "CONTACT",
    `Website ${facts.siteUrl} · WhatsApp/phone ${facts.phone} · email ${facts.email} · Instagram ${facts.instagram}`,
    "",
    "FRAGRANCES",
    ...(products.length ? products.map(productLine) : ["(no fragrances listed right now)"]),
    "",
    "FAQ",
    ...faq.map((f) => `Q: ${f.question}\nA: ${f.answer}`),
    ...(answers.length ? ["", "TEAM ANSWERS (most current, prefer these)"] : []),
    ...answers.map((a) => `Q: ${a.question}\nA: ${a.answer}`),
  ].join("\n");
}

const STOPWORDS = new Set(
  (
    "a an the is are was be to of in on for and or do does did you your i me my it its this that with " +
    "can could would please plz pls hi hello hey sir madam ji bhai " +
    "kya hai hain ka ki ke ko me mein main aap ap tum se ye yeh wo woh bhi hy hay he ho kar karo krna karna"
  ).split(" ")
);

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));
}

/** Keywords for the built-in FAQ entries, matched by question text. */
export const FAQ_KEYWORDS: Record<string, string[]> = {
  "What makes Khayal Fragrance different?": ["different", "special", "why", "quality", "original"],
  "How do I choose a fragrance?": ["choose", "which", "recommend", "suggest", "konsa", "kaunsa", "best", "kon"],
  "Do you ship across Pakistan?": ["deliver", "delivery", "ship", "shipping", "courier", "lahore", "islamabad", "days", "din", "charges", "city"],
  "Do you offer cash on delivery?": ["cod", "cash", "payment", "pay", "bank", "transfer", "easypaisa", "jazzcash", "qr"],
  "How long do Khayal fragrances last?": ["last", "lasting", "longevity", "hours", "ghante", "tikti", "tikta", "strong", "projection"],
  "Are KHAYAL fragrances attars?": ["attar", "oil", "concentration", "extrait", "edp", "edt"],
  "What is your return policy?": ["return", "refund", "exchange", "wapis", "damaged", "broken", "replace"],
  "Can I order samples?": ["sample", "samples", "discovery", "mini"],
  "How can I contact Khayal?": ["contact", "number", "call", "email", "instagram", "address", "shop", "store"],
};

export interface LibraryEntry {
  question: string;
  answer: string;
  keywords: string[];
}

/**
 * Finds the library answer that best matches a customer's message, or null.
 * An entry needs at least one keyword hit and a score of 2 or more to be used.
 */
export function matchLibrary(text: string, entries: LibraryEntry[]): LibraryEntry | null {
  const words = new Set(tokenize(text));
  if (!words.size) return null;
  let best: { entry: LibraryEntry; score: number } | null = null;
  for (const entry of entries) {
    const keywords = entry.keywords.map((k) => k.toLowerCase().trim()).filter(Boolean);
    const keywordHits = keywords.filter((k) =>
      k.includes(" ") ? text.toLowerCase().includes(k) : words.has(k)
    ).length;
    if (!keywordHits) continue;
    const questionHits = tokenize(entry.question).filter((w) => words.has(w)).length;
    const score = keywordHits * 2 + questionHits;
    if (score >= 2 && (!best || score > best.score)) best = { entry, score };
  }
  return best?.entry ?? null;
}

const PRICE_WORDS = /\b(price|prices|rate|rates|cost|qeemat|keemat|kitne|kitna|kitni|how much|pkr|rs)\b/i;

export function isPriceQuestion(text: string): boolean {
  return PRICE_WORDS.test(text);
}

export function priceListAnswer(products: KnowledgeProduct[]): string {
  const priced = products.filter((p) => p.orderable && p.price);
  const pending = products.filter((p) => !p.orderable || !p.price);
  const lines: string[] = [];
  if (priced.length) {
    lines.push("*Our prices (50 ml extrait de parfum)*", ...priced.map((p) => `${p.title}: ${pkr(p.price!)}${p.inStock ? "" : " (out of stock)"}`));
  }
  if (pending.length) {
    lines.push(
      "",
      `${pending.map((p) => p.title).join(", ")}: price coming soon. Reply *notify* and we'll tell you first.`
    );
  }
  lines.push("", "Every order includes a tester. Cash on delivery across Pakistan.");
  return lines.join("\n").trim();
}

const BANNED = [
  /\bdupe\b/i,
  /\breplica\b/i,
  /\bfirst copy\b/i,
  /\bcopy of\b/i,
  /\binspired by\b/i,
  /\bimpression of\b/i,
  /\bclone\b/i,
  /\b(creed|dior|chanel|tom ford|ysl|yves saint laurent|armani|versace|montale|mancera|lattafa|amouage|kilian|gucci|prada|herm[eè]s|bvlgari|bulgari|paco rabanne|rabanne|jo malone|le labo|kurkdjian|baccarat|aventus|sauvage|bleu de|j'adore|good girl|one million|1 million)\b/i,
];

/** True when an AI reply mentions another brand or "copy" language and must not be sent. */
export function violatesBrandRules(reply: string): boolean {
  return BANNED.some((rx) => rx.test(reply));
}

/** Removes phone numbers, emails and long digit runs before text is sent to an outside AI. */
export function redactPersonal(text: string): string {
  return text
    .replace(/[\w.+-]+@[\w-]+\.[\w.]+/g, "[email]")
    .replace(/\+?\d[\d\s-]{6,}\d/g, "[number]");
}

/** WhatsApp button titles are limited to 20 characters. */
export function buttonTitle(label: string): string {
  return label.length <= 20 ? label : `${label.slice(0, 19).trimEnd()}…`;
}
