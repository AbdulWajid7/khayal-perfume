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

        <fieldset className="border border-border rounded-xl p-4 space-y-4">
          <legend className="px-2 text-xs uppercase tracking-[0.15em] text-stone">Fragrance Profile</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="concentration" placeholder="Concentration (e.g. Extrait de Parfum)" className="input-admin" />
            <input name="sizeMl" type="number" placeholder="Size (ml)" className="input-admin" />
            <input name="longevity" placeholder="Longevity (e.g. 8-10 hours)" className="input-admin" />
            <input name="sillage" placeholder="Sillage (e.g. Strong, Moderate)" className="input-admin" />
            <input name="occasion" placeholder="Occasion (e.g. Evening, Winter)" className="input-admin md:col-span-2" />
            <input name="scentNotesTop" placeholder="Top notes, comma separated" className="input-admin" />
            <input name="scentNotesHeart" placeholder="Heart notes, comma separated" className="input-admin" />
            <input name="scentNotesBase" placeholder="Base notes, comma separated" className="input-admin" />
            <input name="mpn" placeholder="MPN / GTIN (optional)" className="input-admin" />
          </div>
        </fieldset>

        <fieldset className="border border-border rounded-xl p-4 space-y-4">
          <legend className="px-2 text-xs uppercase tracking-[0.15em] text-stone">SEO</legend>
          <input name="metaTitle" placeholder="Meta title (50-60 chars, optional)" className="input-admin" />
          <textarea name="metaDescription" rows={2} placeholder="Meta description (140-160 chars, optional)" className="input-admin" />
          <input name="focusKeyword" placeholder="Focus keyword (e.g. oud perfume for men)" className="input-admin" />
          <input name="keywords" placeholder="Keywords, comma separated" className="input-admin" />
          <input name="ogImage" placeholder="Social share image URL (1200x630, optional)" className="input-admin" />
          <input name="canonicalUrl" placeholder="Canonical URL override (optional)" className="input-admin" />
          <label className="flex items-center gap-2 text-sm text-stone">
            <input type="checkbox" name="noIndex" className="accent-gold" />
            Hide this product from search engines (noindex)
          </label>
        </fieldset>

        <div>
          <label className="block text-xs uppercase tracking-[0.15em] text-stone mb-2">Variants (JSON, optional)</label>
          <textarea
            name="variantsJson"
            rows={4}
            placeholder='[{"title":"50ml","price":4950,"stock":10,"availableForSale":true}]'
            className="input-admin font-mono text-xs"
          />
        </div>

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
