import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KHAYAL Partner Portal",
  robots: { index: false, follow: false },
};

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream text-ink">
      <header className="bg-[#1a0d14] text-[#faf6ef]">
        <div className="mx-auto max-w-6xl px-4 md:px-8 h-16 flex items-center justify-between">
          <span className="font-serif-display text-xl tracking-[0.3em]">KHAYAL</span>
          <span className="text-[11px] uppercase tracking-[0.3em] text-gold-pale/80">Partner portal</span>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 md:px-8 py-8 md:py-12">{children}</main>
    </div>
  );
}
