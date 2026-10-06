import type { Metadata } from "next";
import CategoryLanding, { CATEGORY_META } from "@/components/shop/CategoryLanding";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

const meta = CATEGORY_META.women;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  openGraph: {
    title: `${meta.title} | Khayal Fragrance`,
    description: meta.description,
    url: `${siteConfig.url}/shop/women`,
  },
  alternates: { canonical: `${siteConfig.url}/shop/women` },
};

export default function WomenCategoryPage() {
  return <CategoryLanding category="women" />;
}
