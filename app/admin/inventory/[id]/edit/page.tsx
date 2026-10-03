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

        <fieldset className="border border-border rounded-xl p-4 space-y-4">
          <legend className="px-2 text-xs uppercase tracking-[0.15em] text-stone">Fragrance Profile</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="concentration" defaultValue={product.concentration || ""} placeholder="Concentration (e.g. Extrait de Parfum)" className="input-admin" />
            <input name="sizeMl" type="number" defaultValue={product.sizeMl || ""} placeholder="Size (ml)" className="input-admin" />
            <input name="longevity" defaultValue={product.longevity || ""} placeholder="Longevity (e.g. 8-10 hours)" className="input-admin" />
            <input name="sillage" defaultValue={product.sillage || ""} placeholder="Sillage (e.g. Strong, Moderate)" className="input-admin" />
            <input name="occasion" defaultValue={product.occasion || ""} placeholder="Occasion (e.g. Evening, Winter)" className="input-admin md:col-span-2" />
            <input name="scentNotesTop" defaultValue={product.scentNotesTop?.join(", ") || ""} placeholder="Top notes, comma separated" className="input-admin" />
            <input name="scentNotesHeart" defaultValue={product.scentNotesHeart?.join(", ") || ""} placeholder="Heart notes, comma separated" className="input-admin" />
            <input name="scentNotesBase" defaultValue={product.scentNotesBase?.join(", ") || ""} placeholder="Base notes, comma separated" className="input-admin" />
            <input name="mpn" defaultValue={product.mpn || ""} placeholder="MPN / GTIN (optional)" className="input-admin" />
          </div>
        </fieldset>

        <fieldset className="border border-border rounded-xl p-4 space-y-4">
          <legend className="px-2 text-xs uppercase tracking-[0.15em] text-stone">SEO</legend>
          <input name="metaTitle" defaultValue={product.metaTitle || ""} placeholder="Meta title (50-60 chars, optional)" className="input-admin" />
          <textarea name="metaDescription" rows={2} defaultValue={product.metaDescription || ""} placeholder="Meta description (140-160 chars, optional)" className="input-admin" />
          <input name="focusKeyword" defaultValue={product.focusKeyword || ""} placeholder="Focus keyword (e.g. oud perfume for men)" className="input-admin" />
          <input name="keywords" defaultValue={product.keywords?.join(", ") || ""} placeholder="Keywords, comma separated" className="input-admin" />
          <input name="ogImage" defaultValue={product.ogImage || ""} placeholder="Social share image URL (1200x630, optional)" className="input-admin" />
          <input name="canonicalUrl" defaultValue={product.canonicalUrl || ""} placeholder="Canonical URL override (optional)" className="input-admin" />
          <label className="flex items-center gap-2 text-sm text-stone">
            <input type="checkbox" name="noIndex" defaultChecked={product.noIndex} className="accent-gold" />
            Hide this product from search engines (noindex)
          </label>
        </fieldset>

        <div>
          <label className="block text-xs uppercase tracking-[0.15em] text-stone mb-2">Variants (JSON)</label>
          <textarea
            name="variantsJson"
            rows={4}
            defaultValue={product.variants.length ? JSON.stringify(product.variants, null, 2) : ""}
            placeholder='[{"title":"50ml","price":4950,"stock":10,"availableForSale":true}]'
            className="input-admin font-mono text-xs"
          />
        </div>

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
