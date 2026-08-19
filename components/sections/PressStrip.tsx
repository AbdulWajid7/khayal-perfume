import Reveal from "@/components/ui/Reveal";

const trustPoints = [
  { label: "Free Shipping", detail: "On orders above ₹15,000" },
  { label: "Secure Checkout", detail: "Encrypted payments" },
  { label: "Authentic Guarantee", detail: "100% genuine ingredients" },
  { label: "Small-Batch Craft", detail: "Hand-poured in India" },
];

export default function PressStrip() {
  return (
    <section className="border-y border-border-subtle bg-charcoal">
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12 py-10">
        <Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {trustPoints.map((point) => (
              <div key={point.label} className="text-center md:text-left">
                <p className="text-parchment text-sm font-medium tracking-wide">
                  {point.label}
                </p>
                <p className="mt-1 text-warm-taupe text-xs">{point.detail}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
