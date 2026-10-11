import type { Metadata } from "next";

// The wishlist lives in the visitor's browser, so it has nothing for search engines to index.
export const metadata: Metadata = {
  title: "Your Wishlist",
  description: "Fragrances you saved for later.",
  robots: { index: false, follow: true },
};

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return children;
}
