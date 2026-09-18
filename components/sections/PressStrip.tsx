import Reveal from "@/components/ui/Reveal";
import { siteConfig } from "@/lib/site-config";

const trustPoints = [
  { label: "Free Shipping", detail: `On orders of PKR ${siteConfig.freeShippingThreshold.toLocaleString("en-PK")} or more` },
  { label: "Secure Checkout", detail: "Encrypted payments" },
  { label: "Nationwide Delivery", detail: "All across Pakistan" },
  { label: "Crafted in Karachi", detail: "Founded by Abdul Wajid" },
];

export default function PressStrip() {
  return (
    <section className="border-y border-border bg-cream-dark">
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12 py-10">
        <Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {trustPoints.map((point) => (
              <div key={point.label} className="text-center md:text-left">
                <p className="text-ink text-sm font-medium tracking-wide">
                  {point.label}
                </p>
                <p className="mt-1 text-stone text-xs">{point.detail}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
