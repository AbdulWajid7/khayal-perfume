import { siteConfig } from "@/lib/site-config";

export default function AnnouncementBar() {
  return (
    <div className="fixed inset-x-0 top-0 z-[51] flex h-8 items-center justify-center border-b border-white/10 bg-purple-deep px-4 text-center text-[9px] font-medium uppercase tracking-[0.16em] text-ivory/75 sm:text-[10px] sm:tracking-[0.22em]">
      Free delivery across Pakistan on PKR {siteConfig.freeShippingThreshold.toLocaleString("en-PK")}+
      <span className="mx-2 text-champagne" aria-hidden="true">·</span>
      Karachi delivery within 24 hours
    </div>
  );
}
