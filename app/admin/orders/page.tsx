import Link from "next/link";
import { getOrders, updateOrder, deleteOrder } from "@/lib/admin/orders";

export default async function OrdersPage() {
  const orders = await getOrders();

  const statusColors: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700",
    processing: "bg-blue-100 text-blue-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

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

      <div className="bg-pure border border-border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream-dark text-stone">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id} className="border-t border-border">
                <td className="px-4 py-3 text-ink font-medium">{order.orderNumber}</td>
                <td className="px-4 py-3 text-stone">
                  {order.customer.name}
                  <br />
                  <span className="text-xs text-stone-light">{order.customer.email}</span>
                </td>
                <td className="px-4 py-3 text-ink">
                  Rs {order.total.toLocaleString("en-PK")}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      statusColors[order.status] || "bg-stone/10 text-stone"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-stone-light text-xs">
                  {new Date(order.createdAt).toLocaleDateString("en-PK")}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <form action={updateOrder.bind(null, order._id)} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={order._id} />
                      <select
                        name="status"
                        defaultValue={order.status}
                        className="bg-cream border border-border rounded px-2 py-1 text-xs text-ink"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <button
                        type="submit"
                        className="text-gold text-xs hover:text-gold-light"
                      >
                        Update
                      </button>
                    </form>
                    <form action={deleteOrder.bind(null, order._id)}>
                      <button
                        type="submit"
                        className="text-sale text-xs hover:opacity-80"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-stone">
                  No orders yet. Create your first order.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
