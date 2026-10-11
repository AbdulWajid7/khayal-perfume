import type { IBankTransferConfig } from "@/models/BankTransferConfig";

// Pure helpers (no database imports) so client components can use them too.
export function bankDetailsAvailable(config?: Pick<IBankTransferConfig, "enabled" | "bankName" | "accountTitle" | "qrEnabled" | "qrImageUrl"> | null): boolean {
  return Boolean(config?.enabled && config.bankName && config.accountTitle);
}

export function qrAvailable(config?: Pick<IBankTransferConfig, "enabled" | "bankName" | "accountTitle" | "qrEnabled" | "qrImageUrl"> | null): boolean {
  return Boolean(config?.qrEnabled && config.qrImageUrl);
}
