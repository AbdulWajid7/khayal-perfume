import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Shipping, Returns & Exchanges | Khayal Fragrance",
  description:
    "Delivery times, free-shipping eligibility, tester-based return requests, and exchange policy for KHAYAL fragrance orders in Pakistan.",
};

export default function ShippingPage() {
  return (
    <section className="py-20 md:py-28 bg-cream">
      <div className="mx-auto max-w-3xl px-4 md:px-8 lg:px-12">
        <span className="eyebrow">Support</span>
        <h1 className="mt-3 font-serif-display text-ink text-3xl md:text-5xl font-medium tracking-tight">
          Shipping, Returns & Exchanges
        </h1>
        <p className="mt-4 text-stone leading-relaxed">
          Delivery and return information for KHAYAL orders across Pakistan.
        </p>

        <div className="mt-12 space-y-10 text-stone leading-relaxed">
          <div>
            <h2 className="text-ink text-lg font-medium mb-3">Delivery Times</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Karachi: expected delivery within 24 hours after order confirmation.</li>
              <li>Other cities in Pakistan: expected delivery within 3–4 working days after order confirmation.</li>
            </ul>
            <p className="mt-3">
              Delivery times may be affected by public holidays, weather, courier delays or remote-area service availability.
            </p>
          </div>

          <div>
            <h2 className="text-ink text-lg font-medium mb-3">Free Delivery</h2>
            <p>Free delivery across Pakistan on orders of PKR {siteConfig.freeShippingThreshold.toLocaleString("en-PK")} or more.</p>
          </div>

          <div>
            <h2 className="text-ink text-lg font-medium mb-3">Tester & Return Requests</h2>
            <p>
              Every KHAYAL fragrance order includes a separate tester, allowing you to experience the fragrance without opening the sealed full-size bottle.
            </p>
            <p className="mt-3">
              If the fragrance is not suitable, contact KHAYAL on the same day of delivery. The full-size fragrance must remain completely unopened, unused and in its original sealed packaging to qualify for a return request.
            </p>
            <p className="mt-3">
              Opened, used or unsealed full-size bottles cannot be returned for fragrance preference reasons. All requests are reviewed before eligibility is confirmed; submitting a request does not guarantee an automatic refund.
            </p>
          </div>

          <div>
            <h2 className="text-ink text-lg font-medium mb-3">Incorrect or Damaged Orders</h2>
            <p>
              If you receive an incorrect or damaged product, notify KHAYAL within 24 hours of delivery and provide clear photographs or an unboxing video. After verification, KHAYAL will arrange the appropriate exchange.
            </p>
          </div>

          <div>
            <h2 className="text-ink text-lg font-medium mb-3">Contact</h2>
            <p>
              Email {siteConfig.email} or contact us on WhatsApp at {siteConfig.phoneDisplay} for delivery, return or exchange assistance.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
