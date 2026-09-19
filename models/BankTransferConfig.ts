import mongoose, { Schema } from "mongoose";

export interface IBankTransferConfig {
  _id: string;
  bankName: string;
  accountTitle: string;
  accountNumber?: string;
  iban?: string;
  instructions?: string;
  enabled: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

const BankTransferConfigSchema = new Schema(
  {
    bankName: { type: String, required: true },
    accountTitle: { type: String, required: true },
    accountNumber: { type: String },
    iban: { type: String },
    instructions: { type: String },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const BankTransferConfig =
  (mongoose.models.BankTransferConfig as mongoose.Model<IBankTransferConfig>) ||
  mongoose.model<IBankTransferConfig>("BankTransferConfig", BankTransferConfigSchema);
