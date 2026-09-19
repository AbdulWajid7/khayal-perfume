"use server";

import { validateCoupon } from "@/lib/coupons";
import { validateWelcomeCoupon } from "@/lib/welcome-offers";

export type DiscountResult =
  | {
      valid: true;
      discount: number;
      type: "coupon" | "welcome_offer";
      percentage?: number;
      maxDiscount?: number;
      codeHash?: string;
      offerId?: string;
      subscriberId?: string;
      message?: string;
    }
  | {
      valid: false;
      reason: string;
      message: string;
    };

export async function applyDiscountCode(
  code: string,
  email: string | undefined,
  subtotal: number,
  existingDiscountCode?: string
): Promise<DiscountResult> {
  if (!code || !code.trim()) {
    return { valid: false, reason: "missing_code", message: "Please enter a discount code." };
  }

  const trimmed = code.trim().toUpperCase();

  // Welcome codes have a predictable prefix for routing, but the actual validation is server-side.
  if (trimmed.startsWith("KHAYAL-")) {
    if (!email || !email.trim()) {
      return { valid: false, reason: "missing_email", message: "Please enter your email address before applying a welcome code." };
    }
    const result = await validateWelcomeCoupon(trimmed, email, subtotal, existingDiscountCode);
    if (!result.valid) {
      return { valid: false, reason: result.reason, message: result.message };
    }
    return {
      valid: true,
      discount: result.discount,
      type: "welcome_offer",
      percentage: result.percentage,
      maxDiscount: result.maxDiscount,
      codeHash: result.codeHash,
      offerId: result.offerId,
      subscriberId: result.subscriberId,
      message: result.message,
    };
  }

  const result = await validateCoupon(trimmed, subtotal);
  if (!result.valid) {
    return { valid: false, reason: result.reason || "invalid", message: result.reason || "Invalid coupon." };
  }
  return {
    valid: true,
    discount: result.discount,
    type: "coupon",
    message: `Discount applied.`,
  };
}
