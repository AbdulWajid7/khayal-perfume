import Link from "next/link";
import { createProduct } from "@/lib/admin/products";

export default function NewProductPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="font-serif-display text-ink text-3xl font-medium">New Product</h1>
        <Link
          href="/admin/inventory"
          className="text-stone text-sm hover:text-gold transition-colors"
        >
          ← Back to Inventory
        </Link>
      </div>

      <form
        action={createProduct}
        className="bg-pure border border-border rounded-2xl p-6 space-y-6 shadow-sm"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="title" required placeholder="Product title" className="input-admin md:col-span-2" />
          <input name="handle" required placeholder="URL handle (e.g. oud-imperial)" className="input-admin" />
          <input name="sku" placeholder="SKU" className="input-admin" />
          <input name="price" required type="number" placeholder="Price (PKR)" className="input-admin" />
          <input name="compareAtPrice" type="number" placeholder="Compare at price" className="input-admin" />
          <input name="cost" type="number" placeholder="Cost" className="input-admin" />
          <input name="stock" required type="number" placeholder="Stock" defaultValue="0" className="input-admin" />
          <input name="lowStockThreshold" type="number" placeholder="Low stock alert" defaultValue="5" className="input-admin" />
          <select name="status" defaultValue="draft" className="input-admin">
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
          <select name="category" defaultValue="Unisex" className="input-admin">
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Unisex">Unisex</option>
          </select>
        </div>

        <textarea
          name="description"
          rows={4}
          placeholder="Short description"
          className="input-admin"
        />
        <input
          name="images"
          placeholder="Image URLs, comma separated"
          className="input-admin"
        />
        <input
          name="tags"
          placeholder="Tags, comma separated"
          className="input-admin"
        />

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            className="bg-gold text-pure rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-gold-light transition-colors"
          >
            Create Product
          </button>
          <Link href="/admin/inventory" className="text-stone text-sm hover:text-gold">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
