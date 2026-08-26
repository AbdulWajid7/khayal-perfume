"use server";

import { dbConnect, toJSON } from "@/lib/mongoose";
import { Subscriber, type ISubscriber } from "@/models/Subscriber";
import { requireAuth } from "@/lib/auth";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

export async function subscribeToNewsletter(
  email: string,
  source: string = "popup"
): Promise<{ ok: boolean; message: string }> {
  const sanitized = sanitizeEmail(email);
  if (!emailRegex.test(sanitized)) {
    return { ok: false, message: "Please enter a valid email address." };
  }

  await dbConnect();
  await Subscriber.findOneAndUpdate(
    { email: sanitized },
    { email: sanitized, source, subscribed: true },
    { upsert: true, new: true }
  );

  return { ok: true, message: "Thank you for subscribing." };
}

export async function getSubscribersForAdmin(): Promise<ISubscriber[]> {
  const session = await requireAuth(["admin", "editor"]);
  if (!session) throw new Error("Unauthorized");
  await dbConnect();
  const subscribers = await Subscriber.find().sort({ createdAt: -1 }).lean();
  return toJSON(subscribers) as unknown as ISubscriber[];
}
