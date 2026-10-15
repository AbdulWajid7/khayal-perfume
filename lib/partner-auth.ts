/**
 * Partner (promoter) portal sessions. Separate cookie and a derived signing key from
 * the admin login, so the two can never be swapped.
 */
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { dbConnect } from "@/lib/mongoose";
import { Promoter, type IPromoter } from "@/models/Promoter";

export const PARTNER_COOKIE = "khayal-partner-session";

function key() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("Please define AUTH_SECRET environment variable");
  return new TextEncoder().encode(`${secret}:partner`);
}

export async function createPartnerSession(promoterId: string) {
  const token = await new SignJWT({ pid: promoterId, kind: "partner" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key());
  (await cookies()).set(PARTNER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/partner",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearPartnerSession() {
  (await cookies()).set(PARTNER_COOKIE, "", { path: "/partner", maxAge: 0 });
}

/** The signed-in, active promoter, read fresh from the database. */
export async function getPartner(): Promise<IPromoter | null> {
  const token = (await cookies()).get(PARTNER_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    if (payload.kind !== "partner" || typeof payload.pid !== "string") return null;
    await dbConnect();
    const doc = await Promoter.findById(payload.pid).lean();
    if (!doc || !doc.active) return null;
    return doc as unknown as IPromoter;
  } catch {
    return null;
  }
}
