/** Pure helpers for the journal autopilot (unit-tested; no database or network). */
import sanitizeHtml from "sanitize-html";
import { violatesBrandRules } from "@/lib/bot-knowledge";

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

export function clamp(text: string | undefined, max: number): string {
  const t = (text || "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), max - 15)).trim()}…`;
}

/**
 * Keeps only safe article markup. Internal links must point to a page that exists
 * (allowedPaths); external links must be https and get rel="nofollow noopener".
 */
export function sanitizePostHtml(html: string, allowedPaths: string[]): string {
  const allowed = new Set(allowedPaths);
  return sanitizeHtml(html, {
    allowedTags: ["h2", "h3", "p", "ul", "ol", "li", "strong", "em", "a", "blockquote", "br"],
    allowedAttributes: { a: ["href", "rel", "target"] },
    allowedSchemes: ["https"],
    allowProtocolRelative: false,
    transformTags: {
      h1: "h2",
      h4: "h3",
      b: "strong",
      i: "em",
      a: (tagName, attribs): sanitizeHtml.Tag => {
        const href = (attribs.href || "").trim();
        if (href.startsWith("/")) {
          const path = href.split(/[?#]/)[0].replace(/\/$/, "") || "/";
          return allowed.has(path) ? { tagName: "a", attribs: { href } } : { tagName: "span", attribs: {} };
        }
        if (href.startsWith("https://")) {
          return { tagName: "a", attribs: { href, rel: "nofollow noopener", target: "_blank" } };
        }
        return { tagName: "span", attribs: {} };
      },
    },
    exclusiveFilter: (frame) => frame.tag === "p" && !frame.text.trim() && !frame.mediaChildren.length,
  })
    .replace(/<span>([\s\S]*?)<\/span>/g, "$1")
    .trim();
}

export function countWords(html: string): number {
  return html
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

export interface GeneratedPost {
  title: string;
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  excerpt: string;
  tags: string[];
  contentHtml: string;
  imagePrompt: string;
  imageAlt: string;
}

export interface QualityCheck {
  ok: boolean;
  problems: string[];
}

/** Decides whether a generated post is good enough to publish without a human look. */
export function checkQuality(post: GeneratedPost, minWords: number): QualityCheck {
  const problems: string[] = [];
  const words = countWords(post.contentHtml);
  if (words < minWords) problems.push(`only ${words} words (needs ${minWords})`);
  if ((post.contentHtml.match(/<h2/g) || []).length < 2) problems.push("fewer than 2 sections");
  if (!post.title || !post.metaDescription || !post.focusKeyword) problems.push("missing SEO fields");
  const allText = `${post.title} ${post.excerpt} ${post.contentHtml}`;
  if (violatesBrandRules(allText)) problems.push("mentions another brand or copy language");
  if (/\b(as an ai|language model|i cannot)\b/i.test(allText)) problems.push("contains AI boilerplate");
  return { ok: problems.length === 0, problems };
}

/** Site images used when image generation is unavailable, matched to the topic. */
export const FALLBACK_IMAGES: { url: string; alt: string; match: RegExp }[] = [
  { url: "/images/ingredient-rose.jpg", alt: "A deep pink rose", match: /rose|floral|bridal|bride|women|her\b/i },
  { url: "/images/ingredient-oud.jpg", alt: "A piece of agarwood with rising smoke", match: /oud|agarwood|eid|attar|smok/i },
  { url: "/images/ingredient-sandalwood.jpg", alt: "A stick of incense with rising smoke", match: /sandal|incense|wood|winter|warm/i },
  { url: "/images/hero/the-gentleman.jpg", alt: "THE GENTLEMAN extrait de parfum bottle on dark stone", match: /men\b|office|gentleman|him\b|groom/i },
  { url: "/images/hero/silk-royale.jpg", alt: "SILK ROYALE extrait de parfum bottle", match: /wedding|walima|shaadi|gift|luxury/i },
  { url: "/images/hero/oud-musk.jpg", alt: "OUD MUSK extrait de parfum bottle", match: /.*/ },
];

export function fallbackImage(topic: string): { url: string; alt: string } {
  const hit = FALLBACK_IMAGES.find((i) => i.match.test(topic)) || FALLBACK_IMAGES[FALLBACK_IMAGES.length - 1];
  return { url: hit.url, alt: hit.alt };
}

/** Photographic style added to every image prompt so covers read as real photography. */
export const PHOTO_STYLE =
  "Editorial still-life photograph for a luxury fragrance magazine. Shot on a full-frame camera, 50mm lens at f/2.8, " +
  "soft natural window light from one side, real material textures, shallow depth of field, subtle film grain, " +
  "muted warm colour grade, slightly imperfect natural arrangement. Photorealistic. " +
  "No people, no faces, no hands, no text, no letters, no logos, no brand names, no labels, no perfume bottles.";

/** Evergreen topics used when trend search is unavailable; skipped once covered. */
export const EVERGREEN_TOPICS: Record<"blog" | "article", { topic: string; focusKeyword: string }[]> = {
  blog: [
    { topic: "What to wear to a winter wedding in Karachi: fragrance edition", focusKeyword: "wedding perfume Pakistan" },
    { topic: "Five scent mistakes people make before a mehndi", focusKeyword: "mehndi perfume" },
    { topic: "Why your perfume fades in Karachi humidity, and how to fix it", focusKeyword: "perfume in humid weather" },
    { topic: "Gifting perfume in Pakistan: what to choose for him and for her", focusKeyword: "perfume gift Pakistan" },
    { topic: "Office-friendly scents that won't overpower a meeting room", focusKeyword: "office perfume" },
    { topic: "Rose, oud and saffron: the notes Pakistan grew up with", focusKeyword: "oud perfume Pakistan" },
  ],
  article: [
    { topic: "Extrait de parfum vs eau de parfum vs attar: a complete guide", focusKeyword: "extrait de parfum vs eau de parfum" },
    { topic: "How to make perfume last longer in hot weather", focusKeyword: "how to make perfume last longer" },
    { topic: "How to choose a signature scent: a step-by-step guide", focusKeyword: "how to choose a signature scent" },
    { topic: "Top, heart and base notes explained", focusKeyword: "perfume notes explained" },
    { topic: "Best perfumes for women in Pakistan under PKR 5,000", focusKeyword: "best perfume for women in Pakistan" },
    { topic: "How to store perfume so it lasts for years", focusKeyword: "how to store perfume" },
    { topic: "Layering fragrances: a beginner's guide", focusKeyword: "fragrance layering" },
  ],
};
