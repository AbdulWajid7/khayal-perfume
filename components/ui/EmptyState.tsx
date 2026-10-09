import Link from "next/link";
import Image from "next/image";

interface EmptyStateProps {
  title: string;
  text: string;
  cta?: { label: string; href: string };
  secondary?: { label: string; href: string };
}

/** Calm, branded empty state: gold monogram, serif title, one clear next step. */
export default function EmptyState({ title, text, cta, secondary }: EmptyStateProps) {
  return (
    <div className="relative mx-auto max-w-xl overflow-hidden rounded-[28px] border border-border bg-pure px-6 py-14 text-center md:px-12 md:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_55%_at_50%_0%,rgba(191,161,95,0.14),transparent_70%)]" aria-hidden="true" />
      <div className="relative">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-gold/30 bg-cream">
          <Image src="/images/khayal-mark-silver.png" alt="" width={34} height={56} className="h-11 w-auto opacity-80 [filter:sepia(1)_saturate(2.2)_hue-rotate(-12deg)_brightness(.78)]" />
        </div>
        <h2 className="mt-7 font-serif-display text-ink text-3xl md:text-4xl font-medium tracking-tight">{title}</h2>
        <p className="mx-auto mt-3 max-w-sm text-stone leading-relaxed">{text}</p>
        {(cta || secondary) && (
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {cta && (
              <Link href={cta.href} className="btn-sweep inline-flex items-center justify-center bg-gold text-pure px-8 py-4 text-[12px] font-medium tracking-[0.2em] uppercase">
                {cta.label}
              </Link>
            )}
            {secondary && (
              <Link href={secondary.href} className="btn-sweep inline-flex items-center justify-center border border-ink/30 text-ink px-8 py-4 text-[12px] font-medium tracking-[0.2em] uppercase hover:border-gold transition-colors">
                {secondary.label}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
