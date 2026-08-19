"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

interface ParallaxProps {
  children: ReactNode;
  /** Max vertical travel in percent of container height. */
  strength?: number;
  className?: string;
}

/**
 * Wraps media (typically an <Image fill />) in a slightly oversized layer that
 * drifts vertically as the viewport scrolls past it, producing a subtle
 * cinematic parallax used throughout the site's editorial sections.
 */
export default function Parallax({ children, strength = 12, className }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [`-${strength}%`, `${strength}%`]);

  return (
    <div ref={ref} className={["absolute inset-0 overflow-hidden", className].filter(Boolean).join(" ")}>
      <motion.div
        style={prefersReducedMotion ? undefined : { y }}
        className="absolute inset-x-0 -top-[15%] h-[130%]"
      >
        {children}
      </motion.div>
    </div>
  );
}
