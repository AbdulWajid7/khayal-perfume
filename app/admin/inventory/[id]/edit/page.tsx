import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductById, updateProduct } from "@/lib/admin/products";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="font-serif-display text-ink text-3xl font-medium">Edit Product</h1>
        <Link
          href="/admin/inventory"
          className="text-stone text-sm hover:text-gold transition-colors"
        >
          ← Back to Inventory
        </Link>
      </div>

      <form
        action={updateProduct.bind(null, id)}
        className="bg-pure border border-border rounded-2xl p-6 space-y-6 shadow-sm"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="title"
            required
            defaultValue={product.title}
            placeholder="Product title"
            className="input-admin md:col-span-2"
          />
          <input
            name="handle"
            required
            defaultValue={product.handle}
            placeholder="URL handle"
            className="input-admin"
          />
          <input
            name="sku"
            defaultValue={product.sku || ""}
            placeholder="SKU"
            className="input-admin"
          />
          <input
            name="price"
            required
            type="number"
            defaultValue={product.price}
            placeholder="Price"
            className="input-admin"
          />
          <input
            name="compareAtPrice"
            type="number"
            defaultValue={product.compareAtPrice || ""}
            placeholder="Compare at price"
            className="input-admin"
          />
          <input
            name="cost"
            type="number"
            defaultValue={product.cost || ""}
            placeholder="Cost"
            className="input-admin"
          />
          <input
            name="stock"
            required
            type="number"
            defaultValue={product.stock}
            placeholder="Stock"
            className="input-admin"
          />
          <input
            name="lowStockThreshold"
            type="number"
            defaultValue={product.lowStockThreshold}
            placeholder="Low stock alert"
            className="input-admin"
          />
          <select name="status" defaultValue={product.status} className="input-admin">
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
          <select name="category" defaultValue={product.category} className="input-admin">
            <option value="Men">Men</option>
            <option value="Women">Women</option>
            <option value="Unisex">Unisex</option>
          </select>
        </div>

        <textarea
          name="description"
          rows={4}
          defaultValue={product.description}
          placeholder="Short description"
          className="input-admin"
        />
        <input
          name="images"
          defaultValue={product.images.join(", ")}
          placeholder="Image URLs, comma separated"
          className="input-admin"
        />
        <input
          name="tags"
          defaultValue={product.tags.join(", ")}
          placeholder="Tags, comma separated"
          className="input-admin"
        />

        <div className="flex items-center gap-4 pt-2">
          <button
            type="submit"
            className="bg-gold text-pure rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-gold-light transition-colors"
          >
            Save Product
          </button>
          <Link href="/admin/inventory" className="text-stone text-sm hover:text-gold">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
