/**
 * Short sensory lines and editorial details for each KHAYAL fragrance,
 * keyed by product handle. Used by the homepage and product pages.
 */
export interface FragranceCopy {
  line: string;
  audience: "For him" | "For her" | "To share";
}

export const fragranceCopy: Record<string, FragranceCopy> = {
  "silk-royale": { line: "Saffron and tuberose over warm oud.", audience: "For her" },
  "the-gentleman": { line: "Crisp bergamot, a pressed white shirt.", audience: "For him" },
  "oud-musk": { line: "Rose and oud, softened with amber.", audience: "To share" },
  dastaan: { line: "Lavender and cinnamon on soft leather.", audience: "For him" },
  "khayal-cherie-womens-perfume": { line: "Peach, rose and powdery orris.", audience: "For her" },
  samandar: { line: "Grapefruit and ginger, a sea breeze.", audience: "For him" },
  bahaar: { line: "Jasmine and gardenia in spring.", audience: "For her" },
  victor: { line: "Orange and spice for the evening.", audience: "For him" },
  "crystal-noor": { line: "Pomegranate and peony, sunlit.", audience: "For her" },
  "dark-ice": { line: "Black pepper and mint over suede.", audience: "For him" },
  jazba: { line: "Pineapple and cinnamon, bold and sweet.", audience: "For him" },
};

export function getFragranceLine(handle: string): string | undefined {
  return fragranceCopy[handle]?.line;
}

/** The three signature fragrances shown in the homepage hero and signature row. */
export const signatureFragrances = [
  {
    handle: "the-gentleman",
    name: "THE GENTLEMAN",
    audience: "For him",
    notes: "Bergamot, lavender, white musk",
    image: "/images/hero/the-gentleman.jpg",
  },
  {
    handle: "silk-royale",
    name: "SILK ROYALE",
    audience: "For her",
    notes: "Saffron, tuberose, oud, vanilla",
    image: "/images/hero/silk-royale.jpg",
  },
  {
    handle: "oud-musk",
    name: "OUD MUSK",
    audience: "To share",
    notes: "Saffron, oud, rose, amber",
    image: "/images/hero/oud-musk.jpg",
  },
] as const;

export const occasions = [
  { en: "Office", ur: "دفتر", picks: "The Gentleman · Cherie · Dark Ice", tag: "office" },
  { en: "Dholki", ur: "ڈھولکی", picks: "Bahaar · Crystal Noor · Samandar", tag: "everyday" },
  { en: "Nikkah", ur: "نکاح", picks: "Crystal Noor · Dastaan", tag: "wedding" },
  { en: "Walima", ur: "ولیمہ", picks: "Silk Royale · Oud Musk", tag: "wedding" },
  { en: "Eid", ur: "عید", picks: "Oud Musk · Victor · Jazba", tag: "evening" },
  { en: "A gift", ur: "تحفہ", picks: "Silk Royale · Dastaan · Victor", tag: "gift" },
] as const;
