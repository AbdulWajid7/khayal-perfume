import type { Metadata } from "next";
import LegalPage from "@/components/ui/LegalPage";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Shipping, Returns & Exchanges | Khayal Fragrance",
  description:
    "Delivery times, free-shipping eligibility, tester-based return requests, and exchange policy for KHAYAL fragrance orders in Pakistan.",
};

export default function ShippingPage() {
  return (
    <LegalPage
      eyebrow="Support"
      title="Shipping, returns &"
      accent="exchanges"
      intro="Delivery and return information for KHAYAL orders across Pakistan."
      sections={[
        {
          id: "delivery-times",
          title: "Delivery Times",
          body: (
            <>
              <ul>
                <li>
                  Karachi: expected delivery within 24 hours after order
                  confirmation.
                </li>
                <li>
                  Other cities in Pakistan: expected delivery within 3–4 working
                  days after order confirmation.
                </li>
              </ul>
              <p>
                Delivery times may be affected by public holidays, weather,
                courier delays or remote-area service availability.
              </p>
            </>
          ),
        },
        {
          id: "free-delivery",
          title: "Free Delivery",
          body: (
            <>
              <p>
                Free delivery across Pakistan on orders of PKR{" "}
                {siteConfig.freeShippingThreshold.toLocaleString("en-PK")} or
                more.
              </p>
            </>
          ),
        },
        {
          id: "tester-return-requests",
          title: "Tester & Return Requests",
          body: (
            <>
              <p>
                Every KHAYAL fragrance order includes a separate tester,
                allowing you to experience the fragrance without opening the
                sealed full-size bottle.
              </p>
              <p>
                If the fragrance is not suitable, contact KHAYAL on the same day
                of delivery. The full-size fragrance must remain completely
                unopened, unused and in its original sealed packaging to qualify
                for a return request.
              </p>
              <p>
                Opened, used or unsealed full-size bottles cannot be returned
                for fragrance preference reasons. All requests are reviewed
                before eligibility is confirmed; submitting a request does not
                guarantee an automatic refund.
              </p>
            </>
          ),
        },
        {
          id: "incorrect-or-damaged-orders",
          title: "Incorrect or Damaged Orders",
          body: (
            <>
              <p>
                If you receive an incorrect or damaged product, notify KHAYAL
                within 24 hours of delivery and provide clear photographs or an
                unboxing video. After verification, KHAYAL will arrange the
                appropriate exchange.
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
                Email {siteConfig.email} or contact us on WhatsApp at{" "}
                {siteConfig.phoneDisplay} for delivery, return or exchange
                assistance.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
