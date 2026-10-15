import type { Metadata } from "next";
import { getCommissionTable } from "@/lib/admin/commission";
import CommissionCalculator from "@/components/admin/CommissionCalculator";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Price & Commission | Khayal Admin" };
export const dynamic = "force-dynamic";

const card = "bg-pure border border-border rounded-2xl p-6 shadow-sm";
const th = "py-2 pr-4 font-medium";

export default async function CommissionPage() {
  const { rows, isOwner } = await getCommissionTable();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif-display text-3xl text-ink">Price &amp; Commission</h1>
        <p className="text-stone mt-1 max-w-3xl">
          Commission is a share of the <strong>profit</strong> on each bottle (selling price after any discount,
          minus our cost), never of the selling price. A discount lowers the profit, so it lowers the commission too.
        </p>
      </div>

      <div className={card}>
        <h2 className="font-serif-display text-xl text-ink mb-4">Work out a sale</h2>
        <CommissionCalculator rows={rows} isOwner={isOwner} />
      </div>

      <div className={card}>
        <h2 className="font-serif-display text-xl text-ink mb-4">Per bottle, at full price</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-stone border-b border-border">
              <tr>
                <th className={th}>Fragrance</th>
                <th className={th}>Selling price</th>
                {isOwner && <th className={th}>Cost</th>}
                {isOwner && <th className={th}>Profit</th>}
                <th className={th}>Commission rate</th>
                <th className={th}>Commission per bottle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr key={r.index}>
                  <td className="py-3 pr-4 font-medium text-ink">{r.khayalName}</td>
                  <td className="py-3 pr-4">{formatPrice(r.sellingPrice)}</td>
                  {isOwner && <td className="py-3 pr-4">{formatPrice(r.cost ?? 0)}</td>}
                  {isOwner && <td className="py-3 pr-4">{formatPrice(r.profit ?? 0)}</td>}
                  <td className="py-3 pr-4">{r.ratePercent}% of profit</td>
                  <td className="py-3 pr-4 text-gold font-medium">{formatPrice(r.commissionPerBottle)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {isOwner && (
          <p className="text-xs text-stone mt-4">
            Only you see cost and profit. Change prices and commission rates in Cost &amp; Profit. Promoters use
            their own rate, set on the Promoters page.
          </p>
        )}
      </div>
    </div>
  );
}
