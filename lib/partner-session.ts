"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { verifyPassword } from "@/lib/auth";
import { dbConnect } from "@/lib/mongoose";
import { Promoter } from "@/models/Promoter";
import { checkRateLimit } from "@/lib/rate-limit";
import { clearPartnerSession, createPartnerSession } from "@/lib/partner-auth";

export async function partnerLogin(_prev: { error?: string }, formData: FormData) {
  const email = formData.get("email")?.toString().trim().toLowerCase() || "";
  const password = formData.get("password")?.toString() || "";
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limit = checkRateLimit(`partner-login:${ip}`, 8, 15 * 60 * 1000);
  if (!limit.allowed) return { error: `Too many attempts. Try again in ${Math.ceil(limit.retryAfterSeconds / 60)} minutes.` };

  await dbConnect();
  const promoter = await Promoter.findOne({ email });
  const ok = Boolean(promoter?.passwordHash && promoter.active && (await verifyPassword(password, promoter.passwordHash)));
  if (!promoter || !ok) return { error: "Email or password is not right" };

  promoter.lastLoginAt = new Date();
  await promoter.save();
  await createPartnerSession(String(promoter._id));
  redirect("/partner");
}

export async function partnerLogout() {
  await clearPartnerSession();
  redirect("/partner/login");
}
