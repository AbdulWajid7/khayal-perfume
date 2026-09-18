"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { motionTokens } from "@/lib/motion";

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="sync" initial={false}>
      <motion.div
        key={pathname}
        initial={{ y: 6 }}
        animate={{ y: 0 }}
        exit={{ opacity: 0.96 }}
        transition={{ duration: motionTokens.pageTransitionDuration, ease: motionTokens.ease.standard }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
