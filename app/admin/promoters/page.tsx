import type { Metadata } from "next";
import Link from "next/link";
import { listPromoters, createPromoter } from "@/lib/admin/promoters";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Promoters | Khayal Admin" };
export const dynamic = "force-dynamic";

const card = "bg-pure border border-border rounded-2xl p-6 shadow-sm";

export default async function PromotersPage() {
  const promoters = await listPromoters();
  const totals = promoters.reduce(
    (t, p) => ({
      orders: t.orders + p.report.summary.orders,
      sales: t.sales + p.report.summary.sales,
      earned: t.earned + p.report.summary.earned,
      due: t.due + Math.max(0, p.report.balance),
    }),
    { orders: 0, sales: 0, earned: 0, due: 0 }
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif-display text-3xl text-ink">Promoters</h1>
        <p className="text-stone mt-1 max-w-3xl">
          Partners like The Terrace Cafe. Every order that uses one of their codes is credited to them, and they
          earn a share of the <strong>profit</strong> once the order is delivered. They see their own orders and
          commission at <span className="text-ink">khayalparfum.com/partner</span>.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          ["Orders via promoters", String(totals.orders)],
          ["Sales via promoters", formatPrice(totals.sales)],
          ["Commission earned", formatPrice(totals.earned)],
          ["Commission still to pay", formatPrice(totals.due)],
        ].map(([label, value]) => (
          <div key={label} className={card}>
            <p className="text-xs uppercase tracking-wider text-stone">{label}</p>
            <p className="font-serif-display text-2xl text-ink mt-2">{value}</p>
          </div>
        ))}
      </div>

      <div className={card}>
        <h2 className="font-serif-display text-xl text-ink mb-4">Your promoters</h2>
        {promoters.length === 0 ? (
          <p className="text-sm text-stone">No promoters yet. Add The Terrace Cafe below.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-stone border-b border-border">
                <tr>
                  <th className="py-2 pr-4">Promoter</th>
                  <th className="py-2 pr-4">Codes</th>
                  <th className="py-2 pr-4">Rate</th>
                  <th className="py-2 pr-4">Orders</th>
                  <th className="py-2 pr-4">Earned</th>
                  <th className="py-2 pr-4">Pending</th>
                  <th className="py-2 pr-4">To pay</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {promoters.map((p) => (
                  <tr key={p._id}>
                    <td className="py-3 pr-4">
                      <span className="font-medium text-ink">{p.name}</span>
                      {!p.active && <span className="ml-2 text-xs text-sale">off</span>}
                      <div className="text-xs text-stone">{p.email}</div>
                    </td>
                    <td className="py-3 pr-4">{p.codes.join(", ") || "—"}</td>
                    <td className="py-3 pr-4">{Math.round(p.commissionRate * 1000) / 10}% of profit</td>
                    <td className="py-3 pr-4">{p.report.summary.orders}</td>
                    <td className="py-3 pr-4">{formatPrice(p.report.summary.earned)}</td>
                    <td className="py-3 pr-4 text-stone">{formatPrice(p.report.summary.pending)}</td>
                    <td className="py-3 pr-4 font-medium text-gold">{formatPrice(Math.max(0, p.report.balance))}</td>
                    <td className="py-3">
                      <Link href={`/admin/promoters/${p._id}`} className="text-xs border border-border rounded-lg px-3 py-1.5 hover:bg-cream">
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <form action={createPromoter} className={`${card} space-y-4`}>
        <h2 className="font-serif-display text-xl text-ink">Add a promoter</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input name="name" required placeholder="Business or person, e.g. The Terrace Cafe" className="input-admin" />
          <input name="contactName" placeholder="Contact person" className="input-admin" />
          <input name="phone" placeholder="Phone / WhatsApp" className="input-admin" />
          <input name="email" required type="email" placeholder="Portal login email" className="input-admin" />
          <input name="password" type="password" minLength={8} placeholder="Portal password (8+ characters)" className="input-admin" />
          <input name="codes" placeholder="Codes, e.g. TERRACE, TERRACE15" className="input-admin" />
          <label className="text-sm text-stone">
            Commission (% of profit)
            <input name="rate" type="number" min={0} max={100} step="0.5" defaultValue={20} className="input-admin mt-1" />
          </label>
          <textarea name="notes" placeholder="Agreement notes (private)" className="input-admin md:col-span-2" rows={2} />
        </div>
        <button type="submit" className="bg-gold text-pure rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-gold-light">
          Create promoter
        </button>
        <p className="text-xs text-stone">
          Create the matching codes in Discount Codes too, otherwise customers cannot use them at checkout.
        </p>
      </form>
    </div>
  );
}
