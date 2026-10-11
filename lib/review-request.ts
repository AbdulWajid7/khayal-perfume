import { dbConnect } from "@/lib/mongoose";
import { normalizePhone } from "@/lib/phone";
import { sendTemplate, sendText, whatsappConfigured } from "@/lib/whatsapp";
import { WhatsAppOptIn } from "@/models/WhatsAppOptIn";
import type { IOrder } from "@/models/Order";

/** Link customers use to leave a Google review, from GOOGLE_REVIEW_URL or GOOGLE_PLACE_ID. */
export function getGoogleReviewUrl(): string | null {
  if (process.env.GOOGLE_REVIEW_URL) return process.env.GOOGLE_REVIEW_URL;
  if (process.env.GOOGLE_PLACE_ID) {
    return `https://search.google.com/local/writereview?placeid=${process.env.GOOGLE_PLACE_ID}`;
  }
  return null;
}

export function reviewRequestText(firstName: string, reviewUrl: string): string {
  return [
    `Assalamualaikum ${firstName}! Your KHAYAL order has been delivered ✦`,
    "",
    "We hope the tester has already told you a little about your new fragrance.",
    "If you have a minute, a short Google review helps other people find us and means a lot to a young Karachi brand:",
    reviewUrl,
    "",
    "Thank you. Reply here anytime if you need help with your order.",
  ].join("\n");
}

/**
 * Ask a customer for a Google review on WhatsApp once their order is delivered.
 * Uses the approved template named in WHATSAPP_REVIEW_TEMPLATE when set (works any time);
 * otherwise sends a plain message, which WhatsApp only delivers within 24 hours of the
 * customer's last message. Skips customers who replied STOP to KHAYAL messages.
 */
export async function sendReviewRequest(order: IOrder): Promise<boolean> {
  const reviewUrl = getGoogleReviewUrl();
  if (!reviewUrl || !whatsappConfigured() || !order.customer?.phone) return false;

  const phone = normalizePhone(order.customer.phone);
  if (!phone.isValid) return false;
  const waId = phone.e164.replace("+", "");

  try {
    await dbConnect();
    const optIn = await WhatsAppOptIn.findOne({ waId }).lean();
    if (optIn && optIn.optedIn === false) return false;
  } catch (error) {
    console.error("Review request opt-in check failed:", error);
  }

  const firstName = (order.customer.name || "").trim().split(/\s+/)[0] || "there";
  const template = process.env.WHATSAPP_REVIEW_TEMPLATE;
  if (template) {
    await sendTemplate(waId, template, process.env.WHATSAPP_REVIEW_TEMPLATE_LANG || "en", [firstName, reviewUrl]);
  } else {
    await sendText(waId, reviewRequestText(firstName, reviewUrl));
  }
  return true;
}
