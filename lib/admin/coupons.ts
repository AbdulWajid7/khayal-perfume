"use server";

import { requireSection } from "@/lib/admin/access";
import { revalidatePath } from "next/cache";
import { dbConnect } from "@/lib/mongoose";
import { Coupon, type ICoupon } from "@/models/Coupon";

/** Discount codes change revenue: full admins only. */
async function guard() {
  const session = await requireSection("coupons");
  if (!session) throw new Error("Only the owner account can manage discount codes");
}

export type CouponRow = Omit<ICoupon, "startsAt" | "expiresAt" | "createdAt" | "updatedAt"> & {
  startsAt: string | null;
  expiresAt: string | null;
};

export async function listCoupons(): Promise<CouponRow[]> {
  await guard();
  await dbConnect();
  const docs = await Coupon.find().sort({ createdAt: -1 }).lean();
  return docs.map((c) => ({
    _id: String(c._id),
    code: c.code,
    description: c.description,
    discountType: c.discountType,
    value: c.value,
    minimumOrderAmount: c.minimumOrderAmount,
    maxUses: c.maxUses,
    usedCount: c.usedCount,
    enabled: c.enabled,
    startsAt: c.startsAt ? new Date(c.startsAt).toISOString() : null,
    expiresAt: c.expiresAt ? new Date(c.expiresAt).toISOString() : null,
  }));
}

/** "2026-10-17T00:00" typed in the admin is Karachi time. */
function pkt(value: FormDataEntryValue | null): Date | undefined {
  const v = value?.toString().trim();
  if (!v) return undefined;
  const d = new Date(`${v.length === 16 ? `${v}:00` : v}+05:00`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

const optionalNumber = (value: FormDataEntryValue | null) => {
  const n = Number(value?.toString().trim());
  return value?.toString().trim() && Number.isFinite(n) && n > 0 ? n : undefined;
};

export async function saveCoupon(
  _prev: { ok: boolean; message: string } | null,
  formData: FormData
): Promise<{ ok: boolean; message: string }> {
  try {
    await guard();
    const code = (formData.get("code")?.toString() || "").toUpperCase().replace(/[^A-Z0-9_-]/g, "");
    if (code.length < 3) return { ok: false, message: "Code needs at least 3 letters or numbers." };
    const discountType = formData.get("discountType") === "fixed" ? "fixed" : "percentage";
    const value = Number(formData.get("value"));
    if (!Number.isFinite(value) || value <= 0) return { ok: false, message: "Enter the discount amount." };
    if (discountType === "percentage" && value > 90) return { ok: false, message: "A percentage discount must be 90% or less." };
    const startsAt = pkt(formData.get("startsAt"));
    const expiresAt = pkt(formData.get("expiresAt"));
    if (startsAt && expiresAt && expiresAt <= startsAt) return { ok: false, message: "The end date must be after the start date." };

    const set = {
      code,
      description: formData.get("description")?.toString().trim().slice(0, 200) || undefined,
      discountType,
      value,
      enabled: formData.get("enabled")?.toString() !== "false",
    };
    const unset: Record<string, 1> = {};
    const opt = {
      minimumOrderAmount: optionalNumber(formData.get("minimumOrderAmount")),
      maxUses: optionalNumber(formData.get("maxUses")),
      startsAt,
      expiresAt,
    };
    for (const [k, v] of Object.entries(opt)) if (v === undefined) unset[k] = 1;
    const defined = Object.fromEntries(Object.entries(opt).filter(([, v]) => v !== undefined));

    await dbConnect();
    await Coupon.updateOne(
      { code },
      { $set: { ...set, ...defined }, ...(Object.keys(unset).length ? { $unset: unset } : {}), $setOnInsert: { usedCount: 0 } },
      { upsert: true }
    );
    revalidatePath("/admin/coupons");
    return { ok: true, message: `${code} saved.` };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Could not save" };
  }
}

export async function toggleCoupon(formData: FormData) {
  await guard();
  await dbConnect();
  const id = formData.get("id")?.toString();
  await Coupon.updateOne({ _id: id }, { $set: { enabled: formData.get("enabled")?.toString() === "true" } });
  revalidatePath("/admin/coupons");
}
