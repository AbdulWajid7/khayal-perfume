"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import ScrollProgress from "@/components/motion/ScrollProgress";
import { trackMarketing } from "@/lib/analytics";

const chapters = [
  { kicker: "The beginning", line: "A thought becomes a feeling." },
  { kicker: "What remains", line: "A feeling becomes a memory." },
  { kicker: "The house", line: "A memory becomes KHAYAL." },
];

function StoryChapter({ chapter, index, progress, reduceMotion }: { chapter: (typeof chapters)[number]; index: number; progress: MotionValue<number>; reduceMotion: boolean | null }) {
  const center = index / (chapters.length - 1);
  const opacity = useTransform(progress, [Math.max(0, center - 0.28), center, Math.min(1, center + 0.28)], index === 0 ? [1, 1, 0.22] : index === chapters.length - 1 ? [0.22, 1, 1] : [0.22, 1, 0.22]);
  const y = useTransform(progress, [Math.max(0, center - 0.25), center], [18, 0]);

  return (
    <motion.div style={reduceMotion ? undefined : { opacity, y }}>
      <span className="text-[10px] uppercase tracking-[0.24em] text-ivory/40">0{index + 1} · {chapter.kicker}</span>
      <h2 className="mt-3 max-w-xl font-serif-display text-3xl leading-tight text-ivory md:text-5xl">{chapter.line}</h2>
    </motion.div>
  );
}

export default function MemoryStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const sentStart = useRef(false);
  const sentComplete = useRef(false);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const bottleX = useTransform(scrollYProgress, [0, 0.5, 1], ["10%", "-5%", "5%"]);
  const bottleScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.94, 1.03, 1]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.18, 0.48, 0.3]);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !sentStart.current) {
          sentStart.current = true;
          trackMarketing("product_story_start", { story_id: "khayal-memory" });
        }
        if (entry.boundingClientRect.bottom <= window.innerHeight && !sentComplete.current) {
          sentComplete.current = true;
          trackMarketing("product_story_complete", { story_id: "khayal-memory" });
        }
      },
      { threshold: [0, 0.2, 1] }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-noir text-ivory md:min-h-[300vh]" aria-label="A memory becomes KHAYAL">
      <ScrollProgress target={sectionRef} />
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 md:sticky md:top-0 md:min-h-screen md:grid-cols-[0.9fr_1.1fr] md:items-center md:px-10 md:py-20 lg:px-14">
        <div className="relative order-2 aspect-[4/5] overflow-hidden rounded-[2px] border border-white/10 md:order-1 md:aspect-[5/6]">
          <motion.div style={reduceMotion ? undefined : { x: bottleX, scale: bottleScale }} className="absolute inset-[-5%]">
            <Image src="/images/brand-story.png" alt="KHAYAL bottle in the Karachi atelier" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" loading="lazy" />
          </motion.div>
          <motion.div style={reduceMotion ? undefined : { opacity: glowOpacity }} className="absolute inset-0 bg-[radial-gradient(circle_at_55%_46%,rgba(216,189,131,.45),transparent_38%)]" aria-hidden="true" />
          <div className="absolute inset-0 bg-gradient-to-t from-noir/75 via-transparent to-noir/20" />
        </div>

        <div className="order-1 md:order-2 md:pl-10 lg:pl-20">
          <p className="text-[10px] uppercase tracking-[0.32em] text-champagne">The idea behind KHAYAL</p>
          <div className="mt-10 space-y-12 md:space-y-16">
            {chapters.map((chapter, index) => (
              <StoryChapter key={chapter.line} chapter={chapter} index={index} progress={scrollYProgress} reduceMotion={reduceMotion} />
            ))}
          </div>
          <Link href="/story" className="btn-premium-ghost mt-12">Read our story</Link>
        </div>
      </div>
    </section>
  );
}
