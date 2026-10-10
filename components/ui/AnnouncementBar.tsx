import { siteConfig } from "@/lib/site-config";

const messages = [
  "Cash on delivery across Pakistan",
  `Free delivery over PKR ${siteConfig.freeShippingThreshold.toLocaleString("en-PK")}`,
  "A tester with every bottle",
  "Karachi delivery in 24 hours",
];

export default function AnnouncementBar() {
  const loop = [...messages, ...messages];

  return (
    <div className="fixed top-0 left-0 right-0 z-[51] h-8 bg-aubergine overflow-hidden">
      <div className="flex h-full items-center whitespace-nowrap animate-marquee">
        {loop.map((message, index) => (
          <span
            key={`${message}-${index}`}
            className="text-cream text-[11px] font-medium tracking-[0.18em] uppercase px-10"
          >
            <span className="text-gold-pale mr-2" aria-hidden="true">✦</span>
            {message}
          </span>
        ))}
      </div>
    </div>
  );
}
