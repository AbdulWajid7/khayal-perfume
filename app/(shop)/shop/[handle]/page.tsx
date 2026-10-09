import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
import { getProduct, getProductRecommendations } from "@/lib/products";
import { getBlogPosts } from "@/lib/blog";
import { productMetadata } from "@/lib/seo";
import Breadcrumb from "@/components/ui/Breadcrumb";
import Image from "next/image";
import Reveal from "@/components/ui/Reveal";
import FAQAccordion, { type FAQItem } from "@/components/ui/FAQAccordion";
import ProductStage from "@/components/product/ProductStage";
import { ScentJourney, ScentProfile, WearRitual, InTheBox } from "@/components/product/ScentSections";
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

function buildFaqItems(product: { title: string; longevity: string }): FAQItem[] {
  return [
    {
      question: "How long does the fragrance last?",
      answer:
        product.longevity ||
        "Most Khayal fragrances last 8-12 hours on skin, depending on your skin chemistry and the concentration you choose.",
    },
    {
      question: "Is this fragrance suitable for both men and women?",
      answer:
        "Yes. Every Khayal fragrance is composed to be unisex — we believe scent should be chosen for how it makes you feel, not for gendered marketing.",
    },
    {
      question: "How should I store my perfume?",
      answer:
        "Keep your bottle away from direct sunlight and extreme heat. A cool, dry drawer or cabinet will preserve the fragrance for years.",
    },
    {
      question: "What is the difference between attar and eau de parfum?",
      answer:
        "Attars are oil-based and highly concentrated, worn close to the skin. Eau de parfum is alcohol-based with lighter sillage and wider projection.",
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

  const has3d = /gentleman/i.test(product.title);
  const badge = product.tags?.find((t) => /bestseller|new|limited/i.test(t));
  const subtitle = [product.scentFamily, product.concentration, product.sizeMl ? `${product.sizeMl} ml` : ""]
    .filter(Boolean)
    .join(" · ");
  const opening = product.scentNotes.top?.slice(0, 3).join(", ");
  const storyImage = images[1] ?? images[0];
  const freeFrom = siteConfig.freeShippingThreshold;
  const trust = [
    { t: "Free delivery", d: `On orders of PKR ${freeFrom.toLocaleString("en-PK")}+`, icon: "M3 7h11v8H3zM14 10h4l3 3v2h-7M6.5 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Zm11 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" },
    { t: "Secure checkout", d: "Bank transfer or cash on delivery", icon: "M6 10V7a6 6 0 1 1 12 0v3M5 10h14v10H5z" },
    { t: "Authentic", d: "Blended in small batches in Karachi", icon: "M12 3l2.5 5.2 5.5.8-4 3.9.9 5.6L12 15.8 7.1 18.5 8 12.9 4 9l5.5-.8z" },
    { t: "Gift ready", d: "Signature box and a tester", icon: "M4 10h16v10H4zM3 7h18v3H3zM12 7v13M12 7c-2-3-5-3-5-1s3 1 5 1c2 0 5 1 5-1s-3-2-5 1" },
  ];

  return (
    <div className="relative pt-28 pb-28 md:pt-36 md:pb-24 bg-cream overflow-x-clip">
      <div className="hero-mist" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
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

        {/* 1 · stage + buying column */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <ProductStage images={images} title={product.title} has3d={has3d} badge={badge} />

          <div className="lg:sticky lg:top-28 lg:self-start">
            {subtitle && (
              <p className="flex items-center gap-4 text-[11px] tracking-[0.32em] uppercase text-gold font-medium before:block before:h-px before:w-10 before:bg-gold">
                {subtitle}
              </p>
            )}
            <h1 className="mt-5 font-serif-display text-ink text-[42px] md:text-[56px] font-medium tracking-tight leading-[1.02]">
              {product.title}
            </h1>
            {opening && (
              <p className="mt-3 font-serif-display italic text-gold text-xl">Opens with {opening}</p>
            )}
            <p className="mt-5 text-stone text-base leading-relaxed max-w-xl">{product.description}</p>

            <div className="mt-8 border-t border-border pt-8" id="purchase-panel">
              <ProductPurchasePanel product={product} />
            </div>

            <ul className="mt-8 grid grid-cols-2 gap-4">
              {trust.map((x) => (
                <li key={x.t} className="flex gap-3 rounded-xl border border-border bg-pure/70 p-3.5">
                  <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0 text-gold" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={x.icon} />
                  </svg>
                  <span>
                    <span className="block text-sm font-medium text-ink">{x.t}</span>
                    <span className="block text-xs text-stone leading-snug">{x.d}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 2 · scent journey, profile */}
        <ScentJourney notes={product.scentNotes} title={product.title} />
        <ScentProfile
          longevity={product.longevity}
          sillage={product.sillage}
          occasion={product.occasion}
          concentration={product.concentration}
          sizeMl={product.sizeMl}
          family={product.scentFamily}
        />

        {/* 3 · the story of this fragrance */}
        <section className="mt-24 md:mt-32 grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] border border-border bg-cream-dark">
              <Image
                src={storyImage?.url || "/images/brand-story.png"}
                alt={storyImage?.altText || `${product.title} in soft light`}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover hero-kenburns"
              />
            </div>
            <div className="absolute -bottom-6 -right-2 md:-right-6 rounded-2xl border border-gold/30 bg-pure px-6 py-5 shadow-[0_24px_60px_-30px_rgba(191,161,95,0.6)]">
              <p className="text-[10px] uppercase tracking-[0.28em] text-stone">Crafted in</p>
              <p className="font-serif-display text-ink text-2xl">Karachi</p>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="flex items-center gap-4 text-[11px] tracking-[0.32em] uppercase text-gold font-medium before:block before:h-px before:w-10 before:bg-gold">
              About this fragrance
            </p>
            <h2 className="mt-5 font-serif-display text-ink text-[34px] md:text-[48px] font-medium tracking-tight leading-[1.05]">
              A thought, <span className="text-gold-shimmer italic">bottled.</span>
            </h2>
            <div
              className="prose mt-6 text-stone text-base leading-relaxed [&>p]:mb-4"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
            <p className="text-stone text-base leading-relaxed mt-4">
              {product.title} is composed as part of the Khayal collection — a house built on
              imagination, rare ingredients, and patient craft. Every bottle is finished by hand and
              packaged in our signature presentation box, ready to gift or to keep. Because our
              compositions are made in small batches, minor variations in color and scent intensity
              between production runs are normal and are a mark of authentic, hand-crafted
              perfumery rather than mass production.
            </p>
          </Reveal>
        </section>

        {/* 4 · ritual + box */}
        <WearRitual />
        <InTheBox freeShippingFrom={freeFrom} />

        {/* 5 · reviews */}
        <div className="mt-24 md:mt-32">
          <GoogleReviews />
        </div>

        {/* 6 · FAQ */}
        <section className="mt-24 md:mt-32 grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          <Reveal>
            <p className="flex items-center gap-4 text-[11px] tracking-[0.32em] uppercase text-gold font-medium before:block before:h-px before:w-10 before:bg-gold">
              Good to know
            </p>
            <h2 className="mt-5 font-serif-display text-ink text-[34px] md:text-[48px] font-medium tracking-tight leading-[1.05]">
              Frequently asked <span className="text-gold-shimmer italic">questions</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <FAQAccordion items={faqItems} />
          </Reveal>
        </section>

        {/* 7 · journal */}
        {journalLinks.length > 0 && (
          <section className="mt-24 md:mt-32">
            <p className="flex items-center gap-4 text-[11px] tracking-[0.32em] uppercase text-gold font-medium before:block before:h-px before:w-10 before:bg-gold">
              From the journal
            </p>
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
              {journalLinks.map((post, i) => (
                <Reveal key={post._id} delay={i * 0.08}>
                  <Link
                    href={`/journal/${post.slug}`}
                    className="group block h-full rounded-2xl border border-border bg-pure p-6 transition-all duration-500 hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_28px_60px_-30px_rgba(191,161,95,0.6)]"
                  >
                    <p className="text-[10px] uppercase tracking-[0.24em] text-gold mb-3">{post.tags?.[0] || "Journal"}</p>
                    <h3 className="font-serif-display text-ink text-xl leading-snug group-hover:text-gold transition-colors">
                      {post.title}
                    </h3>
                    <span className="mt-5 inline-block text-[11px] uppercase tracking-[0.2em] text-stone link-hover-gold">Read the story</span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        <RelatedProducts products={related} />
      </div>
      <StickyBuyBar product={product} />
    </div>
  );
}
