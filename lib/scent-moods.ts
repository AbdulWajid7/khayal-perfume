/**
 * A colour mood for each KHAYAL fragrance, taken from its notes. Drives the cinematic
 * scent posters and the collection's hover glow. Only the three signature scents have
 * real bottle photography; never draw or recolour a bottle for the others.
 */
export interface ScentMood {
  /** Deep background. */
  deep: string;
  /** Mid tone for the glow. */
  mid: string;
  /** Light accent for text and the glow core. */
  accent: string;
  /** Ingredient words drifting in the poster (from the real notes). */
  motes: string[];
}

export const SCENT_MOODS: Record<string, ScentMood> = {
  "silk-royale": { deep: "#24101a", mid: "#7a2f45", accent: "#f0c6a8", motes: ["saffron", "tuberose", "vanilla"] },
  "the-gentleman": { deep: "#08121f", mid: "#1f4b7a", accent: "#bcd6ee", motes: ["bergamot", "lavender", "musk"] },
  "oud-musk": { deep: "#0b1c1b", mid: "#6b4a1e", accent: "#e2bd7a", motes: ["oud", "rose", "amber"] },
  dastaan: { deep: "#1c120c", mid: "#6e4126", accent: "#e0b184", motes: ["lavender", "cinnamon", "leather"] },
  "khayal-cherie-womens-perfume": { deep: "#24121a", mid: "#9a4a62", accent: "#f6c7d2", motes: ["peach", "rose", "orris"] },
  samandar: { deep: "#08191f", mid: "#1d6070", accent: "#9fe0e6", motes: ["grapefruit", "ginger", "incense"] },
  bahaar: { deep: "#101c12", mid: "#3f6b3a", accent: "#cfe6a6", motes: ["jasmine", "gardenia", "mandarin"] },
  victor: { deep: "#1e0f06", mid: "#8a4214", accent: "#f4b36a", motes: ["orange", "cardamom", "vetiver"] },
  "crystal-noor": { deep: "#1a1220", mid: "#7d4a6e", accent: "#ffd7e0", motes: ["yuzu", "pomegranate", "peony"] },
  "dark-ice": { deep: "#070d11", mid: "#244e5e", accent: "#b6e6f2", motes: ["mint", "black pepper", "suede"] },
  jazba: { deep: "#1d1306", mid: "#8a5a12", accent: "#f6cf6a", motes: ["pineapple", "cinnamon", "vanilla"] },
};

const FALLBACK: ScentMood = { deep: "#1a0f17", mid: "#5a2a4c", accent: "#e8d5a8", motes: ["khushboo"] };

export function scentMood(handle: string): ScentMood {
  return SCENT_MOODS[handle] || FALLBACK;
}

/** Real bottle photography (the only three bottles that exist). */
export const SIGNATURE_PHOTOS: Record<string, string> = {
  "the-gentleman": "/images/hero/the-gentleman.jpg",
  "silk-royale": "/images/hero/silk-royale.jpg",
  "oud-musk": "/images/hero/oud-musk.jpg",
};
