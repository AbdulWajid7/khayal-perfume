import { Suspense } from "react";
import TrackOrderClient from "@/components/checkout/TrackOrderClient";
import PageHero from "@/components/ui/PageHero";

export const metadata = {
  title: "Track Order | KHAYAL Fragrance",
  robots: { index: false, follow: false },
};

export default function TrackOrderPage() {
  return (
    <main className="pb-20 md:pb-28 bg-cream min-h-screen">
      <PageHero align="center" eyebrow="Order status" title="Track your" accent="order" intro="Enter your order number and the mobile number you used at checkout." />
      <div className="mx-auto max-w-2xl px-4 md:px-8 lg:px-12 -mt-6">
        <Suspense fallback={<p className="text-stone mt-8">Loading tracking form...</p>}>
          <TrackOrderClient />
        </Suspense>
      </div>
    </main>
  );
}
