"use client";

import type { ReactNode } from "react";
import { trackMarketing, type MarketingEvent } from "@/lib/analytics";

export default function TrackedContactLink({
  href,
  event,
  children,
  className,
}: {
  href: string;
  event: Extract<MarketingEvent, "phone_click" | "email_click">;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a href={href} onClick={() => trackMarketing(event, { placement: "footer" })} className={className}>
      {children}
    </a>
  );
}
