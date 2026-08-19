import Link from "next/link";
import NewsletterForm from "./NewsletterForm";
import SocialIcons from "./SocialIcons";

const shopLinks = [
  { label: "The Collection", href: "/shop" },
  { label: "Oud", href: "/shop?category=oud" },
  { label: "Musk", href: "/shop?category=musk" },
  { label: "Floral", href: "/shop?category=floral" },
];

const companyLinks = [
  { label: "Our Story", href: "/story" },
  { label: "Journal", href: "/journal" },
  { label: "Scent Finder", href: "/scent-finder" },
  { label: "Contact", href: "mailto:official@khayalparfum.com" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-midnight">
      <div className="border-b border-border-subtle">
        <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12 py-14 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h2 className="text-parchment text-2xl font-medium tracking-[0.02em]">
              Join the Khayal Circle
            </h2>
            <p className="mt-2 text-warm-taupe text-sm max-w-md">
              New fragrances, scent stories, and early access to limited releases.
            </p>
          </div>
          <div className="w-full lg:w-auto lg:min-w-[380px]">
            <NewsletterForm />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          <div>
            <Link
              href="/"
              className="text-parchment text-base font-medium tracking-[4px] uppercase"
            >
              KHAYAL
            </Link>
            <p className="mt-4 text-sm text-warm-taupe leading-relaxed max-w-xs">
              Luxury niche perfumes and attars, crafted for those who seek the extraordinary.
            </p>
          </div>

          <div>
            <h3 className="text-parchment text-sm font-medium tracking-wide uppercase mb-4">
              Shop
            </h3>
            <ul className="space-y-3">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-warm-taupe text-sm hover:text-oud-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-parchment text-sm font-medium tracking-wide uppercase mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-warm-taupe text-sm hover:text-oud-gold transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-parchment text-sm font-medium tracking-wide uppercase mb-4">
              Connect
            </h3>
            <ul className="space-y-3 mb-5">
              <li>
                <Link
                  href="mailto:official@khayalparfum.com"
                  className="text-warm-taupe text-sm hover:text-oud-gold transition-colors"
                >
                  official@khayalparfum.com
                </Link>
              </li>
            </ul>
            <SocialIcons />
          </div>
        </div>
      </div>

      <div className="border-t border-border-subtle">
        <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-warm-taupe text-xs">
            © 2026 Khayal. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-warm-taupe text-xs hover:text-oud-gold transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-warm-taupe text-xs hover:text-oud-gold transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
