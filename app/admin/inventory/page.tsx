import Link from "next/link";
import { getProducts, deleteProduct } from "@/lib/admin/products";
import { importCatalog } from "@/lib/admin/catalog";

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ imported?: string }>;
}) {
  const products = await getProducts();
  const { imported } = await searchParams;
  const [createdCount, updatedCount] = (imported || "").split("-").map(Number);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif-display text-ink text-3xl font-medium">Inventory</h1>
          <p className="mt-1 text-stone text-sm">Manage products, stock, and pricing.</p>
        </div>
        <Link
          href="/admin/inventory/new"
          className="inline-flex items-center justify-center bg-gold text-pure rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-gold-light transition-colors"
        >
          + New Product
        </Link>
      </div>

      {imported && (
        <p className="bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3 text-sm">
          Catalog imported: {createdCount || 0} new {createdCount === 1 ? "product" : "products"} added as drafts,{" "}
          {updatedCount || 0} existing updated. Open each draft, add its price, stock and photos, then set status to Active.
        </p>
      )}

      <form
        action={importCatalog}
        className="bg-pure border border-border rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <p className="text-ink text-sm font-medium">KHAYAL catalog (11 fragrances)</p>
          <p className="text-stone text-xs mt-1 max-w-xl">
            Adds any missing fragrances as drafts with their descriptions, scent notes, tags and SEO
            fields, and refreshes the copy on existing ones. Prices, stock, photos and status of
            existing products are never changed. Safe to run more than once.
          </p>
        </div>
        <button
          type="submit"
          className="shrink-0 border border-gold text-gold rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-gold hover:text-pure transition-colors"
        >
          Import KHAYAL catalog
        </button>
      </form>

      <div className="bg-pure border border-border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream-dark text-stone">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id} className="border-t border-border">
                <td className="px-4 py-3 text-ink font-medium">
                  {product.title}
                  <br />
                  <span className="text-xs text-stone-light">{product.handle}</span>
                </td>
                <td className="px-4 py-3 text-stone">{product.sku || "—"}</td>
                <td className="px-4 py-3 text-ink">
                  Rs {product.price.toLocaleString("en-PK")}
                </td>
                <td className="px-4 py-3 text-ink">
                  {product.stock <= product.lowStockThreshold ? (
                    <span className="text-sale font-medium">{product.stock}</span>
                  ) : (
                    product.stock
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      product.status === "active"
                        ? "bg-green-100 text-green-700"
                        : product.status === "draft"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-stone/10 text-stone"
                    }`}
                  >
                    {product.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/admin/inventory/${product._id}/edit`}
                      className="text-gold text-xs hover:text-gold-light"
                    >
                      Edit
                    </Link>
                    <form action={deleteProduct.bind(null, product._id)}>
                      <button type="submit" className="text-sale text-xs hover:opacity-80">
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-stone">
                  No products yet. Add your first product.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
