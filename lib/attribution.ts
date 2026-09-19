"use server";

import { cookies } from "next/headers";
import type { AttributionData } from "@/lib/attribution-shared";
import { sanitizeAttribution } from "@/lib/attribution-shared";

const ATTRIBUTION_COOKIE = "khayal-attribution";
const ATTRIBUTION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export type { AttributionData };

export async function captureAttribution(searchParams?: Record<string, string | string[] | undefined>): Promise<AttributionData> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(ATTRIBUTION_COOKIE)?.value;
  let stored: AttributionData = {};
  if (raw) {
    try {
      stored = JSON.parse(raw) as AttributionData;
    } catch {
      stored = {};
    }
  }

  const getParam = (key: string): string | undefined => {
    const val = searchParams?.[key];
    return Array.isArray(val) ? val[0] : val;
  };

  const data: AttributionData = {
    utmSource: sanitizeAttribution(getParam("utm_source") || stored.utmSource),
    utmMedium: sanitizeAttribution(getParam("utm_medium") || stored.utmMedium),
    utmCampaign: sanitizeAttribution(getParam("utm_campaign") || stored.utmCampaign),
    utmContent: sanitizeAttribution(getParam("utm_content") || stored.utmContent),
    utmTerm: sanitizeAttribution(getParam("utm_term") || stored.utmTerm),
    referrer: sanitizeAttribution(stored.referrer),
    landingPage: sanitizeAttribution(stored.landingPage),
    affiliateCode: sanitizeAttribution(getParam("affiliate") || stored.affiliateCode),
    partnerCode: sanitizeAttribution(getParam("partner") || stored.partnerCode),
    cafeQrCode: sanitizeAttribution(getParam("cafe") || stored.cafeQrCode),
  };

  return data;
}

export async function storeAttribution(data: AttributionData): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(ATTRIBUTION_COOKIE, JSON.stringify(data), {
    maxAge: ATTRIBUTION_MAX_AGE,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}
