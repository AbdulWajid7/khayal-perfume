"use server";

import { headers } from "next/headers";
import { dbConnect } from "@/lib/mongoose";
import { AbandonedCart, type IAbandonedCartItem } from "@/models/AbandonedCart";
import { checkRateLimit } from "@/lib/rate-limit";

export async function saveAbandonedCart(data: {
  sessionId: string;
  email?: string;
  phone?: string;
  name?: string;
  items: IAbandonedCartItem[];
  subtotal: number;
}): Promise<void> {
  if (!data.sessionId || (!data.email && !data.phone) || !data.items.length) return;

  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limit = checkRateLimit(`abandon:${ip}`, 20, 60 * 1000);
  if (!limit.allowed) return;

  try {
    await dbConnect();
    await AbandonedCart.findOneAndUpdate(
      { sessionId: data.sessionId },
      {
        $set: {
          email: data.email || undefined,
          phone: data.phone || undefined,
          name: data.name || undefined,
          items: data.items,
          subtotal: data.subtotal,
          status: "open",
          lastSeenAt: new Date(),
        },
      },
      { upsert: true }
    );
  } catch (error) {
    console.error("saveAbandonedCart error:", error);
  }
}

export async function markCartRecovered(sessionId: string): Promise<void> {
  if (!sessionId) return;
  try {
    await dbConnect();
    await AbandonedCart.findOneAndUpdate({ sessionId }, { $set: { status: "recovered" } });
  } catch (error) {
    console.error("markCartRecovered error:", error);
  }
}
