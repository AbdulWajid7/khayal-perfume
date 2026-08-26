"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const testimonials = [
  {
    id: 1,
    name: "Ayesha R.",
    location: "Lahore",
    text: "I have never received so many compliments. Oud Imperial stays on my clothes for days and feels like a signature I did not know I needed.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80",
  },
  {
    id: 2,
    name: "Omar S.",
    location: "Karachi",
    text: "Finally a local house that understands projection and balance. The attars are deep, traditional, and beautifully packaged.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80",
  },
  {
    id: 3,
    name: "Sana M.",
    location: "Islamabad",
    text: "Rose Smoke is my evening go-to. It is elegant, not overpowering, and feels like it belongs in a much more expensive boutique.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
  },
];

function Star() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="text-gold"
      aria-hidden="true"
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function Testimonials() {
  return (
    <section className="py-20 md:py-28 bg-cream">
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="eyebrow">What They Say</span>
          <h2 className="mt-3 font-serif-display text-ink text-[32px] md:text-[40px] font-medium tracking-tight">
            Loved by Fragrance Collectors
          </h2>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              variants={itemVariants}
              className="bg-pure rounded-2xl p-8 border border-border shadow-sm"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} />
                ))}
              </div>
              <blockquote className="text-ink leading-relaxed">
                “{testimonial.text}”
              </blockquote>
              <div className="mt-6 flex items-center gap-3">
                <div className="relative h-12 w-12 rounded-full overflow-hidden bg-cream-dark">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-ink text-sm font-medium">{testimonial.name}</p>
                  <p className="text-stone text-xs">{testimonial.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
