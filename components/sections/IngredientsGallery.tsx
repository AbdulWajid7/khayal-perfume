import Image from "next/image";
import Reveal from "@/components/ui/Reveal";
import RevealMask from "@/components/ui/RevealMask";
import Parallax from "@/components/ui/Parallax";

const ingredients = [
  {
    image: "/images/ingredient-oud.jpg",
    title: "Rare Agarwood",
    description: "Sourced from sustainably cultivated aquilaria trees, distilled slowly over days.",
  },
  {
    image: "/images/ingredient-rose.jpg",
    title: "Damascus Rose",
    description: "Hand-harvested at dawn, when the petals hold the most concentrated oil.",
  },
  {
    image: "/images/ingredient-sandalwood.jpg",
    title: "Mysore Sandalwood",
    description: "Creamy, warm, and meditative — the quiet backbone of our compositions.",
  },
];

export default function IngredientsGallery() {
  return (
    <section className="py-20 md:py-32 bg-midnight border-t border-border-subtle">
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="eyebrow">The Materials</span>
            <RevealMask as="h2" className="mt-3 text-parchment text-[32px] md:text-[40px] font-medium tracking-[0.02em]">
              Rare Ingredients, Patiently Sourced
            </RevealMask>
            <p className="mt-4 text-warm-taupe text-base">
              Every Khayal fragrance begins with materials chosen for character, not convenience.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ingredients.map((ingredient, index) => (
            <Reveal
              key={ingredient.title}
              delay={index * 0.1}
              className={index === 1 ? "md:translate-y-10" : undefined}
            >
              <div className="group relative aspect-[4/5] overflow-hidden rounded-xl border border-border-subtle">
                <Parallax strength={8}>
                  <Image
                    src={ingredient.image}
                    alt={ingredient.title}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    loading="lazy"
                  />
                </Parallax>
                <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-parchment text-xl font-medium">{ingredient.title}</h3>
                  <p className="mt-2 text-warm-taupe text-sm leading-relaxed">
                    {ingredient.description}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
