export const dynamic = "force-dynamic";

import HeroSection from "@/components/sections/HeroSection";
import PressStrip from "@/components/sections/PressStrip";
import CategoryGrid from "@/components/sections/CategoryGrid";
import BestSellers from "@/components/sections/BestSellers";
import FeaturedCollection from "@/components/sections/FeaturedCollection";
import BrandStoryTeaser from "@/components/sections/BrandStoryTeaser";
import IngredientsGallery from "@/components/sections/IngredientsGallery";
import JournalPreview from "@/components/sections/JournalPreview";
import Testimonials from "@/components/sections/Testimonials";
import ScentFinderCTA from "@/components/sections/ScentFinderCTA";
import { getProducts, getBestsellerProducts } from "@/lib/products";
import { getLatestPosts } from "@/lib/blog";

export default async function HomePage() {
  const [products, posts, bestsellers] = await Promise.all([
    getProducts(),
    getLatestPosts(3),
    getBestsellerProducts(),
  ]);

  return (
    <>
      <HeroSection />
      <PressStrip />
      <CategoryGrid />
      <BestSellers products={bestsellers} />
      <FeaturedCollection products={products} />
      <BrandStoryTeaser />
      <IngredientsGallery />
      <Testimonials />
      <JournalPreview posts={posts} />
      <ScentFinderCTA />
    </>
  );
}
