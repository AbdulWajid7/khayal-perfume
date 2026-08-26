import ScentQuiz from "@/components/sections/ScentQuiz";
import { getProducts } from "@/lib/shopify";

export const metadata = {
  title: "Find Your Signature Scent",
  description:
    "Take the Khayal scent finder quiz and discover a luxury fragrance matched to your personality, mood, and occasion.",
};

export default async function ScentFinderPage() {
  const products = await getProducts();

  return (
    <section className="pt-32 pb-16 md:pt-40 md:pb-24 min-h-[60vh] bg-cream">
      <div className="mx-auto max-w-2xl px-4 md:px-8 lg:px-12 text-center mb-14">
        <h1 className="font-serif-display text-ink text-[40px] font-medium tracking-tight">
          Find Your Signature Scent
        </h1>
        <p className="mt-6 text-stone text-base leading-relaxed">
          Answer five simple questions about mood, occasion, and intensity, and we&apos;ll match
          you with the Khayal fragrance that feels like an extension of yourself.
        </p>
      </div>
      <div className="px-4 md:px-8 lg:px-12">
        <ScentQuiz products={products} />
      </div>
    </section>
  );
}
