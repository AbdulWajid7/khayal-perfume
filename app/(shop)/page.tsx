import HeroSection from "@/components/sections/HeroSection";
import PressStrip from "@/components/sections/PressStrip";
import FeaturedCollection from "@/components/sections/FeaturedCollection";
import BrandStoryTeaser from "@/components/sections/BrandStoryTeaser";
import IngredientsGallery from "@/components/sections/IngredientsGallery";
import JournalPreview from "@/components/sections/JournalPreview";
import ScentFinderCTA from "@/components/sections/ScentFinderCTA";
import { getProducts } from "@/lib/shopify";
import { getLatestPosts } from "@/lib/sanity";

export default async function HomePage() {
  const [products, posts] = await Promise.all([getProducts(), getLatestPosts(3)]);

  return (
    <>
      <HeroSection />
      <PressStrip />
      <FeaturedCollection products={products} />
      <BrandStoryTeaser />
      <IngredientsGallery />
      <JournalPreview posts={posts} />
      <ScentFinderCTA />
    </>
  );
}
