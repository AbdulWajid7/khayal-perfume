import type { Metadata } from "next";
import Link from "next/link";
import {
  addStandardSupplies,
  addStockItem,
  adjustStock,
  archiveStockItem,
  fillBottles,
  getPurchaseReport,
  getStockOverview,
  recordPurchase,
  setProductLowAlert,
  updateStockItem,
} from "@/lib/admin/stock";
import { CATEGORY_LABELS, CATEGORY_ORDER, USAGE_LABELS } from "@/lib/stock";
import { formatPrice } from "@/lib/utils";
import type { StockCategory } from "@/models/StockItem";

export const metadata: Metadata = { title: "Stock & Supplies | Khayal Admin" };
export const dynamic = "force-dynamic";

const card = "bg-pure border border-border rounded-2xl p-6 shadow-sm";
const btn = "bg-gold text-pure rounded-lg px-4 py-2 text-sm font-medium hover:bg-gold-light";
const btn2 = "border border-border rounded-lg px-3 py-1.5 text-xs hover:bg-cream";
const qtyFmt = (n: number) => (Number.isInteger(n) ? n.toLocaleString("en-PK") : n.toLocaleString("en-PK", { maximumFractionDigits: 2 }));
const day = (iso: string | Date) =>
  new Date(iso).toLocaleDateString("en-PK", { timeZone: "Asia/Karachi", day: "numeric", month: "short" });
const TYPE_LABEL: Record<string, string> = { purchase: "Bought", adjust: "Adjusted", fill: "Filled", order: "Order", return: "Returned" };

export default async function StockPage({ searchParams }: { searchParams: Promise<{ tab?: string; month?: string }> }) {
  const { tab, month } = await searchParams;
  const data = await getStockOverview();
  const showPurchases = tab === "purchases" && data.isOwner;
  const report = showPurchases ? await getPurchaseReport(month || "") : null;

  const targets = [
    ...data.products.map((p) => ({ value: `product:${p.id}`, label: `${p.title} · ready-to-sell bottles` })),
    ...data.items.map((i) => ({ value: `supply:${i._id}`, label: `${i.name} (${i.unit})` })),
  ];
  const oils = data.items.filter((i) => i.category === "oil");
  const bottles = data.items.filter((i) => i.category === "bottle");
  const grouped = CATEGORY_ORDER.map((c) => ({ c, items: data.items.filter((i) => i.category === c) })).filter((g) => g.items.length);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif-display text-3xl text-ink">Stock &amp; Supplies</h1>
          <p className="text-stone mt-1 max-w-3xl">
            Bottles ready to sell, oils, boxes, testers and packing. Packing supplies come out of stock by themselves
            when an order is marked Packed or Dispatched.
          </p>
        </div>
        {data.isOwner && (
          <div className="flex gap-2 text-sm">
            <Link href="/admin/stock" className={`${btn2} ${!showPurchases ? "bg-gold/10 border-gold/40" : ""}`}>Stock</Link>
            <Link href="/admin/stock?tab=purchases" className={`${btn2} ${showPurchases ? "bg-gold/10 border-gold/40" : ""}`}>Purchases &amp; spend</Link>
          </div>
        )}
      </div>

      {report ? (
        <PurchasesView report={report} />
      ) : (
        <>
          {data.alerts.length > 0 && (
            <div className="rounded-2xl border border-sale/40 bg-red-50 p-5">
              <p className="font-medium text-sale mb-2">Low stock: {data.alerts.length} item{data.alerts.length > 1 ? "s" : ""} to reorder</p>
              <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1 text-sm text-ink">
                {data.alerts.map((a) => (
                  <li key={a.name}>
                    {a.name}: <strong>{qtyFmt(a.quantity)} {a.unit}</strong> <span className="text-stone">(alert at {qtyFmt(a.lowStockAt)})</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              ["Bottles ready to sell", qtyFmt(data.products.filter((p) => p.status === "active").reduce((s, p) => s + p.stock, 0))],
              ["Supplies tracked", String(data.items.length)],
              ["Low-stock alerts", String(data.alerts.length)],
              data.isOwner ? ["Supplies value (at cost)", formatPrice(data.stockValue ?? 0)] : ["Fragrances", String(data.products.length)],
            ].map(([label, value]) => (
              <div key={label} className={card}>
                <p className="text-xs uppercase tracking-wider text-stone">{label}</p>
                <p className="font-serif-display text-2xl text-ink mt-2">{value}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="grid lg:grid-cols-3 gap-6">
            <form action={recordPurchase} className={`${card} space-y-3`}>
              <h2 className="font-serif-display text-xl text-ink">Stock bought</h2>
              <select name="target" required className="input-admin" defaultValue="">
                <option value="" disabled>What did you buy?</option>
                {targets.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input name="quantity" type="number" step="any" min="0" required placeholder="Quantity" className="input-admin" />
                <input name="date" type="date" className="input-admin" />
                <input name="unitPrice" type="number" step="any" min="0" placeholder="Price per unit (Rs)" className="input-admin" />
                <input name="totalPrice" type="number" step="any" min="0" placeholder="or total paid (Rs)" className="input-admin" />
              </div>
              <input name="supplier" placeholder="Supplier" className="input-admin" />
              <input name="note" placeholder="Note, invoice no. (optional)" className="input-admin" />
              <button className={btn}>Add to stock</button>
            </form>

            <form action={fillBottles} className={`${card} space-y-3`}>
              <h2 className="font-serif-display text-xl text-ink">Bottles filled</h2>
              <p className="text-xs text-stone">Adds ready-to-sell bottles and takes the oil and empty bottles out.</p>
              <select name="productId" required className="input-admin" defaultValue="">
                <option value="" disabled>Which perfume?</option>
                {data.products.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <input name="quantity" type="number" min="1" required placeholder="Bottles filled" className="input-admin" />
                <input name="mlEach" type="number" min="1" defaultValue={50} className="input-admin" />
              </div>
              <select name="oilId" className="input-admin" defaultValue="">
                <option value="">Oil used (optional)</option>
                {oils.map((o) => <option key={o._id} value={o._id}>{o.name} · {qtyFmt(o.quantity)} ml</option>)}
              </select>
              <select name="bottleId" className="input-admin" defaultValue="">
                <option value="">Empty bottle used (optional)</option>
                {bottles.map((b) => <option key={b._id} value={b._id}>{b.name} · {qtyFmt(b.quantity)}</option>)}
              </select>
              <input name="date" type="date" className="input-admin" />
              <button className={btn}>Record filling</button>
            </form>

            <form action={adjustStock} className={`${card} space-y-3`}>
              <h2 className="font-serif-display text-xl text-ink">Correct a count</h2>
              <p className="text-xs text-stone">After a stock count, a breakage, or testers given away at an event.</p>
              <select name="target" required className="input-admin" defaultValue="">
                <option value="" disabled>Which item?</option>
                {targets.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-3">
                <select name="mode" className="input-admin" defaultValue="remove">
                  <option value="remove">Remove</option>
                  <option value="add">Add</option>
                  <option value="set">Set count to</option>
                </select>
                <input name="amount" type="number" step="any" min="0" required placeholder="Amount" className="input-admin" />
              </div>
              <select name="reason" className="input-admin" defaultValue="Stock count">
                {["Stock count", "Damaged / broken", "Given away / event", "Personal use", "Returned to supplier", "Other"].map((r) => <option key={r}>{r}</option>)}
              </select>
              <input name="note" placeholder="Note (optional)" className="input-admin" />
              <button className={btn}>Save change</button>
            </form>
          </div>

          {/* Ready to sell */}
          <div className={card}>
            <h2 className="font-serif-display text-xl text-ink mb-1">Perfumes ready to sell</h2>
            <p className="text-xs text-stone mb-4">The same count the website sells from. Orders take bottles out automatically; cancelled orders put them back.</p>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wider text-stone border-b border-border">
                  <tr><th className="py-2 pr-4">Perfume</th><th className="py-2 pr-4">In stock</th><th className="py-2 pr-4">Alert when at or below</th><th className="py-2 pr-4">Website</th></tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.products.map((p) => (
                    <tr key={p.id} className={p.low && p.status === "active" ? "bg-red-50/60" : ""}>
                      <td className="py-3 pr-4 font-medium text-ink">{p.title}</td>
                      <td className={`py-3 pr-4 ${p.low ? "text-sale font-medium" : ""}`}>{p.stock} bottles</td>
                      <td className="py-3 pr-4">
                        <form action={setProductLowAlert.bind(null, p.id)} className="flex items-center gap-2">
                          <input name="lowStockThreshold" type="number" min="0" defaultValue={p.lowStockThreshold} className="input-admin w-20" />
                          <button className={btn2}>Save</button>
                        </form>
                      </td>
                      <td className="py-3 pr-4 text-xs text-stone">{p.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Supplies */}
          <div className={card}>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="font-serif-display text-xl text-ink">Supplies</h2>
              <form action={addStandardSupplies}>
                <button className={btn2}>Add KHAYAL standard supply list</button>
              </form>
            </div>
            {grouped.length === 0 && (
              <p className="text-sm text-stone">Nothing yet. Press &ldquo;Add KHAYAL standard supply list&rdquo; to start with oils, bottles, boxes, testers, bags, cards and shipping material, then record what you have.</p>
            )}
            {grouped.map(({ c, items }) => (
              <div key={c} className="mb-6 last:mb-0">
                <p className="text-xs uppercase tracking-[0.2em] text-gold mb-2">{CATEGORY_LABELS[c as StockCategory]}</p>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="text-left text-xs text-stone border-b border-border">
                      <tr>
                        <th className="py-2 pr-4 font-normal">Item</th>
                        <th className="py-2 pr-4 font-normal">In stock</th>
                        <th className="py-2 pr-4 font-normal">Alert at</th>
                        <th className="py-2 pr-4 font-normal">Used</th>
                        {data.isOwner && <th className="py-2 pr-4 font-normal">Avg price</th>}
                        {data.isOwner && <th className="py-2 pr-4 font-normal">Value</th>}
                        <th className="py-2" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {items.map((i) => (
                        <tr key={i._id} className={i.low ? "bg-red-50/60" : ""}>
                          <td className="py-2.5 pr-4 text-ink">{i.name}{i.supplier && <div className="text-xs text-stone">{i.supplier}</div>}</td>
                          <td className={`py-2.5 pr-4 whitespace-nowrap ${i.low ? "text-sale font-medium" : ""}`}>{qtyFmt(i.quantity)} {i.unit}</td>
                          <td className="py-2.5 pr-4">{i.lowStockAt ? `${qtyFmt(i.lowStockAt)} ${i.unit}` : "—"}</td>
                          <td className="py-2.5 pr-4 text-xs text-stone">
                            {i.usageBasis === "none" ? "By hand" : `${qtyFmt(i.usageQty)} ${i.unit} ${i.usageBasis === "per_order" ? "per order" : "per bottle"}`}
                          </td>
                          {data.isOwner && <td className="py-2.5 pr-4">{i.avgUnitCost ? formatPrice(i.avgUnitCost) : "—"}</td>}
                          {data.isOwner && <td className="py-2.5 pr-4">{i.value ? formatPrice(i.value) : "—"}</td>}
                          <td className="py-2.5">
                            <details>
                              <summary className="text-xs text-gold cursor-pointer">Edit</summary>
                              <form action={updateStockItem.bind(null, i._id)} className="mt-2 grid gap-2 w-72">
                                <ItemFields item={i} />
                                <button className={btn2}>Save item</button>
                              </form>
                              {data.isOwner && (
                                <form action={archiveStockItem.bind(null, i._id)} className="mt-2">
                                  <button className="text-xs text-sale">Remove item</button>
                                </form>
                              )}
                            </details>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>

          <form action={addStockItem} className={`${card} space-y-3`}>
            <h2 className="font-serif-display text-xl text-ink">Add a new item</h2>
            <div className="grid md:grid-cols-3 gap-3">
              <ItemFields />
              <input name="quantity" type="number" step="any" min="0" placeholder="Quantity you have now" className="input-admin" />
              <input name="unitPrice" type="number" step="any" min="0" placeholder="Price per unit (Rs)" className="input-admin" />
            </div>
            <button className={btn}>Add item</button>
          </form>

          <div className={card}>
            <h2 className="font-serif-display text-xl text-ink mb-4">Recent stock changes</h2>
            {data.movements.length === 0 ? (
              <p className="text-sm text-stone">No changes recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="text-left text-xs uppercase tracking-wider text-stone border-b border-border">
                    <tr>
                      <th className="py-2 pr-4">Date</th><th className="py-2 pr-4">Item</th><th className="py-2 pr-4">Change</th>
                      <th className="py-2 pr-4">Why</th><th className="py-2 pr-4">Left</th>
                      {data.isOwner && <th className="py-2 pr-4">Cost</th>}
                      <th className="py-2 pr-4">By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.movements.map((m) => (
                      <tr key={m._id}>
                        <td className="py-2 pr-4 whitespace-nowrap">{day(m.date)}</td>
                        <td className="py-2 pr-4">{m.itemName}</td>
                        <td className={`py-2 pr-4 whitespace-nowrap ${m.quantity < 0 ? "text-sale" : "text-emerald-700"}`}>
                          {m.quantity > 0 ? "+" : ""}{qtyFmt(m.quantity)} {m.unit}
                        </td>
                        <td className="py-2 pr-4 text-xs">{TYPE_LABEL[m.type]}{m.orderNumber ? ` ${m.orderNumber}` : ""}{m.reason ? ` · ${m.reason}` : ""}{m.supplier ? ` · ${m.supplier}` : ""}</td>
                        <td className="py-2 pr-4">{qtyFmt(m.balanceAfter)}</td>
                        {data.isOwner && <td className="py-2 pr-4">{m.type === "purchase" && m.totalCost ? formatPrice(m.totalCost) : ""}</td>}
                        <td className="py-2 pr-4 text-xs text-stone">{m.by}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function ItemFields({ item }: { item?: { name: string; category: string; unit: string; lowStockAt: number; usageBasis: string; usageQty: number; supplier?: string; notes?: string } }) {
  return (
    <>
      <input name="name" required defaultValue={item?.name} placeholder="Item name, e.g. Carry bag" className="input-admin" />
      <select name="category" defaultValue={item?.category || "packaging"} className="input-admin">
        {CATEGORY_ORDER.map((c) => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
      </select>
      <input name="unit" defaultValue={item?.unit || "pcs"} placeholder="Unit (pcs, ml, m, rolls)" className="input-admin" />
      <input name="lowStockAt" type="number" step="any" min="0" defaultValue={item?.lowStockAt ?? 20} placeholder="Alert when at or below" className="input-admin" />
      <select name="usageBasis" defaultValue={item?.usageBasis || "none"} className="input-admin">
        {Object.entries(USAGE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
      </select>
      <input name="usageQty" type="number" step="any" min="0" defaultValue={item?.usageQty ?? 1} placeholder="How many each time" className="input-admin" />
      <input name="supplier" defaultValue={item?.supplier} placeholder="Supplier (optional)" className="input-admin" />
      <input name="notes" defaultValue={item?.notes} placeholder="Notes (optional)" className="input-admin" />
    </>
  );
}

function PurchasesView({ report }: { report: Awaited<ReturnType<typeof getPurchaseReport>> }) {
  const [y, m] = report.month.split("-").map(Number);
  const prev = new Date(Date.UTC(y, m - 2, 1)).toISOString().slice(0, 7);
  const next = new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 7);
  const label = new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link href={`/admin/stock?tab=purchases&month=${prev}`} className={btn2}>←</Link>
        <h2 className="font-serif-display text-2xl text-ink">{label}</h2>
        <Link href={`/admin/stock?tab=purchases&month=${next}`} className={btn2}>→</Link>
        <a href={`/admin/stock/export?month=${report.month}`} className={`${btn2} ml-auto`}>Download CSV</a>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={card}>
          <p className="text-xs uppercase tracking-wider text-stone">Spent on stock</p>
          <p className="font-serif-display text-2xl text-ink mt-2">{formatPrice(report.total)}</p>
        </div>
        {report.byCategory.map((c) => (
          <div key={c.category} className={card}>
            <p className="text-xs uppercase tracking-wider text-stone">{CATEGORY_LABELS[c.category as StockCategory] || (c.category === "perfume" ? "Ready-made perfume" : c.category)}</p>
            <p className="font-serif-display text-2xl text-ink mt-2">{formatPrice(c.total)}</p>
          </div>
        ))}
      </div>
      <div className={card}>
        {report.rows.length === 0 ? (
          <p className="text-sm text-stone">No purchases recorded this month.</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-stone border-b border-border">
              <tr><th className="py-2 pr-4">Date</th><th className="py-2 pr-4">Item</th><th className="py-2 pr-4">Qty</th><th className="py-2 pr-4">Unit price</th><th className="py-2 pr-4">Total</th><th className="py-2 pr-4">Supplier</th><th className="py-2 pr-4">Note</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {report.rows.map((r) => (
                <tr key={r._id}>
                  <td className="py-2 pr-4">{day(r.date)}</td>
                  <td className="py-2 pr-4">{r.itemName}</td>
                  <td className="py-2 pr-4">{qtyFmt(r.quantity)} {r.unit}</td>
                  <td className="py-2 pr-4">{r.unitCost ? formatPrice(r.unitCost) : "—"}</td>
                  <td className="py-2 pr-4 font-medium">{r.totalCost ? formatPrice(r.totalCost) : "—"}</td>
                  <td className="py-2 pr-4">{r.supplier || ""}</td>
                  <td className="py-2 pr-4 text-xs text-stone">{r.note || r.reason || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
