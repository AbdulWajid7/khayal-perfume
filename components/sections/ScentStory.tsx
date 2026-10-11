import Reveal from "@/components/ui/Reveal";
import type { ScentNotes } from "@/types/product";

interface ScentStoryProps {
  notes: ScentNotes;
  longevity?: string;
  occasion?: string;
}

const ACTS: Array<{ key: keyof ScentNotes; label: string }> = [
  { key: "top", label: "Act I · the first 15 minutes" },
  { key: "heart", label: "Act II · the next few hours" },
  { key: "base", label: "Act III · what stays on your clothes" },
];

export default function ScentStory({ notes, longevity, occasion }: ScentStoryProps) {
  const acts = ACTS.filter((a) => notes[a.key]?.length);
  if (!acts.length) return null;
  const moments = (occasion || "")
    .split(/[,/]/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <section className="bg-cream-dark py-20 md:py-28" aria-label="How it unfolds">
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
        <Reveal className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="eyebrow">How it unfolds</p>
            <h2 className="mt-3 font-serif-display text-[36px] font-normal leading-[1.05] text-ink md:text-[54px]">
              {longevity ? `${longevity}, in three acts` : "From the first spray to the last hour"}
            </h2>
          </div>
          <p className="max-w-sm text-base leading-relaxed text-stone">
            Spray on pulse points and on your collar or dupatta. The base notes stay on fabric into the next day.
          </p>
        </Reveal>

        <div aria-hidden="true" className="mb-10 grid h-[3px] grid-cols-[1fr_4fr_7fr]">
          <span className="bg-gold-pale" />
          <span className="bg-gold" />
          <span className="bg-gold-deep" />
        </div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {acts.map((act, i) => (
            <Reveal key={act.key} delay={i * 0.1} className="flex flex-col gap-3">
              <span className="text-[11px] uppercase tracking-[0.24em] text-stone">{act.label}</span>
              <span className="font-serif-display text-[28px] leading-[1.25] text-ink md:text-[30px]">
                {(notes[act.key] || []).join(", ")}
              </span>
            </Reveal>
          ))}
        </div>

        {moments.length > 0 && (
          <div className="mt-14 flex flex-wrap items-center gap-3">
            <span className="mr-2 text-[11px] uppercase tracking-[0.24em] text-stone">Wear it to</span>
            {moments.map((m) => (
              <span key={m} className="border border-ink/25 px-4 py-2 text-sm capitalize text-ink">
                {m}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
