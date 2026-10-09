import type { Metadata } from "next";
import LegalPage from "@/components/ui/LegalPage";

export const metadata: Metadata = {
  title: "Terms & Conditions | Khayal Fragrance",
  description:
    "The terms and conditions for using Khayal Fragrance's website and purchasing our products.",
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms &"
      accent="conditions"
      intro="The terms for using khayalparfum.com and purchasing Khayal products."
      meta="Last updated August 2026"
      sections={[
        {
          id: "introduction",
          title: "Introduction",
          body: (
            <>
              <p>
                These terms govern your use of khayalparfum.com and the purchase
                of products from Khayal Fragrance. By placing an order or
                browsing the site, you agree to these terms.
              </p>
            </>
          ),
        },
        {
          id: "orders-payment",
          title: "Orders & Payment",
          body: (
            <>
              <p>
                All orders are subject to product availability and order
                confirmation. Prices are in Pakistani Rupees and include
                applicable local taxes. Payment must be completed before
                shipment.
              </p>
            </>
          ),
        },
        {
          id: "shipping-delivery",
          title: "Shipping & Delivery",
          body: (
            <>
              <p>
                Karachi orders are expected within 24 hours after confirmation;
                other cities in Pakistan are expected within 3–4 working days.
                Delivery times may be affected by public holidays, weather,
                courier delays or remote-area service availability. Delivery is
                free on orders of PKR 5,000 or more.
              </p>
            </>
          ),
        },
        {
          id: "returns-refunds",
          title: "Returns & Refunds",
          body: (
            <>
              <p>
                Every fragrance order includes a separate tester. For fragrance
                preference requests, contact KHAYAL on the delivery day while
                the full-size bottle remains unopened, unused and sealed.
                Incorrect or damaged products must be reported within 24 hours
                with clear photographs or an unboxing video. After verification,
                KHAYAL will arrange the appropriate exchange. Opened, used or
                unsealed full-size bottles cannot be returned for preference
                reasons, and no refund is automatic before eligibility is
                verified.
              </p>
            </>
          ),
        },
        {
          id: "intellectual-property",
          title: "Intellectual Property",
          body: (
            <>
              <p>
                All content, designs, product names, logos, and images on this
                site are the property of Khayal Fragrance. You may not use them
                for commercial purposes without written permission.
              </p>
            </>
          ),
        },
        {
          id: "contact",
          title: "Contact",
          body: (
            <>
              <p>
                For questions about these terms, email us at
                official@khayalparfum.com.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
