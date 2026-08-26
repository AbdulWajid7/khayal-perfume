export const metadata = {
  title: "Our Story",
  description:
    "Learn the philosophy, craft, and vision behind Khayal — a luxury niche perfume house born from imagination.",
};

export default function StoryPage() {
  return (
    <section className="pt-32 pb-16 md:pt-40 md:pb-24 bg-cream">
      <div className="mx-auto max-w-3xl px-4 md:px-8 lg:px-12 text-center">
        <h1 className="font-serif-display text-ink text-[48px] font-medium tracking-tight">
          Our Story
        </h1>
        <p className="mt-6 text-stone text-base leading-relaxed">
          Born from imagination, Khayal exists at the intersection of memory and artistry. Every
          bottle carries a vision: midnight conversations, golden smoke, and the slow bloom of rare
          ingredients. The full story page is coming soon.
        </p>
      </div>
    </section>
  );
}
