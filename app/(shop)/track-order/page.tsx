import { Suspense } from "react";
import TrackOrderClient from "@/components/checkout/TrackOrderClient";

export const metadata = {
  title: "Track Order | KHAYAL Parfum",
  robots: { index: false, follow: false },
};

export default function TrackOrderPage() {
  return (
    <main className="pt-32 pb-20 md:pt-40 md:pb-28 bg-cream min-h-screen">
      <div className="mx-auto max-w-2xl px-4 md:px-8 lg:px-12">
        <h1 className="font-serif-display text-ink text-3xl md:text-4xl font-medium tracking-tight">Track Your Order</h1>
        <Suspense fallback={<p className="text-stone mt-8">Loading tracking form...</p>}>
          <TrackOrderClient />
        </Suspense>
      </div>
    </main>
  );
}
