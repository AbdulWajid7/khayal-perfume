import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { occasions, signatureFragrances, getFragranceLine } from "@/lib/fragrance-copy";

const NAMES = [
  "Silk Royale",
  "The Gentleman",
  "Oud Musk",
  "Dastaan",
  "Cherie",
  "Samandar",
  "Bahaar",
  "Victor",
  "Crystal Noor",
  "Dark Ice",
  "Jazba",
];

function SectionHead({
  eyebrow,
  title,
  aside,
  center = false,
}: {
  eyebrow: string;
  title: React.ReactNode;
  aside?: string;
  center?: boolean;
}) {
  return (
    <Reveal
      className={
        center
          ? "mb-14 flex flex-col items-center gap-4 text-center"
          : "mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
      }
    >
      <div className={center ? "flex flex-col items-center gap-4" : ""}>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-3 font-serif-display text-[38px] font-normal leading-[1.04] text-ink md:text-[56px]">{title}</h2>
      </div>
      {aside && <p className="max-w-sm text-base leading-relaxed text-stone">{aside}</p>}
    </Reveal>
  );
}

export function NameMarquee() {
  const loop = [...NAMES, ...NAMES];
  return (
    <div aria-hidden="true" className="overflow-hidden whitespace-nowrap border-y border-border bg-cream py-5">
      <div className="kh-marquee inline-flex gap-12 font-serif-display text-[26px] italic text-stone-light md:text-[30px]">
        {loop.map((name, i) => (
          <span key={`${name}-${i}`} className="inline-flex items-center gap-12">
            {name}
            <span className="text-sm not-italic text-gold">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export function Signatures({ activeHandles }: { activeHandles: string[] }) {
  return (
    <section className="bg-cream py-24 md:py-32" aria-label="The signatures">
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
        <SectionHead center eyebrow="The signatures" title="One for him. One for her. One to share." />
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          {signatureFragrances.map((f, i) => (
            <Reveal key={f.handle} delay={i * 0.12}>
              <Link
                href={activeHandles.includes(f.handle) ? `/shop/${f.handle}` : "/shop"}
                className="kh-zoom group flex flex-col gap-6"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-[#0d1016]">
                  <Image
                    src={f.image}
                    alt={`${f.name} eau de parfum bottle`}
                    fill
                    sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 30vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col items-center gap-2 text-center">
                  <span className="text-[11px] uppercase tracking-[0.28em] text-stone">{f.audience}</span>
                  <span className="font-serif-display text-[30px] tracking-[0.1em] text-ink">{f.name}</span>
                  <span className="font-serif-display text-lg italic text-stone">{getFragranceLine(f.handle)}</span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Occasions() {
  return (
    <section id="occasions" className="bg-cream-dark py-24 md:py-28" aria-label="Shop by occasion">
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
        <SectionHead
          eyebrow="Shop by occasion"
          title="Dressed for every moment"
          aside="From a Monday meeting to a three-day wedding, here is what to wear."
        />
        <Reveal>
          <div className="grid grid-cols-1 border-l border-t border-ink/80 sm:grid-cols-2 lg:grid-cols-3">
            {occasions.map((o) => (
              <Link
                key={o.en}
                href={`/shop?tag=${encodeURIComponent(o.tag)}`}
                className="kh-occ flex min-h-[190px] flex-col justify-between gap-6 border-b border-r border-ink/80 p-8 text-ink"
              >
                <span className="flex items-start justify-between gap-4">
                  <span className="font-serif-display text-[36px] leading-none">{o.en}</span>
                  <span lang="ur" className="kh-occ-ur font-urdu text-2xl leading-[1.6] text-gold-deep">
                    {o.ur}
                  </span>
                </span>
                <span className="text-xs uppercase tracking-[0.18em] opacity-80">{o.picks}</span>
              </Link>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function TesterRitual() {
  return (
    <section className="overflow-hidden bg-cream py-24 md:py-32" aria-label="The tester ritual">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-4 md:px-8 lg:grid-cols-2 lg:gap-24 lg:px-12">
        <Reveal className="flex justify-center">
          <div className="relative aspect-[4/5] w-full max-w-[460px]">
            <Image
              src="/images/hero/oud-musk.jpg"
              alt="OUD MUSK eau de parfum bottle"
              fill
              sizes="(max-width: 1024px) 90vw, 460px"
              className="object-cover"
            />
            <div className="absolute -right-3 bottom-12 flex min-w-[168px] flex-col gap-1 bg-aubergine px-6 py-5 text-cream sm:-right-9">
              <span className="font-serif-display text-[44px] leading-none">+1</span>
              <span className="text-[11px] uppercase tracking-[0.24em] text-gold-pale">Tester inside</span>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.1} className="flex flex-col gap-7">
          <p className="eyebrow">The tester ritual</p>
          <h2 className="font-serif-display text-[40px] font-normal leading-[1.03] text-ink md:text-[64px]">
            Every bottle travels with its <em className="text-gold-deep">twin.</em>
          </h2>
          <p className="text-lg leading-[1.75] text-stone">
            A tester arrives beside every 50 ml bottle. Wear it to the office, to dinner, to a dholki. Keep the
            bottle sealed until you are sure. If it is not you, tell us the same day and send the sealed bottle
            back.
          </p>
          <ol className="grid grid-cols-3 gap-6 border-t border-border pt-6">
            {["Open the tester", "Wear it for a day", "Then open the bottle"].map((step, i) => (
              <li key={step}>
                <span className="font-serif-display text-[30px] text-gold-deep">{["I", "II", "III"][i]}</span>
                <span className="mt-1 block text-sm leading-snug text-stone">{step}</span>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}

const MATERIALS = [
  { title: "Rose", src: "/images/ingredient-rose.jpg", alt: "A deep pink rose", body: "In CHERIE, BAHAAR, JAZBA and OUD MUSK" },
  { title: "Oud", src: "/images/ingredient-oud.jpg", alt: "A piece of agarwood with rising smoke", body: "In SILK ROYALE and OUD MUSK", offset: true },
  { title: "Incense & sandalwood", src: "/images/ingredient-sandalwood.jpg", alt: "A stick of incense with rising smoke", body: "In SAMANDAR, SILK ROYALE and OUD MUSK" },
];

export function Ingredients() {
  return (
    <section className="bg-cream-dark py-24 md:py-32" aria-label="Inside the bottle">
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
        <SectionHead
          eyebrow="Inside the bottle"
          title="Rose, oud and smoke"
          aside="The notes our part of the world grew up with, worn the modern way."
        />
        <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-3 md:gap-7">
          {MATERIALS.map((m, i) => (
            <Reveal key={m.title} delay={i * 0.12} className={m.offset ? "md:mt-20" : ""}>
              <Link href="/shop" className="kh-zoom flex flex-col gap-4">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image src={m.src} alt={m.alt} fill sizes="(max-width: 768px) 92vw, 30vw" className="object-cover" />
                </div>
                <span className="font-serif-display text-[30px] text-ink">{m.title}</span>
                <span className="-mt-2 text-sm text-stone">{m.body}</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HouseStory() {
  return (
    <section className="relative overflow-hidden bg-cream py-28 md:py-36" aria-label="The house of KHAYAL">
      <span
        aria-hidden="true"
        className="kh-mark pointer-events-none absolute right-[4%] top-1/2 hidden h-[86%] -translate-y-1/2 text-aubergine opacity-90 md:block"
      />
      <Reveal className="relative mx-auto flex max-w-7xl flex-col gap-7 px-4 md:px-8 lg:px-12">
        <p className="eyebrow">The house of KHAYAL</p>
        <blockquote className="max-w-3xl font-serif-display text-[36px] italic leading-[1.12] text-ink md:text-[58px]">
          “Khayal: a thought, a memory, a feeling that stays with you.”
        </blockquote>
        <p className="max-w-xl text-lg leading-[1.75] text-stone">
          KHAYAL began in Karachi with one idea: that a fragrance can bring back a person, a place, a night. We
          make eau de parfums to be remembered by, and keep them within reach.
        </p>
        <Link
          href="/story"
          className="self-start border-b border-gold py-3 text-xs font-medium uppercase tracking-[0.24em] text-ink transition-colors hover:text-gold-deep"
        >
          Read our story
        </Link>
      </Reveal>
    </section>
  );
}

export function FinderBand({ whatsappHref }: { whatsappHref: string }) {
  return (
    <section className="border-t border-border bg-cream" aria-label="Scent finder">
      <Reveal className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-4 py-20 md:flex-row md:items-center md:px-8 md:py-24 lg:px-12">
        <h2 className="max-w-2xl font-serif-display text-[34px] font-normal leading-[1.08] text-ink md:text-[50px]">
          Not sure which one is yours? Five questions, two minutes.
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/scent-finder"
            className="kh-btn inline-flex min-h-[54px] items-center bg-ink px-8 text-xs font-medium uppercase tracking-[0.24em] text-cream hover:bg-aubergine"
          >
            Start the scent finder
          </Link>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[54px] items-center border border-ink/40 px-8 text-xs font-medium uppercase tracking-[0.24em] text-ink transition-colors hover:border-ink"
          >
            Ask on WhatsApp
          </a>
        </div>
      </Reveal>
    </section>
  );
}
