import Image from "next/image";
import Reveal from "@/components/ui/Reveal";
import type { ScentNotes } from "@/types/product";

/* Ingredient photographs already in /public/images, matched to notes by keyword. */
const INGREDIENT_IMAGES: Array<{ match: RegExp; src: string }> = [
  { match: /oud|agar/i, src: "/images/ingredient-oud.jpg" },
  { match: /rose/i, src: "/images/ingredient-rose.jpg" },
  { match: /sandal/i, src: "/images/ingredient-sandalwood.jpg" },
];

function ingredientImage(notes: string[]): string | undefined {
  for (const n of notes) {
    const hit = INGREDIENT_IMAGES.find((i) => i.match.test(n));
    if (hit) return hit.src;
  }
  return undefined;
}

const eyebrow = "flex items-center gap-4 text-[11px] tracking-[0.32em] uppercase text-gold font-medium before:block before:h-px before:w-10 before:bg-gold";
const h2 = "mt-5 font-serif-display text-ink text-[34px] md:text-[48px] font-medium tracking-tight leading-[1.05]";

/* ---------------- Scent journey: top, heart, base as a timeline ---------------- */
const TIERS: Array<{ key: keyof ScentNotes; label: string; time: string; line: string }> = [
  { key: "top", label: "Top notes", time: "First 15 minutes", line: "The first impression, bright and fleeting." },
  { key: "heart", label: "Heart notes", time: "2 – 4 hours", line: "The character of the scent as it settles on skin." },
  { key: "base", label: "Base notes", time: "6 hours and beyond", line: "What stays with you, and with everyone you pass." },
];

export function ScentJourney({ notes, title }: { notes: ScentNotes; title: string }) {
  const tiers = TIERS.filter((t) => notes[t.key]?.length);
  if (!tiers.length) return null;

  return (
    <section className="relative mt-24 md:mt-32">
      <Reveal>
        <p className={eyebrow}>The scent journey</p>
        <h2 className={h2}>
          How {title} <span className="text-gold-shimmer italic">unfolds</span>
        </h2>
      </Reveal>

      <ol className="relative mt-12 grid gap-6 md:grid-cols-3">
        {/* gold thread connecting the three stages */}
        <span className="pointer-events-none absolute left-0 right-0 top-[38px] hidden h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent md:block" aria-hidden="true" />
        {tiers.map((tier, i) => {
          const items = notes[tier.key] || [];
          const img = ingredientImage(items);
          return (
            <Reveal key={tier.key} delay={i * 0.12} className="relative">
              <li className="group relative h-full overflow-hidden rounded-2xl border border-border bg-pure p-6 transition-all duration-500 hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_28px_60px_-30px_rgba(191,161,95,0.6)]">
                <div className="flex items-center gap-4">
                  <span className="relative grid h-[52px] w-[52px] shrink-0 place-items-center overflow-hidden rounded-full border border-gold/40 bg-cream-dark">
                    {img ? (
                      <Image src={img} alt="" fill sizes="52px" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                      <span className="font-serif-display text-gold text-xl">{items[0]?.[0] ?? "✦"}</span>
                    )}
                  </span>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.28em] text-gold">{tier.time}</p>
                    <h3 className="mt-1 font-serif-display text-ink text-2xl font-medium">{tier.label}</h3>
                  </div>
                </div>
                <p className="mt-4 text-stone text-sm leading-relaxed">{tier.line}</p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {items.map((n) => (
                    <li key={n} className="rounded-full border border-border bg-cream px-3.5 py-1.5 text-sm text-ink transition-colors group-hover:border-gold/30">
                      {n}
                    </li>
                  ))}
                </ul>
                {/* intensity bar: top fades fastest, base lasts longest */}
                <div className="mt-6 h-1 overflow-hidden rounded-full bg-cream-dark" aria-hidden="true">
                  <div className="h-full rounded-full bg-gradient-to-r from-gold-light to-gold" style={{ width: `${[38, 68, 100][TIERS.indexOf(tier)]}%` }} />
                </div>
              </li>
            </Reveal>
          );
        })}
      </ol>
    </section>
  );
}

/* ---------------- Scent profile: longevity, projection, occasion ---------------- */
function longevityLevel(text: string): number {
  const nums = (text.match(/\d+/g) || []).map(Number);
  if (!nums.length) return /long|lasting|all day/i.test(text) ? 0.8 : 0;
  const hours = Math.max(...nums);
  return Math.min(1, hours / 14);
}
function sillageLevel(text: string): number {
  if (!text) return 0;
  if (/intimate|soft|light|close/i.test(text)) return 0.3;
  if (/moderate|medium/i.test(text)) return 0.55;
  if (/strong|heavy|enormous|beast/i.test(text)) return 0.9;
  return 0.6;
}

export function ScentProfile({ longevity, sillage, occasion, concentration, sizeMl, family }: {
  longevity: string; sillage: string; occasion: string; concentration?: string; sizeMl?: number; family: string;
}) {
  const meters = [
    { label: "Longevity", value: longevity, level: longevityLevel(longevity) },
    { label: "Projection", value: sillage, level: sillageLevel(sillage) },
  ].filter((m) => m.value);
  const facts = [
    ["Family", family], ["Concentration", concentration], ["Size", sizeMl ? `${sizeMl} ml` : undefined], ["Best for", occasion],
  ].filter((f): f is [string, string] => Boolean(f[1]));
  if (!meters.length && !facts.length) return null;

  return (
    <section className="mt-24 md:mt-32 grid gap-10 rounded-[28px] border border-border bg-pure p-6 md:grid-cols-[1fr_1.2fr] md:p-12">
      <Reveal>
        <p className={eyebrow}>Scent profile</p>
        <h2 className={h2}>Made to be <span className="text-gold-shimmer italic">remembered</span></h2>
        <p className="mt-5 text-stone leading-relaxed max-w-md">
          Small-batch blending and a high concentration of oils give every Khayal fragrance a long, slow dry-down.
        </p>
      </Reveal>
      <Reveal delay={0.1} className="flex flex-col justify-center gap-7">
        {meters.map((m) => (
          <div key={m.label}>
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-[11px] uppercase tracking-[0.24em] text-stone">{m.label}</span>
              <span className="font-serif-display text-ink text-lg">{m.value}</span>
            </div>
            <div className="mt-3 grid grid-cols-10 gap-1.5" role="meter" aria-label={m.label} aria-valuemin={0} aria-valuemax={10} aria-valuenow={Math.round(m.level * 10)}>
              {Array.from({ length: 10 }, (_, i) => (
                <span key={i} className={`h-2 rounded-full transition-colors duration-700 ${i < Math.round(m.level * 10) ? "bg-gradient-to-r from-gold-light to-gold" : "bg-cream-dark"}`} />
              ))}
            </div>
          </div>
        ))}
        {facts.length > 0 && (
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-border pt-6">
            {facts.map(([k, v]) => (
              <div key={k}>
                <dt className="text-[10px] uppercase tracking-[0.24em] text-stone">{k}</dt>
                <dd className="mt-1 text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        )}
      </Reveal>
    </section>
  );
}

/* ---------------- How to wear ---------------- */
const RITUAL = [
  { t: "Apply to pulse points", d: "Wrists, the base of the neck and behind the ears. Warm skin carries scent further." },
  { t: "Let it settle", d: "Don't rub your wrists together. Give the top notes a few minutes to open." },
  { t: "Make it last", d: "A light layer on clothing or hair keeps the base notes with you into the night." },
];

export function WearRitual() {
  return (
    <section className="mt-24 md:mt-32">
      <Reveal>
        <p className={eyebrow}>The ritual</p>
        <h2 className={h2}>How to <span className="text-gold-shimmer italic">wear it</span></h2>
      </Reveal>
      <ol className="mt-12 grid gap-10 md:grid-cols-3">
        {RITUAL.map((r, i) => (
          <Reveal key={r.t} delay={i * 0.1}>
            <li>
              <span className="font-serif-display text-gold text-5xl leading-none tabular">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-4 font-serif-display text-ink text-2xl font-medium">{r.t}</h3>
              <p className="mt-2 text-stone leading-relaxed">{r.d}</p>
            </li>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}

/* ---------------- What's in the box ---------------- */
export function InTheBox({ freeShippingFrom }: { freeShippingFrom: number }) {
  const items = [
    { t: "Your fragrance", d: "The bottle in the size you choose." },
    { t: "A tester", d: "A separate tester to carry with you." },
    { t: "Presentation box", d: "Our signature KHAYAL box, ready to gift." },
    { t: "Free delivery", d: `On orders of PKR ${freeShippingFrom.toLocaleString("en-PK")} or more.` },
  ];
  return (
    <section className="mt-24 md:mt-32 rounded-[28px] border border-gold/25 bg-gradient-to-br from-pure via-cream to-cream-dark p-6 md:p-12">
      <Reveal>
        <p className={eyebrow}>In every order</p>
        <h2 className={h2}>What&apos;s in the <span className="text-gold-shimmer italic">box</span></h2>
      </Reveal>
      <ul className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
        {items.map((it, i) => (
          <Reveal key={it.t} delay={i * 0.08}>
            <li className="border-t border-gold/30 pt-5">
              <h3 className="font-serif-display text-ink text-xl font-medium">{it.t}</h3>
              <p className="mt-2 text-stone text-sm leading-relaxed">{it.d}</p>
            </li>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
