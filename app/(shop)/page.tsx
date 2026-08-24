import JournalPreview from "@/components/sections/JournalPreview";
import ScentFinderCTA from "@/components/sections/ScentFinderCTA";
import { getProducts } from "@/lib/shopify";
import { getLatestPosts } from "@/lib/blog";

export default async function HomePage() {
  const [products, posts] = await Promise.all([getProducts(), getLatestPosts(3)]);

  return (
    <>
      <JournalPreview posts={posts} />
      <ScentFinderCTA />
    </>
  );
}
