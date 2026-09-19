"use server";

import { dbConnect, toJSON } from "@/lib/mongoose";
import { requireAuth } from "@/lib/auth";
import { Subscriber, type ISubscriber } from "@/models/Subscriber";
import { WelcomeOffer, type IWelcomeOffer } from "@/models/WelcomeOffer";
import { WelcomeDiscountConfig } from "@/models/WelcomeDiscountConfig";
import { Order } from "@/models/Order";

export async function getSubscribers(): Promise<ISubscriber[]> {
  const session = await requireAuth(["admin"]);
  if (!session) throw new Error("Unauthorized");
  await dbConnect();
  const subscribers = await Subscriber.find().sort({ createdAt: -1 }).lean();
  return toJSON(subscribers) as unknown as ISubscriber[];
}

export async function getWelcomeOffers(): Promise<IWelcomeOffer[]> {
  const session = await requireAuth(["admin"]);
  if (!session) throw new Error("Unauthorized");
  await dbConnect();
  const offers = await WelcomeOffer.find().sort({ createdAt: -1 }).lean();
  return toJSON(offers) as unknown as IWelcomeOffer[];
}

export interface WelcomeMetrics {
  totalSubscribers: number;
  welcomeCodesIssued: number;
  welcomeCodesRedeemed: number;
  welcomeCodesExpired: number;
  welcomeCodesActive: number;
  redemptionRate: number;
  revenueFromWelcome: number;
  discountCost: number;
  averageOrderValue: number;
}

export async function getWelcomeMetrics(): Promise<WelcomeMetrics> {
  const session = await requireAuth(["admin"]);
  if (!session) throw new Error("Unauthorized");
  await dbConnect();

  const [
    totalSubscribers,
    issued,
    redeemed,
    expired,
    active,
    welcomeOrders,
  ] = await Promise.all([
    Subscriber.countDocuments({ subscribed: true, unsubscribed: false }),
    WelcomeOffer.countDocuments(),
    WelcomeOffer.countDocuments({ status: "redeemed" }),
    WelcomeOffer.countDocuments({ status: "expired" }),
    WelcomeOffer.countDocuments({ status: "active" }),
    Order.find({ couponType: "WELCOME_FIRST_ORDER", orderStatus: { $ne: "cancelled" } }).lean(),
  ]);

  const revenueFromWelcome = welcomeOrders.reduce((sum, o) => sum + ((o as { total?: number }).total || 0), 0);
  const discountCost = welcomeOrders.reduce((sum, o) => sum + ((o as { discount?: number }).discount || 0), 0);
  const averageOrderValue = welcomeOrders.length ? revenueFromWelcome / welcomeOrders.length : 0;

  return {
    totalSubscribers,
    welcomeCodesIssued: issued,
    welcomeCodesRedeemed: redeemed,
    welcomeCodesExpired: expired,
    welcomeCodesActive: active,
    redemptionRate: issued ? Math.round((redeemed / issued) * 1000) / 10 : 0,
    revenueFromWelcome,
    discountCost,
    averageOrderValue,
  };
}

export async function updateWelcomeConfig(formData: FormData) {
  const session = await requireAuth(["admin"]);
  if (!session) throw new Error("Unauthorized");
  await dbConnect();

  const existing = await WelcomeDiscountConfig.findOne().sort({ createdAt: -1 });
  const data = {
    enabled: formData.get("enabled")?.toString() === "true",
    percentage: Number(formData.get("percentage") || "5"),
    maxDiscount: Number(formData.get("maxDiscount") || "500"),
    validityDays: Number(formData.get("validityDays") || "7"),
    popupDelaySeconds: Number(formData.get("popupDelaySeconds") || "10"),
    dismissalSuppressionDays: Number(formData.get("dismissalSuppressionDays") || "7"),
    campaignStartDate: formData.get("campaignStartDate")?.toString() || undefined,
    campaignEndDate: formData.get("campaignEndDate")?.toString() || undefined,
    emailSubject: formData.get("emailSubject")?.toString() || "Welcome to KHAYAL — Your 5% Code Is Inside",
    emailPreviewText: formData.get("emailPreviewText")?.toString() || "A personal welcome offer for your first KHAYAL order.",
  };

  if (data.percentage < 0 || data.percentage > 100) throw new Error("Invalid percentage");
  if (data.maxDiscount < 0) throw new Error("Invalid max discount");
  if (data.validityDays < 1) throw new Error("Invalid validity days");

  if (existing) {
    existing.set(data);
    await existing.save();
  } else {
    await WelcomeDiscountConfig.create(data);
  }
}
