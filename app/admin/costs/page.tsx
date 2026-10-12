import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth";
import { getCostSheet } from "@/lib/admin/costs";
import CostCalculator from "@/components/admin/CostCalculator";

export const metadata: Metadata = { title: "Cost & Profit | Khayal Admin" };
export const dynamic = "force-dynamic";

export default async function CostsPage() {
  const session = await requireAuth(["admin"]);
  if (!session) {
    return (
      <div className="max-w-xl">
        <h1 className="font-serif-display text-3xl text-ink mb-3">Cost &amp; Profit</h1>
        <p className="text-stone">Only the owner account can see costs and margins.</p>
      </div>
    );
  }

  const sheet = await getCostSheet();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif-display text-3xl text-ink">Cost &amp; Profit</h1>
        <p className="text-stone mt-1 max-w-3xl">
          Enter bottle size, box and packaging costs, selling price and commission rate in the yellow cells.
          Private to the owner account: these figures never appear on the website, the WhatsApp assistant or
          the journal.
        </p>
      </div>
      <CostCalculator
        initialRows={sheet.rows}
        initialStatedTotal={sheet.supplierStatedTotal}
        updatedAt={sheet.updatedAt}
      />
    </div>
  );
}
