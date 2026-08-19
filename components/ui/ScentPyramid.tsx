import type { ScentNotes } from "@/types/product";

interface ScentPyramidProps {
  notes: ScentNotes;
}

const tiers: Array<{ key: keyof ScentNotes; label: string }> = [
  { key: "top", label: "Top Notes" },
  { key: "heart", label: "Heart Notes" },
  { key: "base", label: "Base Notes" },
];

export default function ScentPyramid({ notes }: ScentPyramidProps) {
  const hasNotes = tiers.some((tier) => notes[tier.key]?.length);
  if (!hasNotes) return null;

  return (
    <div className="border border-border-subtle rounded-xl p-6 bg-charcoal">
      <h3 className="text-parchment text-sm font-medium uppercase tracking-[0.15em] mb-6">
        Scent Pyramid
      </h3>
      <div className="space-y-5">
        {tiers.map((tier) => {
          const items = notes[tier.key];
          if (!items?.length) return null;
          return (
            <div key={tier.key} className="flex flex-col sm:flex-row sm:items-baseline gap-2">
              <span className="text-warm-taupe text-xs uppercase tracking-[0.15em] w-28 flex-shrink-0">
                {tier.label}
              </span>
              <div className="flex flex-wrap gap-2">
                {items.map((note) => (
                  <span
                    key={note}
                    className="text-parchment text-sm bg-midnight border border-border-subtle rounded-md px-3 py-1"
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
