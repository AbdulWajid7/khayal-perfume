import type { MetadataRoute } from "next";

export const dynamic = 'force-dynamic';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: "*", disallow: "/api/" },
    ],
    sitemap: "https://www.khayalparfum.com/sitemap.xml",
  };
}
