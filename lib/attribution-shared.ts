export interface AttributionData {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  referrer?: string;
  landingPage?: string;
  affiliateCode?: string;
  partnerCode?: string;
  cafeQrCode?: string;
}

export function sanitizeAttribution(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const cleaned = value.trim().slice(0, 200);
  return cleaned || undefined;
}
