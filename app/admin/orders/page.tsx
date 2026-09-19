import Link from "next/link";
import { getOrders, updateOrder, deleteOrder } from "@/lib/admin/orders";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = {
    search: typeof params.search === "string" ? params.search : undefined,
    status: typeof params.status === "string" ? params.status : undefined,
    paymentStatus: typeof params.paymentStatus === "string" ? params.paymentStatus : undefined,
    city: typeof params.city === "string" ? params.city : undefined,
    courier: typeof params.courier === "string" ? params.courier : undefined,
    from: typeof params.from === "string" ? params.from : undefined,
    to: typeof params.to === "string" ? params.to : undefined,
  };

  const orders = await getOrders(filters);

  const statusColors: Record<string, string> = {
    pending_confirmation: "bg-amber-100 text-amber-700",
    payment_review: "bg-orange-100 text-orange-700",
    confirmed: "bg-emerald-100 text-emerald-700",
    processing: "bg-blue-100 text-blue-700",
    packed: "bg-indigo-100 text-indigo-700",
    dispatched: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    return_requested: "bg-rose-100 text-rose-700",
    returned: "bg-stone-100 text-stone-700",
  };

  const statusLabel = (status: string) =>
    status
      .split("_")
      .map((s) => s[0].toUpperCase() + s.slice(1))
      .join(" ");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif-display text-ink text-3xl font-medium">Orders</h1>
          <p className="mt-1 text-stone text-sm">Manage customer orders and fulfillment.</p>
        </div>
        <Link
          href="/admin/orders/new"
          className="inline-flex items-center justify-center bg-gold text-pure rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-gold-light transition-colors"
        >
          + New Order
        </Link>
      </div>

      <form className="flex flex-wrap gap-3 items-end bg-pure border border-border rounded-2xl p-4">
        <div>
          <label className="block text-xs text-stone mb-1">Search</label>
          <input name="search" defaultValue={filters.search} placeholder="Order, name, phone" className="input-admin" />
        </div>
        <div>
          <label className="block text-xs text-stone mb-1">Status</label>
          <select name="status" defaultValue={filters.status} className="input-admin bg-white">
            <option value="">All</option>
            <option value="pending_confirmation">Pending Confirmation</option>
            <option value="payment_review">Payment Review</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="packed">Packed</option>
            <option value="dispatched">Dispatched</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-stone mb-1">Payment</label>
          <select name="paymentStatus" defaultValue={filters.paymentStatus} className="input-admin bg-white">
            <option value="">All</option>
            <option value="unpaid">Unpaid</option>
            <option value="pending_verification">Pending Verification</option>
            <option value="paid">Paid</option>
            <option value="rejected">Rejected</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-stone mb-1">From</label>
          <input name="from" type="date" defaultValue={filters.from} className="input-admin" />
        </div>
        <div>
          <label className="block text-xs text-stone mb-1">To</label>
          <input name="to" type="date" defaultValue={filters.to} className="input-admin" />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="bg-gold text-pure rounded-lg px-4 py-2 text-sm font-medium hover:bg-gold-light transition-colors">
            Filter
          </button>
          <Link href="/admin/orders" className="border border-border text-stone rounded-lg px-4 py-2 text-sm font-medium hover:bg-cream transition-colors">
            Reset
          </Link>
        </div>
      </form>

      <div className="bg-pure border border-border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream-dark text-stone">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">City</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="border-t border-border">
                <td className="px-4 py-3 text-ink font-medium">
                  <Link href={`/admin/orders/${order._id}`} className="text-gold hover:text-gold-light">
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3 text-stone">
                  {order.customer.name}
                  <br />
                  <span className="text-xs text-stone-light">{order.customer.phone}</span>
                </td>
                <td className="px-4 py-3 text-stone">{order.customer.address.city}</td>
                <td className="px-4 py-3 text-ink">
                  Rs {order.total.toLocaleString("en-PK")}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      statusColors[order.orderStatus] || "bg-stone/10 text-stone"
                    }`}
                  >
                    {statusLabel(order.orderStatus)}
                  </span>
                </td>
                <td className="px-4 py-3 text-stone capitalize">{order.paymentStatus.replace(/_/g, " ")}</td>
                <td className="px-4 py-3 text-stone-light text-xs">
                  {new Date(order.createdAt).toLocaleDateString("en-PK")}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <form action={updateOrder.bind(null, order._id)} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={order._id} />
                      <select
                        name="status"
                        defaultValue={order.orderStatus}
                        className="bg-cream border border-border rounded px-2 py-1 text-xs text-ink"
                      >
                        <option value="pending_confirmation">Pending Confirmation</option>
                        <option value="payment_review">Payment Review</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="packed">Packed</option>
                        <option value="dispatched">Dispatched</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <button type="submit" className="text-gold text-xs hover:text-gold-light">Update</button>
                    </form>
                    <form action={deleteOrder.bind(null, order._id)}>
                      <button type="submit" className="text-sale text-xs hover:opacity-80">Delete</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-stone">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
