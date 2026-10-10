import ScentQuiz from "@/components/sections/ScentQuiz";
import { getProducts } from "@/lib/products";

export const dynamic = 'force-dynamic';

export const metadata = {
  title: "Perfume Finder Quiz: Find Your Signature Scent",
  description:
    "Answer five quick questions and get matched with a KHAYAL eau de parfum for your mood, occasion and how strong you like it. Free, two minutes.",
};

export default async function ScentFinderPage() {
  const products = await getProducts();

  return (
    <section className="pt-32 pb-16 md:pt-40 md:pb-24 min-h-[60vh] bg-cream">
      <div className="mx-auto max-w-2xl px-4 md:px-8 lg:px-12 text-center mb-14">
        <h1 className="font-serif-display text-ink text-[44px] md:text-[60px] font-normal leading-[1.04]">
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

      <div className="mx-auto mt-24 grid max-w-5xl grid-cols-1 gap-12 border-t border-border px-4 pt-16 text-left md:grid-cols-3 md:px-8">
        <div>
          <h2 className="font-serif-display text-2xl text-ink">How the quiz works</h2>
          <p className="mt-3 text-sm leading-relaxed text-stone">
            You pick the mood you want to give off, where you will wear it, and whether you like a soft or a
            strong trail. We compare your answers with the top, heart and base notes of all eleven KHAYAL eau de
            parfums and suggest the closest match.
          </p>
        </div>
        <div>
          <h2 className="font-serif-display text-2xl text-ink">Fresh, floral, woody or oud?</h2>
          <p className="mt-3 text-sm leading-relaxed text-stone">
            Fresh scents like THE GENTLEMAN and SAMANDAR suit offices and hot days. Florals like CHERIE and BAHAAR
            are soft and easy to wear. SILK ROYALE and OUD MUSK are richer, made for weddings and winter evenings.
          </p>
        </div>
        <div>
          <h2 className="font-serif-display text-2xl text-ink">Try it before you open it</h2>
          <p className="mt-3 text-sm leading-relaxed text-stone">
            Whatever you choose, a separate tester comes with the bottle. Wear the tester first, and if the scent
            is not you, tell us on the day of delivery while the bottle is still sealed. Prefer to ask a person?
            Message us on WhatsApp.
          </p>
        </div>
      </div>
    </section>
  );
}
