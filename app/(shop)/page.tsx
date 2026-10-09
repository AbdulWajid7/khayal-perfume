export const dynamic = "force-dynamic";

import KhayalExperience from "@/components/sections/KhayalExperience";
import PressStrip from "@/components/sections/PressStrip";
import CategoryGrid from "@/components/sections/CategoryGrid";
import JournalPreview from "@/components/sections/JournalPreview";
import ScentFinderCTA from "@/components/sections/ScentFinderCTA";
import { getBestsellerProducts, getProducts, getTopSellingProducts } from "@/lib/products";
import { getLatestPosts } from "@/lib/blog";

export default async function HomePage() {
  const [posts, bestsellers, topSellers] = await Promise.all([
    getLatestPosts(3),
    getBestsellerProducts(),
    getTopSellingProducts(5),
  ]);

  // The hero slider uses up to six products: bestsellers first, then other active products.
  let featured = bestsellers.slice(0, 6);
  if (featured.length < 6) {
    const all = await getProducts();
    const seen = new Set(featured.map((p) => p.id));
    featured = [...featured, ...all.filter((p) => !seen.has(p.id))].slice(0, 6);
  }

  return (
    <>
      <KhayalExperience products={featured} topSellers={topSellers} />
      <PressStrip />
      <CategoryGrid />
      {posts.length > 0 && <JournalPreview posts={posts} />}
      <ScentFinderCTA />
    </>
  );
}
