"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { isCampaignActive, type Campaign } from "@/lib/campaign";
import { trackMarketing } from "@/lib/analytics";
import { motionTokens } from "@/lib/motion";

export default function CampaignBanner({ campaign }: { campaign: Campaign }) {
  const ref = useRef<HTMLElement>(null);
  const sentView = useRef(false);
  const inView = useInView(ref, { amount: 0.45, once: true });
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!inView || sentView.current) return;
    sentView.current = true;
    trackMarketing("promotion_view", { promotion_id: campaign.id, promotion_name: campaign.title });
  }, [campaign.id, campaign.title, inView]);

  if (!isCampaignActive(campaign)) return null;

  const trackClick = (label: string) =>
    trackMarketing("promotion_click", {
      promotion_id: campaign.id,
      promotion_name: campaign.title,
      creative_slot: label,
    });

  return (
    <section
      ref={ref}
      className="relative isolate min-h-[72svh] overflow-hidden border-y border-white/10 text-ivory md:min-h-[680px]"
      style={{ backgroundColor: campaign.backgroundColor }}
      aria-labelledby={`${campaign.id}-title`}
    >
      <motion.div
        initial={reduceMotion ? false : { scale: 1.03 }}
        whileInView={reduceMotion ? undefined : { scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.8, ease: motionTokens.ease.standard }}
        className="absolute inset-0"
      >
        <Image
          src={campaign.desktopImage}
          alt="KHAYAL fragrance collection"
          fill
          sizes="100vw"
          className="object-cover object-center"
          loading="lazy"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-r from-noir via-noir/75 to-noir/15" />
      <motion.div
        initial={reduceMotion ? false : { x: "-130%" }}
        whileInView={reduceMotion ? undefined : { x: "130%" }}
        viewport={{ once: true }}
        transition={{ duration: 1.6, delay: 0.25, ease: "easeInOut" }}
        className="absolute inset-y-0 w-1/3 skew-x-[-14deg] bg-gradient-to-r from-transparent via-champagne/10 to-transparent"
        aria-hidden="true"
      />
      <div className="relative mx-auto flex min-h-[72svh] max-w-7xl items-end px-5 py-16 md:min-h-[680px] md:items-center md:px-10 lg:px-14">
        <motion.div
          initial={reduceMotion ? false : "hidden"}
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: motionTokens.stagger.editorial } },
          }}
          className="max-w-xl"
        >
          {[campaign.eyebrow, campaign.title, campaign.subtitle].map((text, index) => (
            <motion.div
              key={text}
              variants={{
                hidden: { opacity: 0, y: index === 1 ? 30 : 18 },
                visible: { opacity: 1, y: 0, transition: { duration: motionTokens.duration.slow } },
              }}
            >
              {index === 0 && <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-champagne">{text}</p>}
              {index === 1 && <h2 id={`${campaign.id}-title`} className="mt-4 max-w-lg font-serif-display text-4xl leading-[1.02] md:text-6xl">{text}</h2>}
              {index === 2 && <p className="mt-5 max-w-md text-sm leading-7 text-ivory/70 md:text-base">{text}</p>}
            </motion.div>
          ))}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Link href={campaign.primaryCta.href} onClick={() => trackClick("primary")} className="btn-premium-solid">
              {campaign.primaryCta.label}
            </Link>
            {campaign.secondaryCta && (
              <Link href={campaign.secondaryCta.href} onClick={() => trackClick("secondary")} className="btn-premium-ghost">
                {campaign.secondaryCta.label}
              </Link>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
