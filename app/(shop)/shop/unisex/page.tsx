import type { Metadata } from "next";
import CategoryLanding, { CATEGORY_META } from "@/components/shop/CategoryLanding";
import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

const meta = CATEGORY_META.unisex;

export const metadata: Metadata = {
  title: meta.metaTitle,
  description: meta.description,
  openGraph: {
    title: `${meta.metaTitle} · KHAYAL`,
    description: meta.description,
    url: `${siteConfig.url}/shop/unisex`,
  },
  alternates: { canonical: `${siteConfig.url}/shop/unisex` },
};

export default function UnisexCategoryPage() {
  return <CategoryLanding category="unisex" />;
}
