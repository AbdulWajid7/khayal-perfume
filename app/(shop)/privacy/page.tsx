import type { Metadata } from "next";
import LegalPage from "@/components/ui/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy | Khayal Fragrance",
  description:
    "Learn how Khayal Fragrance collects, uses, and protects your personal information when you shop with us.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy"
      accent="policy"
      intro="How Khayal Fragrance collects, uses and protects your personal information."
      meta="Last updated August 2026"
      sections={[
        {
          id: "information-we-collect",
          title: "Information We Collect",
          body: (
            <>
              <p>
                When you place an order or subscribe to our newsletter, we
                collect your name, email, phone number, shipping address, and
                payment details. We also collect technical data such as your IP
                address and browser information to improve our website.
              </p>
            </>
          ),
        },
        {
          id: "how-we-use-your-data",
          title: "How We Use Your Data",
          body: (
            <>
              <p>
                We use your information to process and deliver orders,
                communicate with you about your purchases, send promotional
                emails you opted into, and improve your shopping experience. We
                do not sell your personal data to third parties.
              </p>
            </>
          ),
        },
        {
          id: "cookies",
          title: "Cookies",
          body: (
            <>
              <p>
                Khayalparfum.com uses cookies to remember your cart,
                preferences, and session. You can disable cookies in your
                browser, but some features of the site may not work correctly.
              </p>
            </>
          ),
        },
        {
          id: "third-party-services",
          title: "Third-Party Services",
          body: (
            <>
              <p>
                We use trusted payment processors and courier partners to
                fulfill your orders. These providers only receive the
                information necessary to complete their services.
              </p>
            </>
          ),
        },
        {
          id: "your-rights",
          title: "Your Rights",
          body: (
            <>
              <p>
                You can request access to, correction of, or deletion of your
                personal data by contacting us at official@khayalparfum.com.
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
