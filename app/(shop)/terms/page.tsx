import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | Khayal Parfum",
  description:
    "The terms and conditions for using Khayal Parfum's website and purchasing our products.",
};

export default function TermsPage() {
  return (
    <section className="py-20 md:py-28 bg-cream">
      <div className="mx-auto max-w-3xl px-4 md:px-8 lg:px-12">
        <span className="eyebrow">Legal</span>
        <h1 className="mt-3 font-serif-display text-ink text-3xl md:text-5xl font-medium tracking-tight">
          Terms & Conditions
        </h1>
        <p className="mt-4 text-stone leading-relaxed">
          Last updated: August 2026
        </p>

        <div className="mt-12 space-y-10 text-stone leading-relaxed">
          <div>
            <h2 className="text-ink text-lg font-medium mb-3">1. Introduction</h2>
            <p>
              These terms govern your use of khayalparfum.com and the purchase of products from
              Khayal Parfum. By placing an order or browsing the site, you agree to these terms.
            </p>
          </div>

          <div>
            <h2 className="text-ink text-lg font-medium mb-3">2. Orders & Payment</h2>
            <p>
              All orders are subject to product availability and order confirmation. Prices are in
              Pakistani Rupees and include applicable local taxes. Payment must be completed before
              shipment.
            </p>
          </div>

          <div>
            <h2 className="text-ink text-lg font-medium mb-3">3. Shipping & Delivery</h2>
            <p>
              Karachi orders are expected within 24 hours after confirmation; other cities in Pakistan are expected within 3–4 working days. Delivery times may be affected by public holidays, weather, courier delays or remote-area service availability. Delivery is free on orders of PKR 5,000 or more.
            </p>
          </div>

          <div>
            <h2 className="text-ink text-lg font-medium mb-3">4. Returns & Refunds</h2>
            <p>
              Every fragrance order includes a separate tester. For fragrance preference requests, contact KHAYAL on the delivery day while the full-size bottle remains unopened, unused and sealed. Incorrect or damaged products must be reported within 24 hours with clear photographs or an unboxing video. After verification, KHAYAL will arrange the appropriate exchange. Opened, used or unsealed full-size bottles cannot be returned for preference reasons, and no refund is automatic before eligibility is verified.
            </p>
          </div>

          <div>
            <h2 className="text-ink text-lg font-medium mb-3">5. Intellectual Property</h2>
            <p>
              All content, designs, product names, logos, and images on this site are the property of
              Khayal Parfum. You may not use them for commercial purposes without written permission.
            </p>
          </div>

          <div>
            <h2 className="text-ink text-lg font-medium mb-3">6. Contact</h2>
            <p>
              For questions about these terms, email us at official@khayalparfum.com.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
