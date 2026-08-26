import Link from "next/link";
import { createOrder } from "@/lib/admin/orders";

export default function NewOrderPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="font-serif-display text-ink text-3xl font-medium">New Order</h1>
        <Link
          href="/admin/orders"
          className="text-stone text-sm hover:text-gold transition-colors"
        >
          ← Back to Orders
        </Link>
      </div>

      <form
        action={createOrder}
        className="bg-pure border border-border rounded-2xl p-6 space-y-6 shadow-sm"
      >
        <div>
          <h2 className="text-ink font-medium mb-4">Customer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="customerName" required placeholder="Name" className="input-admin" />
            <input name="customerEmail" required type="email" placeholder="Email" className="input-admin" />
            <input name="customerPhone" required placeholder="Phone" className="input-admin" />
            <input name="customerCity" required placeholder="City" className="input-admin" />
            <input name="customerAddress" required placeholder="Address" className="input-admin md:col-span-2" />
          </div>
        </div>

        <div>
          <h2 className="text-ink font-medium mb-4">Item</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input name="items" required placeholder='e.g. [{"productId":"...","title":"Oud Imperial","quantity":1,"price":14900}]' className="input-admin md:col-span-3" />
          </div>
          <p className="mt-2 text-xs text-stone-light">
            Enter items as a JSON array for now. Example: [{`"productId":"1","title":"Oud Imperial","quantity":1,"price":14900`}]
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input name="subtotal" required type="number" placeholder="Subtotal" className="input-admin" />
          <input name="shipping" type="number" placeholder="Shipping" defaultValue="0" className="input-admin" />
          <input name="discount" type="number" placeholder="Discount" defaultValue="0" className="input-admin" />
          <input name="total" required type="number" placeholder="Total" className="input-admin" />
          <select name="status" defaultValue="pending" className="input-admin">
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select name="paymentStatus" defaultValue="pending" className="input-admin">
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="cod">COD</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>

        <input name="tracking" placeholder="Tracking number (optional)" className="input-admin" />

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            className="bg-gold text-pure rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-gold-light transition-colors"
          >
            Create Order
          </button>
          <Link href="/admin/orders" className="text-stone text-sm hover:text-gold">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
