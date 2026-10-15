import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth";
import { getCostSheet } from "@/lib/admin/costs";
import CostCalculator from "@/components/admin/CostCalculator";
import { dbConnect } from "@/lib/mongoose";
import { Product } from "@/models/Product";
import { nameKey } from "@/lib/commission";

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
  await dbConnect();
  const products = await Product.find({ status: { $ne: "archived" } }).select("title").lean();
  const sheetKeys = new Set(sheet.rows.map((r) => nameKey(r.khayalName)));
  const missing = products.map((p) => p.title).filter((t) => !sheetKeys.has(nameKey(t)));
  const productKeys = new Set(products.map((p) => nameKey(p.title)));
  const extra = sheet.rows.map((r) => r.khayalName).filter((n) => n && !productKeys.has(nameKey(n)));
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
      {(missing.length > 0 || extra.length > 0) && (
        <div className="rounded-xl border border-gold/50 bg-gold/10 px-4 py-3 text-sm text-ink space-y-1">
          {missing.length > 0 && (
            <p>
              <strong>No cost row yet:</strong> {missing.join(", ")}. Add it with &ldquo;+ Add fragrance&rdquo; using the exact
              website name, or its commission and profit cannot be worked out.
            </p>
          )}
          {extra.length > 0 && (
            <p>
              <strong>Not on the website:</strong> {extra.join(", ")}. Fine for stock you hold; rename it if it should match a product.
            </p>
          )}
        </div>
      )}
      <CostCalculator
        initialRows={sheet.rows}
        initialStatedTotal={sheet.supplierStatedTotal}
        updatedAt={sheet.updatedAt}
      />
    </div>
  );
}
