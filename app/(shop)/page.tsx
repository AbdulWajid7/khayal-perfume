export const dynamic = "force-dynamic";

import KhayalExperience from "@/components/sections/KhayalExperience";
import PressStrip from "@/components/sections/PressStrip";
import CategoryGrid from "@/components/sections/CategoryGrid";
import JournalPreview from "@/components/sections/JournalPreview";
import ScentFinderCTA from "@/components/sections/ScentFinderCTA";
import { getBestsellerProducts, getProducts } from "@/lib/products";
import { getLatestPosts } from "@/lib/blog";

export default async function HomePage() {
  const [posts, bestsellers] = await Promise.all([
    getLatestPosts(3),
    getBestsellerProducts(),
  ]);

  // The 3D collection shows three products: bestsellers first, then other active products.
  let featured = bestsellers;
  if (featured.length < 3) {
    const all = await getProducts();
    const seen = new Set(featured.map((p) => p.id));
    featured = [...featured, ...all.filter((p) => !seen.has(p.id))].slice(0, 3);
  }

  return (
    <>
      <KhayalExperience products={featured} />
      <PressStrip />
      <CategoryGrid />
      {posts.length > 0 && <JournalPreview posts={posts} />}
      <ScentFinderCTA />
    </>
  );
}
