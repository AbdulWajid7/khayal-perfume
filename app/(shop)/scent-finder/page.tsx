import ScentQuiz from "@/components/sections/ScentQuiz";
import { getProducts } from "@/lib/products";
import PageHero from "@/components/ui/PageHero";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Find Your Signature Scent",
  description:
    "Take the Khayal scent finder quiz and discover a luxury fragrance matched to your personality, mood, and occasion.",
};

export default async function ScentFinderPage() {
  const products = await getProducts();

  return (
    <div className="bg-cream min-h-[60vh]">
      <PageHero
        align="center"
        eyebrow="A two-minute ritual"
        title="Find your"
        accent="signature scent"
        intro={
          <>
            Answer five simple questions about mood, occasion, and intensity, and we&apos;ll match you with the
            Khayal fragrance that feels like an extension of yourself.
          </>
        }
      />
      <div className="mx-auto max-w-4xl px-4 md:px-8 lg:px-12 pb-24 md:pb-32">
        <div className="relative rounded-[28px] border border-border bg-pure/80 p-5 md:p-12 shadow-[0_30px_80px_-50px_rgba(191,161,95,0.6)] backdrop-blur-sm">
          <ScentQuiz products={products} />
        </div>
      </div>
    </div>
  );
}
