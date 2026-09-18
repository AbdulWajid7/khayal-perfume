import Navigation from "@/components/ui/Navigation";
import Footer from "@/components/ui/Footer";
import CartDrawer from "@/components/ui/CartDrawer";
import AnnouncementBar from "@/components/ui/AnnouncementBar";
import MotionProvider from "@/components/motion/MotionProvider";
import PageTransition from "@/components/ui/PageTransition";
import NewsletterPopup from "@/components/ui/NewsletterPopup";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import OrganizationSchema from "@/components/seo/OrganizationSchema";

export default function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <MotionProvider>
      <OrganizationSchema />
      <AnnouncementBar />
      <Navigation />
      <main className="public-dark-shell">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <CartDrawer />
      <NewsletterPopup />
      <WhatsAppButton />
    </MotionProvider>
  );
}
