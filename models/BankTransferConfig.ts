import mongoose, { Schema } from "mongoose";

/**
 * Manual (non-COD) payment settings, managed in Admin > Payment Settings.
 * `enabled` controls the bank account details; `qrEnabled` controls the QR code
 * (e.g. Raast, JazzCash or Easypaisa). Customers see the "Bank transfer / QR"
 * option when either one is on.
 */
export interface IBankTransferConfig {
  _id: string;
  bankName: string;
  accountTitle: string;
  accountNumber?: string;
  iban?: string;
  instructions?: string;
  enabled: boolean;
  qrEnabled?: boolean;
  qrImageUrl?: string;
  qrLabel?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

const BankTransferConfigSchema = new Schema(
  {
    bankName: { type: String, default: "" },
    accountTitle: { type: String, default: "" },
    accountNumber: { type: String },
    iban: { type: String },
    instructions: { type: String },
    enabled: { type: Boolean, default: true },
    qrEnabled: { type: Boolean, default: false },
    qrImageUrl: { type: String },
    qrLabel: { type: String },
  },
  { timestamps: true }
);

export const BankTransferConfig =
  (mongoose.models.BankTransferConfig as mongoose.Model<IBankTransferConfig>) ||
  mongoose.model<IBankTransferConfig>("BankTransferConfig", BankTransferConfigSchema);

