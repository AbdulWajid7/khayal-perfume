import { getEnabledBankTransferConfig } from "@/lib/admin/bank-config";
import CheckoutClient from "@/components/checkout/CheckoutClient";
import PageHero from "@/components/ui/PageHero";

export const metadata = {
  title: "Checkout | KHAYAL Fragrance",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const bankConfig = await getEnabledBankTransferConfig();

  return (
    <main className="pb-20 md:pb-28 bg-cream min-h-screen">
      <PageHero eyebrow="Secure checkout" title="Complete your" accent="order" meta="Cash on delivery and bank transfer · Delivery across Pakistan" />
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
        <CheckoutClient bankTransferEnabled={!!bankConfig} bankConfig={bankConfig || undefined} />
      </div>
    </main>
  );
}
