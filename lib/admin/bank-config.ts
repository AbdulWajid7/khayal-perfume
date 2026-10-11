"use server";

import { put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { dbConnect, toJSON } from "@/lib/mongoose";
import { BankTransferConfig, type IBankTransferConfig } from "@/models/BankTransferConfig";
import { bankDetailsAvailable, qrAvailable } from "@/lib/payment-options";
import { requireOrderPermission } from "@/lib/admin/permissions";

const QR_TYPES = ["image/png", "image/jpeg", "image/webp"];
const QR_MAX_BYTES = 2 * 1024 * 1024;

export async function getBankTransferConfig(): Promise<IBankTransferConfig | null> {
  await dbConnect();
  const config = await BankTransferConfig.findOne().sort({ createdAt: -1 }).lean();
  return toJSON(config) as unknown as IBankTransferConfig | null;
}

/** Returns the settings when bank details or the QR code are switched on, otherwise null. */
export async function getEnabledBankTransferConfig(): Promise<IBankTransferConfig | null> {
  try {
    const config = await getBankTransferConfig();
    return config && (bankDetailsAvailable(config) || qrAvailable(config)) ? config : null;
  } catch (error) {
    console.error("getEnabledBankTransferConfig error:", error);
    return null;
  }
}

export async function upsertBankTransferConfig(formData: FormData) {
  const perm = await requireOrderPermission("orders.update");
  if (!perm.allowed) throw new Error(perm.error);

  await dbConnect();
  const existing = await BankTransferConfig.findOne().sort({ createdAt: -1 });
  const text = (name: string) => formData.get(name)?.toString().trim() || "";

  const data: Partial<IBankTransferConfig> = {
    bankName: text("bankName"),
    accountTitle: text("accountTitle"),
    accountNumber: text("accountNumber") || undefined,
    iban: text("iban") || undefined,
    instructions: text("instructions") || undefined,
    enabled: formData.get("enabled")?.toString() === "true",
    qrEnabled: formData.get("qrEnabled")?.toString() === "true",
    qrLabel: text("qrLabel") || undefined,
    qrImageUrl: existing?.qrImageUrl,
  };

  if (data.enabled && (!data.bankName || !data.accountTitle)) {
    redirect("/admin/payments?error=bank");
  }

  const file = formData.get("qrImage");
  if (file instanceof File && file.size > 0) {
    if (!QR_TYPES.includes(file.type) || file.size > QR_MAX_BYTES) {
      redirect("/admin/payments?error=qr-file");
    }
    const blob = await put(`payments/qr-${Date.now()}-${file.name}`, file, {
      access: "public",
      addRandomSuffix: true,
    });
    data.qrImageUrl = blob.url;
  }
  if (formData.get("removeQr")?.toString() === "true") {
    data.qrImageUrl = undefined;
    data.qrEnabled = false;
  }
  if (data.qrEnabled && !data.qrImageUrl) {
    redirect("/admin/payments?error=qr-missing");
  }

  if (existing) {
    existing.set(data);
    if (!data.qrImageUrl) existing.set("qrImageUrl", undefined);
    await existing.save();
  } else {
    await BankTransferConfig.create(data);
  }

  revalidatePath("/admin/payments");
  revalidatePath("/checkout");
  redirect("/admin/payments?saved=1");
}
