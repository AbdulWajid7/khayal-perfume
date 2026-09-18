export const dynamic = "force-dynamic";

import HeroSection from "@/components/sections/HeroSection";
import CampaignBanner from "@/components/sections/CampaignBanner";
import CategoryGrid from "@/components/sections/CategoryGrid";
import FeaturedProduct from "@/components/sections/FeaturedProduct";
import BestSellers from "@/components/sections/BestSellers";
import MemoryStory from "@/components/sections/MemoryStory";
import TrustSection from "@/components/sections/TrustSection";
import JournalPreview from "@/components/sections/JournalPreview";
import ScentFinderCTA from "@/components/sections/ScentFinderCTA";
import { homepageCampaign } from "@/lib/campaign";
import { getProducts, getBestsellerProducts } from "@/lib/products";
import { getLatestPosts } from "@/lib/blog";

export default async function HomePage() {
  const [products, posts, bestsellers] = await Promise.all([
    getProducts(),
    getLatestPosts(3),
    getBestsellerProducts(),
  ]);
  const featured = bestsellers[0] || products[0];

  return (
    <>
      <HeroSection />
      <CampaignBanner campaign={homepageCampaign} />
      <CategoryGrid />
      {featured && <FeaturedProduct product={featured} />}
      {bestsellers.length > 1 && <BestSellers products={bestsellers} />}
      <MemoryStory />
      <TrustSection />
      {posts.length > 0 && <JournalPreview posts={posts} />}
      <ScentFinderCTA />
    </>
  );
}
