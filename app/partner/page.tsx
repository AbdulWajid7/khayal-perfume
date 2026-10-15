import { redirect } from "next/navigation";
import { getPartner } from "@/lib/partner-auth";
import { partnerLogout } from "@/lib/partner-session";
import { portalOrders, promoterReport } from "@/lib/promoter-report";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

const card = "bg-pure border border-border rounded-2xl p-5 md:p-6 shadow-sm";
const STATE = { earned: "Delivered · earned", pending: "On its way", void: "Cancelled / returned" } as const;
const day = (iso: string | Date) =>
  new Date(iso).toLocaleDateString("en-PK", { timeZone: "Asia/Karachi", day: "numeric", month: "short" });

export default async function PartnerDashboard() {
  const partner = await getPartner();
  if (!partner) redirect("/partner/login");
  const report = await promoterReport(partner);
  const orders = portalOrders(report.orders);
  const s = report.summary;
  const rate = Math.round(partner.commissionRate * 1000) / 10;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Welcome back</p>
          <h1 className="font-serif-display text-3xl md:text-4xl mt-1">{partner.name}</h1>
          <p className="text-sm text-stone mt-1">
            Your code{partner.codes.length > 1 ? "s" : ""}:{" "}
            {partner.codes.map((c) => (
              <span key={c} className="inline-block mr-2 rounded border border-gold/50 px-2 py-0.5 font-medium tracking-[0.15em] text-ink">{c}</span>
            ))}
            · You earn {rate}% of the profit on every delivered order.
          </p>
        </div>
        <form action={partnerLogout}>
          <button className="text-sm border border-border rounded-lg px-4 py-2 hover:bg-pure">Sign out</button>
        </form>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          ["Orders with your code", String(s.orders), `${s.bottles} bottles`],
          ["Commission earned", formatPrice(s.earned), "on delivered orders"],
          ["Coming soon", formatPrice(s.pending), "orders on their way"],
          ["Due to you", formatPrice(Math.max(0, report.balance)), `${formatPrice(report.paid)} paid so far`],
        ].map(([label, value, sub]) => (
          <div key={label} className={card}>
            <p className="text-[11px] uppercase tracking-wider text-stone">{label}</p>
            <p className="font-serif-display text-2xl md:text-3xl mt-2">{value}</p>
            <p className="text-xs text-stone mt-1">{sub}</p>
          </div>
        ))}
      </div>

      <div className={card}>
        <h2 className="font-serif-display text-xl mb-4">Your orders</h2>
        {orders.length === 0 ? (
          <p className="text-sm text-stone">No orders with your code yet. Share it with your guests: they get a special price and you earn on every bottle.</p>
        ) : (
          <div className="overflow-x-auto -mx-2">
            <table className="min-w-full text-sm">
              <thead className="text-left text-[11px] uppercase tracking-wider text-stone border-b border-border">
                <tr>
                  <th className="py-2 px-2">Date</th>
                  <th className="py-2 px-2">Order</th>
                  <th className="py-2 px-2">Fragrances</th>
                  <th className="py-2 px-2">City</th>
                  <th className="py-2 px-2">Status</th>
                  <th className="py-2 px-2 text-right">Your commission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((o) => (
                  <tr key={o.orderNumber} className={o.state === "void" ? "opacity-50" : ""}>
                    <td className="py-3 px-2 whitespace-nowrap">{day(o.createdAt)}</td>
                    <td className="py-3 px-2 whitespace-nowrap">{o.orderNumber}</td>
                    <td className="py-3 px-2">{o.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}</td>
                    <td className="py-3 px-2">{o.city}</td>
                    <td className="py-3 px-2 text-xs">{STATE[o.state]}</td>
                    <td className="py-3 px-2 text-right font-medium">
                      {o.state === "void" ? "—" : o.commission === null ? <span className="text-xs text-stone">being calculated</span> : formatPrice(o.commission)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className={card}>
        <h2 className="font-serif-display text-xl mb-4">Payments to you</h2>
        {partner.payouts.length === 0 ? (
          <p className="text-sm text-stone">No payments yet.</p>
        ) : (
          <ul className="divide-y divide-border text-sm">
            {[...partner.payouts].reverse().map((p, i) => (
              <li key={i} className="py-2 flex justify-between gap-4">
                <span>{day(p.paidAt)}{p.note ? ` · ${p.note}` : ""}</span>
                <strong>{formatPrice(p.amount)}</strong>
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-stone mt-4">
          Commission is counted once an order is delivered. Cancelled or returned orders do not count. Questions?
          Message KHAYAL on WhatsApp.
        </p>
      </div>
    </div>
  );
}
