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
  source: string = "popup",
  pagePath: string = ""
): Promise<{ ok: boolean; message: string }> {
  const sanitized = sanitizeEmail(email);
  if (!emailRegex.test(sanitized)) {
    return { ok: false, message: "Please enter a valid email address." };
  }

  try {
    await dbConnect();
    await Subscriber.findOneAndUpdate(
      { normalizedEmail: sanitized },
      {
        email: sanitized,
        normalizedEmail: sanitized,
        source,
        subscribed: true,
        consentAt: new Date(),
        consentSource: source,
        signupPage: pagePath,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  } catch (error) {
    console.error("subscribeToNewsletter error:", error);
    return { ok: false, message: "Something went wrong. Please try again later." }
  }

  return { ok: true, message: "Thank you for subscribing." };
}

export async function getSubscribersForAdmin(): Promise<ISubscriber[]> {
  const session = await requireAuth(["admin", "editor"]);
  if (!session) throw new Error("Unauthorized");
  await dbConnect();
  const subscribers = await Subscriber.find().sort({ createdAt: -1 }).lean();
  return toJSON(subscribers) as unknown as ISubscriber[];
}
