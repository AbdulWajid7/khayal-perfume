"use server";

import { SignJWT, jwtVerify } from "jose";
import { put } from "@vercel/blob";
import { dbConnect, toJSON } from "@/lib/mongoose";
import { Order, type IOrder } from "@/models/Order";
import { normalizePhone } from "@/lib/phone";
import { sendPaymentProofNotification } from "@/lib/notifications";
import { revalidatePath } from "next/cache";

const MAX_PROOF_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_PROOF_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_PROOF_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not configured");
  return new TextEncoder().encode(secret);
}

export async function generateOrderAccessToken(orderNumber: string): Promise<string> {
  const secret = getSecret();
  return new SignJWT({ orderNumber })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setSubject("order-confirmation")
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyOrderAccessToken(token: string): Promise<{ orderNumber: string } | null> {
  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret, { subject: "order-confirmation" });
    if (typeof payload.orderNumber !== "string") return null;
    return { orderNumber: payload.orderNumber };
  } catch {
    return null;
  }
}

export async function getOrderByAccessToken(token: string): Promise<IOrder | null> {
  await dbConnect();
  const verified = await verifyOrderAccessToken(token);
  if (!verified) return null;
  const order = await Order.findOne({ orderNumber: verified.orderNumber }).lean();
  return toJSON(order) as unknown as IOrder | null;
}

export async function getOrderByNumberAndPhone(orderNumber: string, phone: string): Promise<IOrder | null> {
  await dbConnect();
  const normalized = normalizePhone(phone);
  if (!normalized.isValid) return null;
  const order = await Order.findOne({
    orderNumber: orderNumber.trim().toUpperCase(),
    "customer.normalizedPhone": normalized.e164,
  }).lean();
  return toJSON(order) as unknown as IOrder | null;
}

export async function submitPaymentProof(
  orderId: string,
  formData: FormData
): Promise<{ success: true; order: IOrder } | { success: false; error: string }> {
  await dbConnect();

  const order = await Order.findById(orderId);
  if (!order) return { success: false, error: "Order not found" };
  if (order.paymentMethod !== "bank_transfer") {
    return { success: false, error: "Payment proof is only required for bank transfers" };
  }
  if (order.paymentStatus !== "pending_verification") {
    return { success: false, error: "This order is not awaiting payment verification" };
  }

  const senderName = formData.get("senderName")?.toString().trim() || "";
  const referenceNumber = formData.get("referenceNumber")?.toString().trim() || "";
  const transferDate = formData.get("transferDate")?.toString().trim() || "";
  const file = formData.get("proof") as File | null;

  if (!senderName || senderName.length < 2) return { success: false, error: "Sender name is required" };
  if (!referenceNumber) return { success: false, error: "Reference/transaction number is required" };
  if (!transferDate) return { success: false, error: "Transfer date is required" };
  if (!file || file.size === 0) return { success: false, error: "Payment proof image is required" };

  if (file.size > MAX_PROOF_SIZE_BYTES) return { success: false, error: "Image must be smaller than 5 MB" };
  if (!ALLOWED_PROOF_TYPES.includes(file.type)) {
    return { success: false, error: "Only JPEG, PNG or WebP images are allowed" };
  }

  const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  if (!ALLOWED_PROOF_EXTENSIONS.includes(extension)) {
    return { success: false, error: "Only .jpg, .jpeg, .png or .webp files are allowed" };
  }

  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}${extension}`;
  const path = `payment-proofs/${order._id.toString()}/${safeName}`;

  const blob = await put(path, file, {
    access: "public",
    addRandomSuffix: false,
    contentType: file.type,
  });

  order.paymentVerification = {
    status: "pending_verification",
    senderName,
    referenceNumber,
    transferDate,
    proofUrl: blob.url,
    proofFilename: safeName,
  };

  order.auditHistory.push({
    actor: "customer",
    action: "payment_proof_submitted",
    after: { referenceNumber, transferDate, proofFilename: safeName },
    note: "Customer uploaded bank transfer proof",
    createdAt: new Date(),
  });

  await order.save();

  const orderJson = toJSON(order) as unknown as IOrder;
  await sendPaymentProofNotification(orderJson);
  revalidatePath(`/order-confirmation/${order.orderNumber}`);

  return { success: true, order: orderJson };
}

export async function getOrderByIdForAdmin(id: string): Promise<IOrder | null> {
  await dbConnect();
  const order = await Order.findById(id).lean();
  return toJSON(order) as unknown as IOrder | null;
}

