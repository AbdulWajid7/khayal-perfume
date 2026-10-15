"use server";

import { dbConnect } from "@/lib/mongoose";
import { Coupon, type ICoupon } from "@/models/Coupon";

export type CouponResult =
  | { valid: true; coupon: ICoupon; discount: number }
  | { valid: false; reason: string };

export async function validateCoupon(code: string | undefined, subtotal: number): Promise<CouponResult> {
  await dbConnect();
  if (!code) return { valid: false, reason: "No coupon provided" };

  const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() }).lean();
  if (!coupon) return { valid: false, reason: "This code is not valid. Check the spelling and try again." };

  const now = new Date();
  if (!coupon.enabled) return { valid: false, reason: "This code is not available right now." };
  if (coupon.startsAt && now < new Date(coupon.startsAt)) {
    const when = new Date(coupon.startsAt).toLocaleString("en-PK", {
      timeZone: "Asia/Karachi",
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });
    return { valid: false, reason: `This code starts on ${when}.` };
  }
  if (coupon.expiresAt && now > new Date(coupon.expiresAt)) return { valid: false, reason: "This code has ended." };
  if (coupon.maxUses !== undefined && coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, reason: "This code has been fully used." };
  }
  if (coupon.minimumOrderAmount !== undefined && coupon.minimumOrderAmount !== null && subtotal < coupon.minimumOrderAmount) {
    return { valid: false, reason: `Minimum order amount is PKR ${coupon.minimumOrderAmount.toLocaleString("en-PK")}` };
  }

  const discount =
    coupon.discountType === "percentage"
      ? Math.min(subtotal * (coupon.value / 100), subtotal)
      : Math.min(coupon.value, subtotal);

  return { valid: true, coupon: coupon as unknown as ICoupon, discount: Math.max(0, discount) };
}

export async function incrementCouponUsage(code: string): Promise<void> {
  await dbConnect();
  await Coupon.updateOne(
    { code: code.toUpperCase().trim() },
    { $inc: { usedCount: 1 } }
  );
}

export async function getCoupons(): Promise<ICoupon[]> {
  await dbConnect();
  const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
  return coupons as unknown as ICoupon[];
}
