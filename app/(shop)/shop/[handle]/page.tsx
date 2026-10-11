import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
import { getProduct, getProductRecommendations } from "@/lib/products";
import { getBlogPosts } from "@/lib/blog";
import { productMetadata } from "@/lib/seo";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ScentStory from "@/components/sections/ScentStory";
import { getFragranceLine } from "@/lib/fragrance-copy";
import FAQAccordion, { type FAQItem } from "@/components/ui/FAQAccordion";
import ProductGallery from "@/components/sections/ProductGallery";
import ProductPurchasePanel from "@/components/sections/ProductPurchasePanel";
import RelatedProducts from "@/components/sections/RelatedProducts";
import StickyBuyBar from "@/components/ui/StickyBuyBar";
import ProductSchema from "@/components/seo/ProductSchema";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import FAQSchema from "@/components/seo/FAQSchema";
import GoogleReviews from "@/components/reviews/GoogleReviews";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ handle: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProduct(handle);
  if (!product) return {};

  return productMetadata({
    title: product.title,
    description: product.description,
    image: (!product.sampleImages && product.featuredImage?.url) || "/og-image.jpg",
    handle: product.handle,
    metaTitle: product.metaTitle,
    metaDescription: product.metaDescription,
    focusKeyword: product.focusKeyword,
    keywords: [...(product.keywords || []), ...(product.tags || []), product.productType].filter(
      (k): k is string => Boolean(k)
    ),
    ogImage: product.ogImage,
    canonicalUrl: product.canonicalUrl,
    noIndex: product.noIndex,
  });
}

function audienceAnswer(title: string, category?: string): string {
  switch ((category || "").toLowerCase()) {
    case "men":
      return `${title} is made for men. Anyone who enjoys its character can wear it.`;
    case "women":
      return `${title} is made for women. Anyone who enjoys its character can wear it.`;
    default:
      return `${title} is unisex, made to suit men and women alike.`;
  }
}

function buildFaqItems(product: { title: string; longevity: string; productType?: string }): FAQItem[] {
  return [
    {
      question: `How long does ${product.title} last?`,
      answer: product.longevity
        ? `${product.title} lasts about ${product.longevity} on skin, and longer on clothing. Skin type and weather make a difference.`
        : "Most KHAYAL fragrances last 6–12 hours on skin, depending on the scent, your skin and the weather.",
    },
    {
      question: `Is ${product.title} for men or women?`,
      answer: audienceAnswer(product.title, product.productType),
    },
    {
      question: "Can I pay cash on delivery?",
      answer: `Yes. Cash on delivery is available across Pakistan. Delivery is PKR 250, free on orders of PKR ${siteConfig.freeShippingThreshold.toLocaleString("en-PK")} or more. Karachi orders arrive within 24 hours of confirmation; other cities in 3–4 working days.`,
    },
    {
      question: "How should I store my perfume?",
      answer:
        "Keep your bottle away from direct sunlight and extreme heat. A cool, dry drawer or cabinet will preserve the fragrance for years.",
    },
    {
      question: "What if the scent doesn't suit me?",
      answer:
        "Every order includes a separate tester. Try it first; if the scent isn't for you, contact us on the day of delivery and return the full bottle unopened and sealed.",
    },
    {
      question: `What is included when I order ${product.title}?`,
      answer:
        `Your order includes the bottle you select, a separate tester, a signature KHAYAL presentation box, and free delivery on orders of PKR ${siteConfig.freeShippingThreshold.toLocaleString("en-PK")} or more.`,
    },
  ];
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;
  const product = await getProduct(handle);

  if (!product) {
    notFound();
  }

  const related = await getProductRecommendations(product.id);
  const allPosts = await getBlogPosts(0);
  const productTerms = [
    ...(product.tags || []),
    product.productType || "",
    product.scentFamily || "",
    ...(product.keywords || []),
  ].map((t) => t.toLowerCase());
  const relatedPosts = allPosts
    .filter((p) =>
      (p.tags || []).some((t) => productTerms.includes(t.toLowerCase()))
    )
    .slice(0, 3);
  const journalLinks = relatedPosts.length ? relatedPosts : allPosts.slice(0, 3);
  const faqItems = buildFaqItems(product);
  const images = product.images.length
    ? product.images
    : product.featuredImage
      ? [product.featuredImage]
      : [];

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: product.title },
  ];

  const line = getFragranceLine(product.handle);
  const audience =
    (product.productType || "").toLowerCase() === "men"
      ? "For him"
      : (product.productType || "").toLowerCase() === "women"
        ? "For her"
        : "To share";

  return (
    <div className="bg-cream pb-28 pt-28 md:pb-0 md:pt-32">
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
        <Breadcrumb items={breadcrumbItems} />
        <BreadcrumbSchema
          items={[
            { name: "Home", url: "https://www.khayalparfum.com/" },
            { name: "Shop", url: "https://www.khayalparfum.com/shop" },
            { name: product.title, url: `https://www.khayalparfum.com/shop/${product.handle}` },
          ]}
        />
        <ProductSchema product={product} />
        <FAQSchema items={faqItems} />

        <div className="grid grid-cols-1 gap-12 pb-20 lg:grid-cols-[1.15fr_1fr] lg:gap-20 md:pb-28">
          <ProductGallery images={images} title={product.title} />

          <div className="flex flex-col gap-6 lg:sticky lg:top-32 lg:self-start">
            <p className="eyebrow">
              {audience} · Extrait de parfum
              {product.sizeMl ? ` · ${product.sizeMl} ml` : ""}
            </p>
            <h1 className="font-serif-display text-[48px] font-normal leading-[0.98] tracking-[0.04em] text-ink md:text-[72px]">
              {product.title}
            </h1>
            {line && (
              <p className="font-serif-display text-[22px] italic leading-snug text-stone md:text-2xl">{line}</p>
            )}
            <p className="text-base leading-relaxed text-stone">{product.description}</p>

            <div id="purchase-panel">
              <ProductPurchasePanel product={product} />
            </div>

            <div className="flex items-center gap-4 bg-aubergine px-5 py-4 text-cream">
              <span className="font-serif-display text-[34px] leading-none text-gold-pale">+1</span>
              <span className="text-sm leading-relaxed">
                A {product.title} tester travels with your bottle. Wear it first; if it isn&apos;t you, return
                the sealed bottle on delivery day.
              </span>
            </div>

            <ul className="flex flex-col gap-3 text-sm text-stone">
              <li className="flex items-center gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="text-gold-deep" aria-hidden="true"><path d="M12 3c3 4 6 7 6 11a6 6 0 0 1-12 0c0-4 3-7 6-11Z" /></svg>
                Extrait de parfum: 38% perfume oil, the strongest spray concentration
              </li>
              <li className="flex items-center gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="text-gold-deep" aria-hidden="true"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="18" r="1.6" /><circle cx="17" cy="18" r="1.6" /></svg>
                Karachi in 24 hours, other cities in 3 to 4 working days
              </li>
              <li className="flex items-center gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="text-gold-deep" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="1" /><circle cx="12" cy="12" r="2.5" /></svg>
                Cash on delivery, bank transfer or QR
              </li>
              <li className="flex items-center gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" className="text-gold-deep" aria-hidden="true"><path d="M4 12h16M12 4v16" /></svg>
                Free delivery from PKR {siteConfig.freeShippingThreshold.toLocaleString("en-PK")}
              </li>
            </ul>
          </div>
        </div>
      </div>

      <ScentStory notes={product.scentNotes} longevity={product.longevity} occasion={product.occasion} />

      <div className="mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-28 lg:px-12">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="eyebrow">About the fragrance</p>
            <h2 className="mb-6 mt-3 font-serif-display text-[32px] font-normal text-ink md:text-[40px]">
              The story of {product.title}
            </h2>
            <div
              className="prose text-base leading-relaxed text-stone [&>p]:mb-4"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
            <p className="mt-4 text-base leading-relaxed text-stone">
              Apply to pulse points (wrists, neck and behind the ears) and give it a few minutes to settle
              before you judge it. Like every KHAYAL extrait de parfum, {product.title} opens with its top notes and
              slowly moves through the heart to the base over the hours you wear it.
            </p>
          </div>
          <div>
            <p className="eyebrow">Questions</p>
            <h2 className="mb-6 mt-3 font-serif-display text-[32px] font-normal text-ink md:text-[40px]">
              Before you order
            </h2>
            <FAQAccordion items={faqItems} />
          </div>
        </div>

        <div className="mt-20">
          <GoogleReviews />
        </div>

        {journalLinks.length > 0 && (
          <div className="mt-20 border-t border-border pt-14">
            <p className="eyebrow">From the journal</p>
            <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-3">
              {journalLinks.map((post) => (
                <Link key={post._id} href={`/journal/${post.slug}`} className="group">
                  <p className="mb-2 text-xs uppercase tracking-[0.16em] text-stone">{post.tags?.[0] || "Journal"}</p>
                  <h3 className="font-serif-display text-xl leading-snug text-ink transition-colors group-hover:text-gold-deep">
                    {post.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        )}

        <RelatedProducts products={related} title={`If ${product.title} is you`} />
      </div>
      <StickyBuyBar product={product} />
    </div>
  );
}
