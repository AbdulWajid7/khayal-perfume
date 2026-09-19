"use server";

import { dbConnect, toJSON } from "@/lib/mongoose";
import { BankTransferConfig, type IBankTransferConfig } from "@/models/BankTransferConfig";
import { requireOrderPermission } from "@/lib/admin/permissions";

export async function getBankTransferConfig(): Promise<IBankTransferConfig | null> {
  await dbConnect();
  const config = await BankTransferConfig.findOne().sort({ createdAt: -1 }).lean();
  return toJSON(config) as unknown as IBankTransferConfig | null;
}

export async function getEnabledBankTransferConfig(): Promise<IBankTransferConfig | null> {
  const config = await getBankTransferConfig();
  return config && config.enabled ? config : null;
}

export async function upsertBankTransferConfig(formData: FormData) {
  const perm = await requireOrderPermission("orders.update");
  if (!perm.allowed) throw new Error(perm.error);

  await dbConnect();
  const existing = await BankTransferConfig.findOne().sort({ createdAt: -1 });
  const data = {
    bankName: formData.get("bankName")?.toString().trim() || "",
    accountTitle: formData.get("accountTitle")?.toString().trim() || "",
    accountNumber: formData.get("accountNumber")?.toString().trim() || undefined,
    iban: formData.get("iban")?.toString().trim() || undefined,
    instructions: formData.get("instructions")?.toString().trim() || undefined,
    enabled: formData.get("enabled")?.toString() === "true",
  };

  if (!data.bankName || !data.accountTitle) {
    throw new Error("Bank name and account title are required");
  }

  if (existing) {
    existing.set(data);
    await existing.save();
  } else {
    await BankTransferConfig.create(data);
  }
}
