"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { motionTokens } from "@/lib/motion";

export default function StaggerGroup({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10%" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: motionTokens.stagger.base } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export const staggerItem = {
  hidden: { opacity: 0, y: motionTokens.revealDistance },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: motionTokens.duration.base, ease: motionTokens.ease.standard },
  },
};
