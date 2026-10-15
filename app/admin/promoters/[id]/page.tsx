import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  addPayout,
  getPromoterDetail,
  removePayout,
  tagOrder,
  untagOrder,
  updatePromoter,
} from "@/lib/admin/promoters";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Promoter | Khayal Admin" };
export const dynamic = "force-dynamic";

const card = "bg-pure border border-border rounded-2xl p-6 shadow-sm";
const STATE_LABEL = { earned: "Earned", pending: "Pending delivery", void: "Not counted" } as const;
const day = (iso: string | Date) =>
  new Date(iso).toLocaleDateString("en-PK", { timeZone: "Asia/Karachi", day: "numeric", month: "short", year: "numeric" });

export default async function PromoterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getPromoterDetail(id);
  if (!data) notFound();
  const { promoter: p, report, missingCoupons } = data;
  const s = report.summary;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/admin/promoters" className="text-xs text-stone hover:text-gold">← All promoters</Link>
          <h1 className="font-serif-display text-3xl text-ink mt-1">{p.name}</h1>
          <p className="text-stone text-sm">
            {Math.round(p.commissionRate * 1000) / 10}% of profit · codes {p.codes.join(", ") || "none"} ·{" "}
            {p.active ? "active" : "switched off"}
          </p>
        </div>
      </div>

      {missingCoupons.length > 0 && (
        <div className="rounded-xl border border-gold/50 bg-gold/10 px-4 py-3 text-sm text-ink">
          {missingCoupons.join(", ")} {missingCoupons.length > 1 ? "do" : "does"} not exist in Discount Codes yet, so
          customers cannot use {missingCoupons.length > 1 ? "them" : "it"}.{" "}
          <Link href="/admin/coupons" className="underline">Create it there</Link>.
        </div>
      )}
      {s.awaitingCost > 0 && (
        <div className="rounded-xl border border-border bg-cream px-4 py-3 text-sm text-ink">
          {s.awaitingCost} order(s) contain a fragrance with no cost in Cost &amp; Profit (the KHAYAL name there must
          match the product name). Their commission shows once the cost is entered.
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          ["Orders", String(s.orders)],
          ["Sales (after discount)", formatPrice(s.sales)],
          ["Earned (delivered)", formatPrice(s.earned)],
          ["Pending delivery", formatPrice(s.pending)],
          ["To pay now", formatPrice(Math.max(0, report.balance))],
        ].map(([label, value]) => (
          <div key={label} className={card}>
            <p className="text-xs uppercase tracking-wider text-stone">{label}</p>
            <p className="font-serif-display text-2xl text-ink mt-2">{value}</p>
          </div>
        ))}
      </div>

      <div className={card}>
        <h2 className="font-serif-display text-xl text-ink mb-4">Orders credited</h2>
        {report.orders.length === 0 ? (
          <p className="text-sm text-stone">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-stone border-b border-border">
                <tr>
                  <th className="py-2 pr-4">Order</th>
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Customer</th>
                  <th className="py-2 pr-4">Fragrances</th>
                  <th className="py-2 pr-4">Via</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Sales</th>
                  <th className="py-2 pr-4">Commission</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {report.orders.map((o) => (
                  <tr key={o.id} className={o.state === "void" ? "opacity-50" : ""}>
                    <td className="py-3 pr-4">
                      <Link href={`/admin/orders/${o.id}`} className="text-gold hover:underline">{o.orderNumber}</Link>
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap">{day(o.createdAt)}</td>
                    <td className="py-3 pr-4">{o.customerName}<div className="text-xs text-stone">{o.city}</div></td>
                    <td className="py-3 pr-4">{o.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}</td>
                    <td className="py-3 pr-4 text-xs">{o.how === "code" ? o.code : o.how === "tagged" ? "Added by hand" : "Partner link"}</td>
                    <td className="py-3 pr-4 text-xs">{STATE_LABEL[o.state]}<div className="text-stone">{o.status.replace(/_/g, " ")}</div></td>
                    <td className="py-3 pr-4">{formatPrice(o.sales)}</td>
                    <td className="py-3 pr-4 font-medium">
                      {o.commission === null ? <span className="text-xs text-stone">needs cost</span> : formatPrice(o.commission)}
                    </td>
                    <td className="py-3">
                      {o.how === "tagged" && (
                        <form action={untagOrder.bind(null, p._id, o.orderNumber)}>
                          <button className="text-xs text-sale">Remove</button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <form action={tagOrder.bind(null, p._id)} className="mt-5 flex flex-wrap items-center gap-3">
          <input name="orderNumber" placeholder="Order number" className="input-admin max-w-xs" />
          <button className="border border-border rounded-lg px-4 py-2 text-sm hover:bg-cream">Credit an order by hand</button>
          <span className="text-xs text-stone">For WhatsApp or phone orders where the customer gave their code.</span>
        </form>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className={card}>
          <h2 className="font-serif-display text-xl text-ink mb-4">Payouts</h2>
          <p className="text-sm text-stone mb-4">
            Paid so far <strong className="text-ink">{formatPrice(report.paid)}</strong>. Balance{" "}
            <strong className="text-gold">{formatPrice(report.balance)}</strong>.
          </p>
          <ul className="divide-y divide-border text-sm mb-5">
            {p.payouts.map((pay) => (
              <li key={String(pay._id)} className="py-2 flex items-center justify-between gap-3">
                <span>
                  {day(pay.paidAt)} · <strong>{formatPrice(pay.amount)}</strong>
                  {pay.note && <span className="text-stone"> · {pay.note}</span>}
                </span>
                <form action={removePayout.bind(null, p._id, String(pay._id))}>
                  <button className="text-xs text-sale">Remove</button>
                </form>
              </li>
            ))}
            {p.payouts.length === 0 && <li className="py-2 text-stone">No payouts yet.</li>}
          </ul>
          <form action={addPayout.bind(null, p._id)} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input name="amount" type="number" min={1} step="1" required placeholder="Amount (Rs)" className="input-admin" />
            <input name="paidAt" type="date" className="input-admin" />
            <input name="note" placeholder="Note (e.g. cash, JazzCash)" className="input-admin" />
            <button className="bg-gold text-pure rounded-lg px-4 py-2 text-sm font-medium sm:col-span-3">Record payout</button>
          </form>
        </div>

        <form action={updatePromoter.bind(null, p._id)} className={`${card} space-y-3`}>
          <h2 className="font-serif-display text-xl text-ink">Details and portal login</h2>
          <input name="name" defaultValue={p.name} required className="input-admin" />
          <div className="grid grid-cols-2 gap-3">
            <input name="contactName" defaultValue={p.contactName} placeholder="Contact person" className="input-admin" />
            <input name="phone" defaultValue={p.phone} placeholder="Phone" className="input-admin" />
          </div>
          <input name="email" type="email" defaultValue={p.email} required className="input-admin" />
          <input name="password" type="password" minLength={8} placeholder={p.hasPassword ? "New portal password (optional)" : "Set a portal password"} className="input-admin" />
          <input name="codes" defaultValue={p.codes.join(", ")} placeholder="Codes" className="input-admin" />
          <label className="text-sm text-stone block">
            Commission (% of profit)
            <input name="rate" type="number" min={0} max={100} step="0.5" defaultValue={Math.round(p.commissionRate * 1000) / 10} className="input-admin mt-1" />
          </label>
          <textarea name="notes" defaultValue={p.notes} placeholder="Agreement notes (private)" rows={2} className="input-admin" />
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" name="active" defaultChecked={p.active} /> Active (can sign in to the partner portal)
          </label>
          <button className="border border-border rounded-lg px-4 py-2 text-sm hover:bg-cream">Save</button>
          <p className="text-xs text-stone">
            Changing the rate changes commission on every order shown, including past ones. Record payouts as you
            pay so the balance stays right.
          </p>
        </form>
      </div>
    </div>
  );
}
