"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import type { RefObject } from "react";

export default function ScrollProgress({ target }: { target: RefObject<HTMLElement | null> }) {
  const { scrollYProgress } = useScroll({ target, offset: ["start end", "end start"] });
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.2 });

  return (
    <motion.div
      className="absolute inset-x-0 top-0 z-20 h-px origin-left bg-champagne"
      style={{ scaleX }}
      aria-hidden="true"
    />
  );
}
