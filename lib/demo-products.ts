import type { Product } from "@/types/product";

const currency = "PKR";

function money(amount: number): { amount: string; currencyCode: string } {
  return { amount: amount.toFixed(2), currencyCode: currency };
}

export const demoProducts: Product[] = [
  {
    id: "demo-1",
    title: "Oud Imperial",
    handle: "oud-imperial",
    description:
      "A majestic oud composition built around aged agarwood, saffron, and smoked amber. For those who command presence without asking for attention.",
    descriptionHtml:
      "<p>A majestic oud composition built around aged agarwood, saffron, and smoked amber.</p>",
    priceRange: { minVariantPrice: money(14900) },
    compareAtPriceRange: { maxVariantPrice: money(18500) },
    featuredImage: {
      url: "https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?w=800&q=80",
      altText: "Oud Imperial perfume bottle",
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?w=800&q=80",
        altText: "Oud Imperial perfume bottle",
      },
    ],
    variants: [
      {
        id: "variant-1-50ml",
        title: "50ml Eau de Parfum",
        price: money(14900),
        availableForSale: true,
      },
    ],
    metafields: [
      { namespace: "custom", key: "scent_family", value: "Oud" },
      { namespace: "custom", key: "badge", value: "Bestseller" },
      { namespace: "custom", key: "longevity", value: "10-12 hours" },
      { namespace: "custom", key: "occasion", value: "Evening" },
      { namespace: "custom", key: "scent_notes_top", value: "Saffron, Bergamot" },
      { namespace: "custom", key: "scent_notes_heart", value: "Agarwood, Rose" },
      { namespace: "custom", key: "scent_notes_base", value: "Amber, Sandalwood, Musk" },
    ],
    tags: ["Oud", "Men", "Bestseller"],
    productType: "Eau de Parfum",
    vendor: "Khayal",
  },
  {
    id: "demo-2",
    title: "Rose Smoke",
    handle: "rose-smoke",
    description:
      "Damascus rose wrapped in incense and soft suede. A floral that does not whisper — it sings in a lower register.",
    descriptionHtml:
      "<p>Damascus rose wrapped in incense and soft suede. A floral that does not whisper.</p>",
    priceRange: { minVariantPrice: money(13200) },
    featuredImage: {
      url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80",
      altText: "Rose Smoke perfume bottle",
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=800&q=80",
        altText: "Rose Smoke perfume bottle",
      },
    ],
    variants: [
      {
        id: "variant-2-50ml",
        title: "50ml Eau de Parfum",
        price: money(13200),
        availableForSale: true,
      },
    ],
    metafields: [
      { namespace: "custom", key: "scent_family", value: "Floral" },
      { namespace: "custom", key: "badge", value: "New" },
      { namespace: "custom", key: "longevity", value: "8-10 hours" },
      { namespace: "custom", key: "occasion", value: "Day to Evening" },
      { namespace: "custom", key: "scent_notes_top", value: "Lychee, Pink Pepper" },
      { namespace: "custom", key: "scent_notes_heart", value: "Rose, Incense" },
      { namespace: "custom", key: "scent_notes_base", value: "Suede, Musk" },
    ],
    tags: ["Floral", "Women", "New"],
    productType: "Eau de Parfum",
    vendor: "Khayal",
  },
  {
    id: "demo-3",
    title: "Sandalwood Nocturne",
    handle: "sandalwood-nocturne",
    description:
      "Creamy Mysore sandalwood suspended in vanilla and a touch of black tea. The quiet confidence of a night that unfolds slowly.",
    descriptionHtml:
      "<p>Creamy Mysore sandalwood suspended in vanilla and a touch of black tea.</p>",
    priceRange: { minVariantPrice: money(12500) },
    compareAtPriceRange: { maxVariantPrice: money(15500) },
    featuredImage: {
      url: "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800&q=80",
      altText: "Sandalwood Nocturne perfume bottle",
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800&q=80",
        altText: "Sandalwood Nocturne perfume bottle",
      },
    ],
    variants: [
      {
        id: "variant-3-50ml",
        title: "50ml Eau de Parfum",
        price: money(12500),
        availableForSale: true,
      },
    ],
    metafields: [
      { namespace: "custom", key: "scent_family", value: "Woody" },
      { namespace: "custom", key: "badge", value: "Sale" },
      { namespace: "custom", key: "longevity", value: "8-10 hours" },
      { namespace: "custom", key: "occasion", value: "Evening" },
      { namespace: "custom", key: "scent_notes_top", value: "Black Tea, Cardamom" },
      { namespace: "custom", key: "scent_notes_heart", value: "Sandalwood, Iris" },
      { namespace: "custom", key: "scent_notes_base", value: "Vanilla, Tonka Bean" },
    ],
    tags: ["Woody", "Unisex", "Sale"],
    productType: "Eau de Parfum",
    vendor: "Khayal",
  },
  {
    id: "demo-4",
    title: "Musk Al Khayal",
    handle: "musk-al-khayal",
    description:
      "A clean, luminous white musk with jasmine petals and soft amber. Intimate, close-to-skin, and impossible to forget.",
    descriptionHtml:
      "<p>A clean, luminous white musk with jasmine petals and soft amber.</p>",
    priceRange: { minVariantPrice: money(11800) },
    featuredImage: {
      url: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=800&q=80",
      altText: "Musk Al Khayal perfume bottle",
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=800&q=80",
        altText: "Musk Al Khayal perfume bottle",
      },
    ],
    variants: [
      {
        id: "variant-4-50ml",
        title: "50ml Eau de Parfum",
        price: money(11800),
        availableForSale: true,
      },
    ],
    metafields: [
      { namespace: "custom", key: "scent_family", value: "Musk" },
      { namespace: "custom", key: "badge", value: "Bestseller" },
      { namespace: "custom", key: "longevity", value: "6-8 hours" },
      { namespace: "custom", key: "occasion", value: "Daily" },
      { namespace: "custom", key: "scent_notes_top", value: "Bergamot, Aldehydes" },
      { namespace: "custom", key: "scent_notes_heart", value: "Jasmine, White Flowers" },
      { namespace: "custom", key: "scent_notes_base", value: "White Musk, Amber" },
    ],
    tags: ["Musk", "Unisex", "Bestseller"],
    productType: "Eau de Parfum",
    vendor: "Khayal",
  },
  {
    id: "demo-5",
    title: "Amber Sultan",
    handle: "amber-sultan",
    description:
      "A rich amber oriental with vanilla resin, labdanum, and a trail of sweet spice. For evenings that turn into memories.",
    descriptionHtml:
      "<p>A rich amber oriental with vanilla resin, labdanum, and a trail of sweet spice.</p>",
    priceRange: { minVariantPrice: money(15600) },
    featuredImage: {
      url: "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800&q=80",
      altText: "Amber Sultan perfume bottle",
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800&q=80",
        altText: "Amber Sultan perfume bottle",
      },
    ],
    variants: [
      {
        id: "variant-5-50ml",
        title: "50ml Eau de Parfum",
        price: money(15600),
        availableForSale: true,
      },
    ],
    metafields: [
      { namespace: "custom", key: "scent_family", value: "Oriental" },
      { namespace: "custom", key: "badge", value: "New" },
      { namespace: "custom", key: "longevity", value: "10-12 hours" },
      { namespace: "custom", key: "occasion", value: "Special Occasion" },
      { namespace: "custom", key: "scent_notes_top", value: "Cinnamon, Vanilla" },
      { namespace: "custom", key: "scent_notes_heart", value: "Labdanum, Benzoin" },
      { namespace: "custom", key: "scent_notes_base", value: "Amber, Tonka, Musk" },
    ],
    tags: ["Oriental", "Men", "New"],
    productType: "Eau de Parfum",
    vendor: "Khayal",
  },
  {
    id: "demo-6",
    title: "Velvet Orchid",
    handle: "velvet-orchid",
    description:
      "A lush floral bouquet of orchid, tuberose, and honeyed nectar. Feminine, opulent, and made for golden-hour entrances.",
    descriptionHtml:
      "<p>A lush floral bouquet of orchid, tuberose, and honeyed nectar.</p>",
    priceRange: { minVariantPrice: money(14100) },
    compareAtPriceRange: { maxVariantPrice: money(16500) },
    featuredImage: {
      url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80",
      altText: "Velvet Orchid perfume bottle",
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80",
        altText: "Velvet Orchid perfume bottle",
      },
    ],
    variants: [
      {
        id: "variant-6-50ml",
        title: "50ml Eau de Parfum",
        price: money(14100),
        availableForSale: true,
      },
    ],
    metafields: [
      { namespace: "custom", key: "scent_family", value: "Floral" },
      { namespace: "custom", key: "badge", value: "Sale" },
      { namespace: "custom", key: "longevity", value: "8-10 hours" },
      { namespace: "custom", key: "occasion", value: "Evening" },
      { namespace: "custom", key: "scent_notes_top", value: "Mandarin, Honey" },
      { namespace: "custom", key: "scent_notes_heart", value: "Orchid, Tuberose" },
      { namespace: "custom", key: "scent_notes_base", value: "Vanilla, Sandalwood" },
    ],
    tags: ["Floral", "Women", "Sale"],
    productType: "Eau de Parfum",
    vendor: "Khayal",
  },
  {
    id: "demo-7",
    title: "Citrus Dawn",
    handle: "citrus-dawn",
    description:
      "Bright bergamot, neroli, and sun-warmed woods. A fresh, energizing scent that feels like the first hour of morning.",
    descriptionHtml:
      "<p>Bright bergamot, neroli, and sun-warmed woods.</p>",
    priceRange: { minVariantPrice: money(10900) },
    featuredImage: {
      url: "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?w=800&q=80",
      altText: "Citrus Dawn perfume bottle",
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1616949755610-8c9bbc08f138?w=800&q=80",
        altText: "Citrus Dawn perfume bottle",
      },
    ],
    variants: [
      {
        id: "variant-7-50ml",
        title: "50ml Eau de Parfum",
        price: money(10900),
        availableForSale: true,
      },
    ],
    metafields: [
      { namespace: "custom", key: "scent_family", value: "Citrus" },
      { namespace: "custom", key: "badge", value: "Bestseller" },
      { namespace: "custom", key: "longevity", value: "6-8 hours" },
      { namespace: "custom", key: "occasion", value: "Day" },
      { namespace: "custom", key: "scent_notes_top", value: "Bergamot, Lemon, Neroli" },
      { namespace: "custom", key: "scent_notes_heart", value: "Orange Blossom, Petitgrain" },
      { namespace: "custom", key: "scent_notes_base", value: "Cedarwood, White Musk" },
    ],
    tags: ["Citrus", "Unisex", "Bestseller"],
    productType: "Eau de Parfum",
    vendor: "Khayal",
  },
  {
    id: "demo-8",
    title: "Noir Attar",
    handle: "noir-attar",
    description:
      "A concentrated attar of dark rose, oud, and leather. Deep, traditional, and long-lasting on skin and fabric.",
    descriptionHtml:
      "<p>A concentrated attar of dark rose, oud, and leather.</p>",
    priceRange: { minVariantPrice: money(7800) },
    featuredImage: {
      url: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&q=80",
      altText: "Noir Attar perfume bottle",
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&q=80",
        altText: "Noir Attar perfume bottle",
      },
    ],
    variants: [
      {
        id: "variant-8-12ml",
        title: "12ml Attar",
        price: money(7800),
        availableForSale: true,
      },
    ],
    metafields: [
      { namespace: "custom", key: "scent_family", value: "Attar" },
      { namespace: "custom", key: "badge", value: "New" },
      { namespace: "custom", key: "longevity", value: "12+ hours" },
      { namespace: "custom", key: "occasion", value: "Traditional" },
      { namespace: "custom", key: "scent_notes_top", value: "Saffron, Rose" },
      { namespace: "custom", key: "scent_notes_heart", value: "Oud, Leather" },
      { namespace: "custom", key: "scent_notes_base", value: "Amber, Musk" },
    ],
    tags: ["Attar", "Men", "New"],
    productType: "Attar",
    vendor: "Khayal",
  },
];

export function getAllDemoProducts(): Product[] {
  return demoProducts;
}

export function getDemoProductByHandle(handle: string): Product | undefined {
  return demoProducts.find((p) => p.handle === handle);
}

export function getBestsellerProducts(): Product[] {
  return demoProducts.filter((p) => p.tags.includes("Bestseller"));
}

export function getSaleProducts(): Product[] {
  return demoProducts.filter((p) => p.compareAtPriceRange);
}

export function getNewProducts(): Product[] {
  return demoProducts.filter((p) => p.tags.includes("New"));
}

export function getProductsByCategory(category: string): Product[] {
  const cat = category.toLowerCase();
  return demoProducts.filter((p) =>
    p.tags.map((t) => t.toLowerCase()).includes(cat)
  );
}
