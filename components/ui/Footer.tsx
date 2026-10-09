import Link from "next/link";
import Image from "next/image";
import NewsletterForm from "./NewsletterForm";
import SocialIcons from "./SocialIcons";
import TrackedContactLink from "./TrackedContactLink";
import { siteConfig } from "@/lib/site-config";

const shopLinks = [
  { label: "The Collection", href: "/shop" },
  { label: "For Men", href: "/shop/men" },
  { label: "For Women", href: "/shop/women" },
  { label: "Unisex", href: "/shop/unisex" },
];

const companyLinks = [
  { label: "Our Story", href: "/story" },
  { label: "Journal", href: "/journal" },
  { label: "Scent Finder", href: "/scent-finder" },
];

const supportLinks = [
  { label: "Shipping & Returns", href: "/shipping" },
  { label: "FAQ", href: "/faq" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

export default function Footer() {
  return (
    <footer className="bg-cream-dark border-t border-border">
      <div className="relative overflow-hidden border-b border-border">
        <div className="hero-mist" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl px-4 md:px-8 lg:px-12 py-16 md:py-20 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div>
            <p className="flex items-center gap-4 text-[11px] tracking-[0.32em] uppercase text-gold font-medium before:block before:h-px before:w-10 before:bg-gold">
              Newsletter
            </p>
            <h2 className="mt-4 font-serif-display text-ink text-4xl md:text-5xl font-medium tracking-tight">
              Join the Khayal <span className="text-gold-shimmer italic">Circle</span>
            </h2>
            <p className="mt-3 text-stone max-w-md">
              New fragrances, scent stories, and early access to limited releases.
            </p>
          </div>
          <div className="w-full lg:w-auto lg:min-w-[440px]">
            <NewsletterForm />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative h-12 w-12 rounded-full overflow-hidden shadow-md">
                <Image
                  src="/logo.png"
                  alt="Khayal Fragrance"
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
              <span className="text-ink text-sm font-medium tracking-[0.2em] uppercase">
                Khayal
              </span>
            </Link>
            <p className="mt-4 text-sm text-stone leading-relaxed max-w-sm">
              Some fragrances become memories. Premium perfumes and attars crafted in Karachi and delivered across Pakistan.
            </p>
            <div className="mt-4 flex flex-col gap-1 text-sm">
              <TrackedContactLink href={`mailto:${siteConfig.email}`} event="email_click" className="text-stone hover:text-gold">
                {siteConfig.email}
              </TrackedContactLink>
              <TrackedContactLink href={`tel:+${siteConfig.whatsappNumber}`} event="phone_click" className="text-stone hover:text-gold">
                {siteConfig.phoneDisplay}
              </TrackedContactLink>
            </div>
            <div className="mt-6">
              <SocialIcons />
            </div>
          </div>

          <div>
            <h3 className="text-gold text-[11px] font-medium tracking-[0.28em] uppercase mb-5">
              Shop
            </h3>
            <ul className="space-y-3">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="link-hover-gold text-stone text-sm hover:text-ink transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-gold text-[11px] font-medium tracking-[0.28em] uppercase mb-5">
              Company
            </h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="link-hover-gold text-stone text-sm hover:text-ink transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-gold text-[11px] font-medium tracking-[0.28em] uppercase mb-5">
              Support
            </h3>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="link-hover-gold text-stone text-sm hover:text-ink transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-stone text-xs">
            © 2026 Khayal. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-stone text-xs hover:text-gold transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-stone text-xs hover:text-gold transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
