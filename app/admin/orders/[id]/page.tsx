import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderById, updateOrderStatus, assignCourier, verifyPayment, rejectPayment, cancelOrder, addInternalNote } from "@/lib/admin/orders";
import { formatPrice } from "@/lib/utils";
import type { Courier } from "@/models/Order";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) notFound();

  const statusLabel = (status: string) =>
    status
      .split("_")
      .map((s) => s[0].toUpperCase() + s.slice(1))
      .join(" ");

  const statusColors: Record<string, string> = {
    pending_confirmation: "bg-amber-100 text-amber-700",
    payment_review: "bg-orange-100 text-orange-700",
    confirmed: "bg-emerald-100 text-emerald-700",
    processing: "bg-blue-100 text-blue-700",
    packed: "bg-indigo-100 text-indigo-700",
    dispatched: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  const couriers: { value: Courier; label: string }[] = [
    { value: "unassigned", label: "Unassigned" },
    { value: "self_delivery", label: "KHAYAL Self Delivery" },
    { value: "leopards", label: "Leopards" },
    { value: "tcs", label: "TCS" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/orders" className="text-stone text-sm hover:text-gold">← Back to orders</Link>
          <h1 className="font-serif-display text-ink text-3xl font-medium mt-1">{order.orderNumber}</h1>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[order.orderStatus] || "bg-stone/10 text-stone"}`}>
          {statusLabel(order.orderStatus)}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-pure border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-ink font-medium mb-4">Items</h2>
            <table className="w-full text-sm">
              <thead className="text-stone border-b border-border">
                <tr>
                  <th className="text-left pb-2">Product</th>
                  <th className="text-left pb-2">Qty</th>
                  <th className="text-right pb-2">Unit</th>
                  <th className="text-right pb-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="py-3 text-ink">
                      {item.name}
                      {item.variantName && <span className="block text-stone text-xs">{item.variantName}</span>}
                    </td>
                    <td className="py-3 text-stone">{item.quantity}</td>
                    <td className="py-3 text-stone text-right tabular-nums">{formatPrice(item.unitPrice, order.currency)}</td>
                    <td className="py-3 text-ink text-right tabular-nums">{formatPrice(item.lineTotal, order.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-border font-medium">
              <span className="text-ink">Total</span>
              <span className="text-ink tabular-nums">{formatPrice(order.total, order.currency)}</span>
            </div>
          </div>

          <div className="bg-pure border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-ink font-medium mb-4">Audit History</h2>
            <ul className="space-y-3 text-sm">
              {order.auditHistory.map((entry, i) => (
                <li key={i} className="border-b border-border last:border-0 pb-3 last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="text-ink font-medium">{statusLabel(entry.action)}</span>
                    <span className="text-stone-light text-xs">{new Date(entry.createdAt).toLocaleString("en-PK")}</span>
                  </div>
                  <p className="text-stone text-xs mt-1">By {entry.actor}{entry.actorId ? ` (${entry.actorId})` : ""}</p>
                  {entry.note && <p className="text-stone text-xs mt-1">{entry.note}</p>}
                </li>
              ))}
              {order.auditHistory.length === 0 && <li className="text-stone">No audit entries yet.</li>}
            </ul>
          </div>

          <form action={addInternalNote.bind(null, id)} className="bg-pure border border-border rounded-2xl p-6 shadow-sm space-y-3">
            <h2 className="text-ink font-medium">Internal Note</h2>
            <textarea name="note" required className="input-admin min-h-[80px]" placeholder="Add a private note..." />
            <button type="submit" className="bg-gold text-pure rounded-lg px-4 py-2 text-sm font-medium hover:bg-gold-light transition-colors">Add Note</button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="bg-pure border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-ink font-medium mb-4">Customer</h2>
            <p className="text-ink">{order.customer.name}</p>
            <p className="text-stone text-sm">{order.customer.phone}</p>
            {order.customer.email && <p className="text-stone text-sm">{order.customer.email}</p>}
            <div className="mt-3 text-sm text-stone">
              <p>{order.customer.address.line}</p>
              <p>{order.customer.address.area}, {order.customer.address.city}</p>
              <p>{order.customer.address.province}</p>
              {order.customer.address.postalCode && <p>{order.customer.address.postalCode}</p>}
              {order.customer.address.instructions && <p className="mt-2 italic">{order.customer.address.instructions}</p>}
            </div>
            {order.customerNotes && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-stone text-sm">Customer note: {order.customerNotes}</p>
              </div>
            )}
          </div>

          <div className="bg-pure border border-border rounded-2xl p-6 shadow-sm">
            <h2 className="text-ink font-medium mb-4">Payment & Delivery</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-stone">Method</dt><dd className="text-ink capitalize">{order.paymentMethod.replace(/_/g, " ")}</dd></div>
              <div className="flex justify-between"><dt className="text-stone">Payment status</dt><dd className="text-ink capitalize">{order.paymentStatus.replace(/_/g, " ")}</dd></div>
              <div className="flex justify-between"><dt className="text-stone">Delivery</dt><dd className="text-ink capitalize">{order.deliveryMethod.replace(/_/g, " ")}</dd></div>
              <div className="flex justify-between"><dt className="text-stone">Courier</dt><dd className="text-ink capitalize">{order.courier.replace(/_/g, " ")}</dd></div>
              {order.trackingNumber && <div className="flex justify-between"><dt className="text-stone">Tracking</dt><dd className="text-ink">{order.trackingNumber}</dd></div>}
            </dl>
          </div>

          <form action={updateOrderStatus.bind(null, id)} className="bg-pure border border-border rounded-2xl p-6 shadow-sm space-y-3">
            <h2 className="text-ink font-medium">Update Status</h2>
            <select name="status" defaultValue={order.orderStatus} className="input-admin bg-white">
              <option value="pending_confirmation">Pending Confirmation</option>
              <option value="payment_review">Payment Review</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="packed">Packed</option>
              <option value="dispatched">Dispatched</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <input type="text" name="note" placeholder="Note (optional)" className="input-admin" />
            <button type="submit" className="w-full bg-gold text-pure rounded-lg px-4 py-2 text-sm font-medium hover:bg-gold-light transition-colors">Update</button>
          </form>

          <form action={assignCourier.bind(null, id)} className="bg-pure border border-border rounded-2xl p-6 shadow-sm space-y-3">
            <h2 className="text-ink font-medium">Courier</h2>
            <select name="courier" defaultValue={order.courier} className="input-admin bg-white">
              {couriers.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <input type="text" name="trackingNumber" defaultValue={order.trackingNumber} placeholder="Tracking number" className="input-admin" />
            <button type="submit" className="w-full bg-gold text-pure rounded-lg px-4 py-2 text-sm font-medium hover:bg-gold-light transition-colors">Assign</button>
          </form>

          {order.paymentMethod === "bank_transfer" && order.paymentVerification && order.paymentStatus === "pending_verification" && (
            <div className="bg-pure border border-border rounded-2xl p-6 shadow-sm space-y-3">
              <h2 className="text-ink font-medium">Payment Proof</h2>
              <p className="text-sm text-stone">Reference: {order.paymentVerification.referenceNumber}</p>
              <p className="text-sm text-stone">Sender: {order.paymentVerification.senderName}</p>
              <p className="text-sm text-stone">Date: {new Date(order.paymentVerification.transferDate).toLocaleDateString("en-PK")}</p>
              <a href={order.paymentVerification.proofUrl} target="_blank" rel="noopener noreferrer" className="inline-block text-gold text-sm hover:underline">View proof</a>
              <div className="flex gap-2">
                <form action={verifyPayment.bind(null, id)} className="flex-1">
                  <button type="submit" className="w-full bg-emerald-600 text-pure rounded-lg px-4 py-2 text-sm font-medium hover:bg-emerald-700 transition-colors">Verify</button>
                </form>
                <form action={rejectPayment.bind(null, id)} className="flex-1">
                  <input type="text" name="reason" required placeholder="Reason" className="input-admin mb-2" />
                  <button type="submit" className="w-full bg-red-600 text-pure rounded-lg px-4 py-2 text-sm font-medium hover:bg-red-700 transition-colors">Reject</button>
                </form>
              </div>
            </div>
          )}

          <form action={cancelOrder.bind(null, id)} className="bg-pure border border-border rounded-2xl p-6 shadow-sm space-y-3">
            <h2 className="text-ink font-medium text-sale">Cancel Order</h2>
            <input type="text" name="reason" required placeholder="Cancellation reason" className="input-admin" />
            <button type="submit" className="w-full bg-sale text-pure rounded-lg px-4 py-2 text-sm font-medium hover:opacity-80 transition-colors">Cancel</button>
          </form>
        </div>
      </div>
    </div>
  );
}
