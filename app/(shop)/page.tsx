export const dynamic = "force-dynamic";

import HeroSlider from "@/components/home/HeroSlider";
import CollectionRail from "@/components/home/CollectionRail";
import {
  NameMarquee,
  Signatures,
  Occasions,
  TesterRitual,
  Ingredients,
  HouseStory,
  FinderBand,
} from "@/components/home/HomeSections";
import JournalPreview from "@/components/sections/JournalPreview";
import { getProducts } from "@/lib/products";
import { getLatestPosts } from "@/lib/blog";
import { getWhatsAppUrl, siteConfig } from "@/lib/site-config";

export default async function HomePage() {
  const [posts, products] = await Promise.all([getLatestPosts(3), getProducts()]);
  const activeHandles = products.map((p) => p.handle);
  const whatsappHref = getWhatsAppUrl(
    `Assalamualaikum, I need help choosing a KHAYAL fragrance. ${siteConfig.url}`,
  );

  return (
    <>
      <HeroSlider activeHandles={activeHandles} />
      <NameMarquee />
      <Signatures activeHandles={activeHandles} />
      <CollectionRail products={products} />
      <TesterRitual />
      <Occasions />
      <Ingredients />
      <HouseStory />
      {posts.length > 0 && <JournalPreview posts={posts} />}
      <FinderBand whatsappHref={whatsappHref} />
    </>
  );
}
