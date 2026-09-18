export const dynamic = "force-dynamic";

import HeroSection from "@/components/sections/HeroSection";
import PressStrip from "@/components/sections/PressStrip";
import CategoryGrid from "@/components/sections/CategoryGrid";
import BestSellers from "@/components/sections/BestSellers";
import BrandStoryTeaser from "@/components/sections/BrandStoryTeaser";
import JournalPreview from "@/components/sections/JournalPreview";
import ScentFinderCTA from "@/components/sections/ScentFinderCTA";
import { getBestsellerProducts } from "@/lib/products";
import { getLatestPosts } from "@/lib/blog";

export default async function HomePage() {
  const [posts, bestsellers] = await Promise.all([
    getLatestPosts(3),
    getBestsellerProducts(),
  ]);

  return (
    <>
      <HeroSection />
      <PressStrip />
      <CategoryGrid />
      {bestsellers.length > 0 && <BestSellers products={bestsellers} />}
      <BrandStoryTeaser />
      {posts.length > 0 && <JournalPreview posts={posts} />}
      <ScentFinderCTA />
    </>
  );
}
