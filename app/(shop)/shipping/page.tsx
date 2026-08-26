import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping & Returns | Khayal Parfum",
  description:
    "Shipping times, delivery charges, and return policy for Khayal Parfum orders in Pakistan.",
};

export default function ShippingPage() {
  return (
    <section className="py-20 md:py-28 bg-cream">
      <div className="mx-auto max-w-3xl px-4 md:px-8 lg:px-12">
        <span className="eyebrow">Support</span>
        <h1 className="mt-3 font-serif-display text-ink text-3xl md:text-5xl font-medium tracking-tight">
          Shipping & Returns
        </h1>
        <p className="mt-4 text-stone leading-relaxed">
          Everything you need to know about delivery and returns for your Khayal order.
        </p>

        <div className="mt-12 space-y-10 text-stone leading-relaxed">
          <div>
            <h2 className="text-ink text-lg font-medium mb-3">Shipping in Pakistan</h2>
            <p>
              We deliver to all major cities including Karachi, Lahore, Islamabad, Rawalpindi,
              Faisalabad, Multan, Peshawar, and Quetta, as well as smaller towns through our courier
              partners. Orders are usually dispatched within 1–2 business days.
            </p>
          </div>

          <div>
            <h2 className="text-ink text-lg font-medium mb-3">Delivery Times</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Karachi, Lahore, Islamabad, Rawalpindi: 2–4 business days</li>
              <li>Other major cities: 3–6 business days</li>
              <li>Remote areas: 5–10 business days</li>
            </ul>
          </div>

          <div>
            <h2 className="text-ink text-lg font-medium mb-3">Shipping Costs</h2>
            <p>
              Shipping is calculated at checkout based on your delivery city and order weight. Free
              shipping may be offered on promotional orders or above a minimum threshold.
            </p>
          </div>

          <div>
            <h2 className="text-ink text-lg font-medium mb-3">International Orders</h2>
            <p>
              Currently, we ship within Pakistan. International shipping will be introduced soon.
              Subscribe to our newsletter to be the first to know.
            </p>
          </div>

          <div>
            <h2 className="text-ink text-lg font-medium mb-3">Returns</h2>
            <p>
              If your order arrives damaged, leaking, or incorrect, please contact us at
              official@khayalparfum.com within 7 days of delivery with photos. We will arrange a
              replacement or refund. Opened fragrances cannot be returned unless defective.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
