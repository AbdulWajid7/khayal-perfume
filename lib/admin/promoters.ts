"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertSection } from "@/lib/admin/access";
import { hashPassword } from "@/lib/auth";
import { dbConnect, toJSON } from "@/lib/mongoose";
import { Promoter, type IPromoter } from "@/models/Promoter";
import { Coupon } from "@/models/Coupon";
import { Order } from "@/models/Order";
import { promoterReport, type PromoterReport } from "@/lib/promoter-report";

export type PromoterView = Omit<IPromoter, "passwordHash"> & { hasPassword: boolean };

function view(doc: IPromoter): PromoterView {
  const { passwordHash, ...rest } = toJSON(doc) as unknown as IPromoter;
  return { ...rest, hasPassword: Boolean(passwordHash) };
}

const text = (f: FormData, k: string) => f.get(k)?.toString().trim() || "";

/** "terrace, TERRACE15" -> ["TERRACE", "TERRACE15"] */
function parseCodes(raw: string): string[] {
  const codes = raw
    .split(/[\s,]+/)
    .map((c) => c.toUpperCase().replace(/[^A-Z0-9_-]/g, ""))
    .filter(Boolean);
  return [...new Set(codes)].slice(0, 20);
}

function parseRate(raw: string): number {
  const n = parseFloat(raw);
  if (!Number.isFinite(n) || n < 0 || n > 100) throw new Error("Commission must be between 0 and 100% of profit");
  return n / 100;
}

async function assertCodesFree(codes: string[], exceptId?: string) {
  const clash = await Promoter.findOne({ codes: { $in: codes }, ...(exceptId ? { _id: { $ne: exceptId } } : {}) })
    .select("name codes")
    .lean();
  if (clash) {
    const taken = clash.codes.filter((c) => codes.includes(c));
    throw new Error(`${taken.join(", ")} already belongs to ${clash.name}`);
  }
}

export async function listPromoters(): Promise<(PromoterView & { report: Omit<PromoterReport, "orders"> })[]> {
  await assertSection("promoters");
  await dbConnect();
  const docs = await Promoter.find().sort({ createdAt: -1 }).lean();
  return Promise.all(
    docs.map(async (d) => {
      const full = await promoterReport(d);
      const report = { summary: full.summary, paid: full.paid, balance: full.balance };
      return { ...view(d as unknown as IPromoter), report };
    })
  );
}

export async function getPromoterDetail(id: string) {
  await assertSection("promoters");
  await dbConnect();
  const doc = await Promoter.findById(id).lean();
  if (!doc) return null;
  const promoter = view(doc as unknown as IPromoter);
  const [report, existingCoupons] = await Promise.all([
    promoterReport(doc),
    Coupon.find({ code: { $in: doc.codes } }).select("code enabled").lean(),
  ]);
  const missingCoupons = doc.codes.filter((c) => !existingCoupons.some((e) => e.code === c));
  return { promoter, report, missingCoupons };
}

export async function createPromoter(formData: FormData) {
  const admin = await assertSection("promoters");
  await dbConnect();
  const name = text(formData, "name");
  const email = text(formData, "email").toLowerCase();
  const password = text(formData, "password");
  if (!name || !email) throw new Error("Name and login email are required");
  if (password && password.length < 8) throw new Error("Password must be at least 8 characters");
  if (await Promoter.exists({ email })) throw new Error("A promoter with this email already exists");
  const codes = parseCodes(text(formData, "codes"));
  await assertCodesFree(codes);

  const doc = await Promoter.create({
    name,
    email,
    contactName: text(formData, "contactName") || undefined,
    phone: text(formData, "phone") || undefined,
    codes,
    commissionRate: parseRate(text(formData, "rate") || "20"),
    notes: text(formData, "notes") || undefined,
    passwordHash: password ? await hashPassword(password) : undefined,
    active: true,
  });
  console.info(`Promoter ${name} created by ${admin.email}`);
  revalidatePath("/admin/promoters");
  redirect(`/admin/promoters/${doc._id}`);
}

export async function updatePromoter(id: string, formData: FormData) {
  await assertSection("promoters");
  await dbConnect();
  const doc = await Promoter.findById(id);
  if (!doc) throw new Error("Promoter not found");
  const codes = parseCodes(text(formData, "codes"));
  await assertCodesFree(codes, id);
  const email = text(formData, "email").toLowerCase();
  if (email && email !== doc.email && (await Promoter.exists({ email }))) {
    throw new Error("Another promoter already uses this email");
  }
  doc.name = text(formData, "name") || doc.name;
  if (email) doc.email = email;
  doc.contactName = text(formData, "contactName") || undefined;
  doc.phone = text(formData, "phone") || undefined;
  doc.codes = codes;
  doc.commissionRate = parseRate(text(formData, "rate"));
  doc.notes = text(formData, "notes") || undefined;
  doc.active = formData.get("active") === "on";
  const password = text(formData, "password");
  if (password) {
    if (password.length < 8) throw new Error("Password must be at least 8 characters");
    doc.passwordHash = await hashPassword(password);
  }
  await doc.save();
  revalidatePath(`/admin/promoters/${id}`);
  revalidatePath("/admin/promoters");
}

export async function addPayout(id: string, formData: FormData) {
  const admin = await assertSection("promoters");
  await dbConnect();
  const amount = parseFloat(text(formData, "amount"));
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Enter the amount paid");
  const date = text(formData, "paidAt");
  await Promoter.updateOne(
    { _id: id },
    {
      $push: {
        payouts: {
          amount: Math.round(amount * 100) / 100,
          paidAt: date ? new Date(`${date}T12:00:00+05:00`) : new Date(),
          note: text(formData, "note") || undefined,
          recordedBy: admin.email,
        },
      },
    }
  );
  revalidatePath(`/admin/promoters/${id}`);
}

export async function removePayout(id: string, payoutId: string) {
  await assertSection("promoters");
  await dbConnect();
  await Promoter.updateOne({ _id: id }, { $pull: { payouts: { _id: payoutId } } });
  revalidatePath(`/admin/promoters/${id}`);
}

/** Credits an order to the promoter by hand (e.g. a WhatsApp order where the customer used their code). */
export async function tagOrder(id: string, formData: FormData) {
  await assertSection("promoters");
  await dbConnect();
  const orderNumber = text(formData, "orderNumber").toUpperCase();
  if (!orderNumber) throw new Error("Enter an order number");
  if (!(await Order.exists({ orderNumber }))) throw new Error(`No order ${orderNumber}`);
  const other = await Promoter.findOne({ taggedOrders: orderNumber, _id: { $ne: id } }).select("name").lean();
  if (other) throw new Error(`${orderNumber} is already credited to ${other.name}`);
  await Promoter.updateOne({ _id: id }, { $addToSet: { taggedOrders: orderNumber } });
  revalidatePath(`/admin/promoters/${id}`);
}

export async function untagOrder(id: string, orderNumber: string) {
  await assertSection("promoters");
  await dbConnect();
  await Promoter.updateOne({ _id: id }, { $pull: { taggedOrders: orderNumber } });
  revalidatePath(`/admin/promoters/${id}`);
}
