import { getEnabledBankTransferConfig } from "@/lib/admin/bank-config";
import CheckoutClient from "@/components/checkout/CheckoutClient";

export const metadata = {
  title: "Checkout | KHAYAL Fragrance",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const bankConfig = await getEnabledBankTransferConfig();

  return (
    <main className="pt-32 pb-20 md:pt-40 md:pb-28 bg-cream min-h-screen">
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
        <h1 className="font-serif-display text-ink text-3xl md:text-4xl font-medium tracking-tight">Checkout</h1>
        <CheckoutClient bankTransferEnabled={!!bankConfig} bankConfig={bankConfig || undefined} />
      </div>
    </main>
  );
}
