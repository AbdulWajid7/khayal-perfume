import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
import { getProduct, getProductRecommendations } from "@/lib/products";
import { getBlogPosts } from "@/lib/blog";
import { productMetadata } from "@/lib/seo";
import Breadcrumb from "@/components/ui/Breadcrumb";
import ScentPyramid from "@/components/ui/ScentPyramid";
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
    image: product.featuredImage?.url || "/images/story-teaser.svg",
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

  return (
    <div className="pt-32 pb-28 md:pt-40 md:pb-24 bg-cream">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <ProductGallery images={images} title={product.title} />

          <div>
            <h1 className="font-serif-display text-ink text-[32px] font-medium tracking-tight">
              {product.title}
            </h1>
            {product.scentFamily && (
              <p className="mt-2 text-stone text-sm uppercase tracking-[0.15em]">
                {product.scentFamily}
              </p>
            )}
            <p className="mt-4 text-stone text-base leading-relaxed">
              {product.description}
            </p>

            <div className="mt-6" id="purchase-panel">
              <ProductPurchasePanel product={product} />
            </div>

            <p className="mt-6 text-ink text-sm leading-relaxed">
              Every order includes a tester. Try it first; if the scent isn&apos;t for you, return
              the sealed bottle on delivery day.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-stone">
              <span>Cash on delivery</span>
              <span aria-hidden="true">·</span>
              <span>Free delivery from PKR {siteConfig.freeShippingThreshold.toLocaleString("en-PK")}</span>
              <span aria-hidden="true">·</span>
              <span>Karachi delivery in 24 hours</span>
            </div>

            {(product.scentNotes.top?.length ||
              product.scentNotes.heart?.length ||
              product.scentNotes.base?.length) && (
              <div className="mt-8">
                <ScentPyramid notes={product.scentNotes} />
              </div>
            )}
          </div>
        </div>

        <div className="mt-16 max-w-3xl">
          <h2 className="font-serif-display text-ink text-2xl font-medium mb-4">About This Fragrance</h2>
          <div
            className="prose text-stone text-base leading-relaxed [&>p]:mb-4"
            dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
          />
          <p className="text-stone text-base leading-relaxed mt-4">
            {product.title} is composed as part of the Khayal collection — a house built on
            imagination, rare ingredients, and patient craft. Every bottle is finished by hand and
            packaged in our signature presentation box, ready to gift or to keep. Whether worn
            daily or reserved for special occasions, this fragrance is designed to evolve on your
            skin over several hours, revealing its top, heart, and base notes in turn. We recommend
            applying to pulse points — wrists, neck, and behind the ears — and allowing the
            fragrance a few minutes to settle before judging its character. Because our
            compositions are made in small batches, minor variations in color and scent intensity
            between production runs are normal and are a mark of authentic, hand-crafted
            perfumery rather than mass production.
          </p>
        </div>

        <div className="mt-16 max-w-3xl">
          <h2 className="font-serif-display text-ink text-2xl font-medium mb-4">Frequently Asked Questions</h2>
          <FAQAccordion items={faqItems} />
        </div>

        <div className="mt-16">
          <GoogleReviews />
        </div>

        {journalLinks.length > 0 && (
          <div className="mt-16 max-w-3xl">
            <h2 className="font-serif-display text-ink text-2xl font-medium mb-6">From the Journal</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {journalLinks.map((post) => (
                <Link key={post._id} href={`/journal/${post.slug}`} className="group">
                  <p className="text-stone text-xs mb-2">{post.tags?.[0] || "Journal"}</p>
                  <h3 className="text-ink text-sm font-medium leading-snug group-hover:text-gold transition-colors">
                    {post.title}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        )}

        <RelatedProducts products={related} />
      </div>
      <StickyBuyBar product={product} />
    </div>
  );
}
