"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface RevealMaskProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "h1" | "h2" | "h3" | "h4" | "p" | "span";
}

/**
 * Clip-mask text reveal used for headings — the line slides up from behind
 * an overflow-hidden mask as it enters the viewport, the kind of restrained
 * editorial motion seen on international perfume houses' sites.
 */
export default function RevealMask({ children, delay = 0, className, as: Wrapper = "div" }: RevealMaskProps) {
  return (
    <Wrapper className="overflow-hidden">
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        whileInView={{ y: "0%", opacity: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
        className={className}
      >
        {children}
      </motion.div>
    </Wrapper>
  );
}
