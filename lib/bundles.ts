/**
 * The Duo offer: every two bottles in one order save a fixed amount, whether the customer
 * picks a ready-made pair or chooses their own two. Pure functions shared by the cart,
 * checkout page and the server-side order total, so all three always agree.
 *
 * A discount code and the duo saving do not stack: the order gets whichever is bigger.
 * That keeps the worst case (two Classic bottles from an ad, with a code) profitable.
 */

export const DUO_SAVING = 500;

export function bottleCount(items: { quantity: number }[]): number {
  return items.reduce((sum, i) => sum + Math.max(0, Math.floor(Number(i.quantity) || 0)), 0);
}

/** Rs 500 off for every complete pair of bottles. */
export function duoSaving(bottles: number): number {
  return Math.floor(Math.max(0, bottles) / 2) * DUO_SAVING;
}

export type DiscountSource = "code" | "duo" | "none";

/** Code or duo saving, whichever is bigger (never both). */
export function bestDiscount(codeDiscount: number, bottles: number): { amount: number; source: DiscountSource } {
  const duo = duoSaving(bottles);
  const code = Math.max(0, Number(codeDiscount) || 0);
  if (code <= 0 && duo <= 0) return { amount: 0, source: "none" };
  return code >= duo ? { amount: code, source: "code" } : { amount: duo, source: "duo" };
}

export interface Duo {
  slug: string;
  name: string;
  line: string;
  handles: [string, string];
}

/** Ready-made pairs. Each pairs a day scent with an evening one, or one for each person. */
export const DUOS: Duo[] = [
  {
    slug: "his-and-hers",
    name: "His & Hers",
    line: "A clean office scent for him, saffron and oud for her.",
    handles: ["the-gentleman", "silk-royale"],
  },
  {
    slug: "day-and-night",
    name: "Day & Night",
    line: "Fresh citrus for the day, black pepper and suede after dark.",
    handles: ["samandar", "dark-ice"],
  },
  {
    slug: "shaadi-season",
    name: "Shaadi Season",
    line: "Soft oud for the baraat, jasmine and gardenia for the mehndi.",
    handles: ["oud-musk", "bahaar"],
  },
  {
    slug: "office-and-evening",
    name: "Office & Evening",
    line: "Bergamot for the meeting room, spice and amber for dinner.",
    handles: ["the-gentleman", "victor"],
  },
  {
    slug: "her-garden",
    name: "Her Garden",
    line: "Peach and rose by day, pomegranate and peony in the sun.",
    handles: ["khayal-cherie-womens-perfume", "crystal-noor"],
  },
  {
    slug: "bold-pair",
    name: "The Bold Pair",
    line: "Lavender and leather, then pineapple and cinnamon for nights out.",
    handles: ["dastaan", "jazba"],
  },
];
