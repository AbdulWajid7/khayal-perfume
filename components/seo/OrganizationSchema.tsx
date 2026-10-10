import { siteConfig } from "@/lib/site-config";

export default function OrganizationSchema() {
  const baseUrl = siteConfig.url;
  const { business, social } = siteConfig;

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        name: business.name,
        url: baseUrl,
        logo: {
          "@type": "ImageObject",
          url: `${baseUrl}/logo.png`,
        },
        description:
          "KHAYAL is a Karachi fragrance brand making long-lasting eau de parfums for men and women, delivered across Pakistan with cash on delivery.",
        email: siteConfig.email,
        telephone: siteConfig.phoneDisplay.replace(/\s/g, ""),
        sameAs: [social.instagram, social.facebook, social.tiktok],
        address: {
          "@type": "PostalAddress",
          addressLocality: business.locality,
          addressRegion: business.region,
          addressCountry: business.country,
        },
        areaServed: {
          "@type": "Country",
          name: business.areaServed,
        },
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          email: siteConfig.email,
          telephone: siteConfig.phoneDisplay.replace(/\s/g, ""),
          areaServed: business.country,
          availableLanguage: business.languages,
        },
      },
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        url: baseUrl,
        name: business.name,
        publisher: { "@id": `${baseUrl}/#organization` },
        inLanguage: "en-PK",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
