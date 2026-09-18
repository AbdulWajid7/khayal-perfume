import Link from "next/link";
import Reveal from "@/components/ui/Reveal";

const trustItems = [
  { number: "01", title: "A separate tester", body: "Experience the fragrance before opening the sealed full-size bottle." },
  { number: "02", title: "Sealed-bottle eligibility", body: "Contact KHAYAL on the delivery day if the tester is not right for you." },
  { number: "03", title: "Karachi in 24 hours", body: "Expected after order confirmation, subject to courier and service conditions." },
  { number: "04", title: "Nationwide delivery", body: "Expected within 3–4 working days outside Karachi." },
];

export default function TrustSection() {
  return (
    <section className="border-y border-white/10 bg-noir py-24 text-ivory md:py-32" aria-labelledby="trust-title">
      <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-14">
        <Reveal>
          <div className="grid gap-8 border-b border-white/10 pb-12 md:grid-cols-[1fr_1.1fr] md:items-end">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-champagne">Confidence, before opening</p>
              <h2 id="trust-title" className="mt-4 max-w-lg font-serif-display text-4xl leading-tight md:text-6xl">Try the memory first.</h2>
            </div>
            <p className="max-w-lg text-sm leading-7 text-ivory/55 md:justify-self-end md:text-base">Every fragrance order includes a separate tester. The full-size bottle stays sealed while you decide whether the scent belongs with you.</p>
          </div>
        </Reveal>
        <div className="grid md:grid-cols-2 lg:grid-cols-4">
          {trustItems.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.06}>
              <article className="h-full border-b border-white/10 py-8 md:min-h-56 md:border-b-0 md:border-r md:px-6 md:first:pl-0 md:last:border-r-0">
                <span className="text-[10px] tracking-[0.25em] text-champagne/70">{item.number}</span>
                <h3 className="mt-8 font-serif-display text-2xl">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-ivory/50">{item.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
        <Link href="/shipping" className="mt-10 inline-flex text-xs uppercase tracking-[0.18em] text-champagne underline decoration-champagne/35 underline-offset-8">Read delivery & return details</Link>
      </div>
    </section>
  );
}
