import Navigation from "@/components/ui/Navigation";
import Footer from "@/components/ui/Footer";
import CartDrawer from "@/components/ui/CartDrawer";
import AnnouncementBar from "@/components/ui/AnnouncementBar";
import SmoothScrollProvider from "@/components/ui/SmoothScrollProvider";
import PageTransition from "@/components/ui/PageTransition";
import NewsletterPopup from "@/components/ui/NewsletterPopup";

export default function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SmoothScrollProvider>
      <AnnouncementBar />
      <Navigation />
      <main>
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <CartDrawer />
      <NewsletterPopup />
    </SmoothScrollProvider>
  );
}
