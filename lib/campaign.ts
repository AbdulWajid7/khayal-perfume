export type Campaign = {
  id: string;
  active: boolean;
  eyebrow: string;
  title: string;
  subtitle: string;
  desktopImage: string;
  mobileImage: string;
  primaryCta: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  startsAt?: string;
  endsAt?: string;
  backgroundColor?: string;
  textAlign?: "left" | "center";
};

export const homepageCampaign: Campaign = {
  id: "khayal-introduction",
  active: true,
  eyebrow: "The Khayal Introduction",
  title: "A Fragrance Becomes a Memory",
  subtitle: "Discover fragrances created for the moments, moods and memories that stay with you.",
  desktopImage: "/images/homepage.png",
  mobileImage: "/images/homepage.png",
  primaryCta: { label: "Explore the Collection", href: "/shop" },
  secondaryCta: { label: "Find Your Fragrance", href: "/scent-finder" },
  backgroundColor: "#100b16",
  textAlign: "left",
};

export function isCampaignActive(campaign: Campaign, now = new Date()): boolean {
  if (!campaign.active) return false;
  if (campaign.startsAt && now < new Date(campaign.startsAt)) return false;
  if (campaign.endsAt && now >= new Date(campaign.endsAt)) return false;
  return true;
}
