import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how Khayal Fragrance collects, uses, and protects your personal information when you shop with us.",
};

export default function PrivacyPage() {
  return (
    <section className="py-20 md:py-28 bg-cream">
      <div className="mx-auto max-w-3xl px-4 md:px-8 lg:px-12">
        <span className="eyebrow">Legal</span>
        <h1 className="mt-3 font-serif-display text-ink text-3xl md:text-5xl font-medium tracking-tight">
          Privacy Policy
        </h1>
        <p className="mt-4 text-stone leading-relaxed">
          Last updated: August 2026
        </p>

        <div className="mt-12 space-y-10 text-stone leading-relaxed">
          <div>
            <h2 className="text-ink text-lg font-medium mb-3">1. Information We Collect</h2>
            <p>
              When you place an order or subscribe to our newsletter, we collect your name, email,
              phone number, shipping address, and payment details. We also collect technical data
              such as your IP address and browser information to improve our website.
            </p>
          </div>

          <div>
            <h2 className="text-ink text-lg font-medium mb-3">2. How We Use Your Data</h2>
            <p>
              We use your information to process and deliver orders, communicate with you about
              your purchases, send promotional emails you opted into, and improve your shopping
              experience. We do not sell your personal data to third parties.
            </p>
          </div>

          <div>
            <h2 className="text-ink text-lg font-medium mb-3">3. Cookies</h2>
            <p>
              Khayalparfum.com uses cookies to remember your cart, preferences, and session. You
              can disable cookies in your browser, but some features of the site may not work
              correctly.
            </p>
          </div>

          <div>
            <h2 className="text-ink text-lg font-medium mb-3">4. Third-Party Services</h2>
            <p>
              We use trusted payment processors and courier partners to fulfill your orders. These
              providers only receive the information necessary to complete their services.
            </p>
          </div>

          <div>
            <h2 className="text-ink text-lg font-medium mb-3">5. Your Rights</h2>
            <p>
              You can request access to, correction of, or deletion of your personal data by
              contacting us at official@khayalparfum.com.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
