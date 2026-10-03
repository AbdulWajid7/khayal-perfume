export default function OrganizationSchema() {
  const baseUrl = "https://www.khayalparfum.com";

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        name: "Khayal Fragrance",
        url: baseUrl,
        logo: {
          "@type": "ImageObject",
          url: `${baseUrl}/logo.png`,
        },
        description:
          "Khayal Fragrance is a luxury niche fragrance house crafting long-lasting oud, musk, and attar perfumes in Pakistan.",
        email: "official@khayalparfum.com",
        telephone: "+923202704617",
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          email: "official@khayalparfum.com",
          areaServed: "PK",
          availableLanguage: ["en", "ur"],
        },
      },
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        url: baseUrl,
        name: "Khayal Fragrance",
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
