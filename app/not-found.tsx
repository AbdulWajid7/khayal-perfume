import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Page not found | Khayal Fragrance",
  robots: { index: false, follow: true },
};

/** Branded 404: the calligraphy mark, a calm message and the ways back in. */
export default function NotFound() {
  return (
    <main className="relative grid min-h-[100svh] place-items-center overflow-hidden bg-cream px-4 py-24">
      <div className="hero-mist" aria-hidden="true" />
      <Image
        src="/images/khayal-watermark.png"
        alt=""
        width={520}
        height={860}
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[110%] w-auto -translate-x-1/2 -translate-y-1/2 opacity-[0.06]"
        priority
      />
      <div className="relative max-w-xl text-center">
        <Link href="/" className="inline-flex items-center gap-3" aria-label="Khayal home">
          <Image src="/logo.png" alt="" width={44} height={44} className="h-11 w-11 rounded-full shadow-md" />
          <span className="text-ink text-sm font-medium tracking-[0.3em] uppercase">Khayal</span>
        </Link>
        <p className="mt-12 font-serif-display text-gold-shimmer text-[96px] md:text-[140px] leading-none">404</p>
        <h1 className="mt-4 font-serif-display text-ink text-3xl md:text-5xl font-medium tracking-tight">
          This page has <span className="italic text-gold-shimmer">drifted away</span>
        </h1>
        <p className="mx-auto mt-5 max-w-md text-stone leading-relaxed">
          Like a scent on the air, the page you were looking for is no longer here. Let&apos;s find you something lovely instead.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-sweep inline-flex items-center justify-center bg-gold text-pure px-8 py-4 text-[12px] font-medium tracking-[0.2em] uppercase">
            Back to home
          </Link>
          <Link href="/shop" className="btn-sweep inline-flex items-center justify-center border border-ink/30 text-ink px-8 py-4 text-[12px] font-medium tracking-[0.2em] uppercase hover:border-gold transition-colors">
            Shop the collection
          </Link>
        </div>
        <nav aria-label="Helpful links" className="mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[11px] uppercase tracking-[0.2em] text-stone">
          <Link href="/scent-finder" className="link-hover-gold hover:text-ink">Scent finder</Link>
          <Link href="/track-order" className="link-hover-gold hover:text-ink">Track order</Link>
          <Link href="/faq" className="link-hover-gold hover:text-ink">FAQ</Link>
        </nav>
      </div>
    </main>
  );
}
