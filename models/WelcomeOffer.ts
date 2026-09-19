import mongoose, { Schema } from "mongoose";

export type WelcomeOfferStatus = "active" | "redeemed" | "expired" | "disabled";

export interface IWelcomeOffer {
  _id: string;
  codeHash: string;
  codeEncrypted: string;
  codeHint?: string;
  subscriberId: string;
  normalizedEmail: string;
  type: "WELCOME_FIRST_ORDER";
  discountType: "PERCENTAGE";
  value: number;
  maxDiscount: number;
  currency: string;
  validityDays: number;
  status: WelcomeOfferStatus;
  stackable: boolean;
  channel: string;
  issuedAt: Date;
  expiresAt: Date;
  redeemedAt?: Date;
  orderId?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

const WelcomeOfferSchema = new Schema(
  {
    codeHash: { type: String, required: true, unique: true, index: true },
    codeEncrypted: { type: String, required: true },
    codeHint: { type: String },
    subscriberId: { type: String, required: true, index: true },
    normalizedEmail: { type: String, required: true, lowercase: true, trim: true, index: true },
    type: { type: String, enum: ["WELCOME_FIRST_ORDER"], default: "WELCOME_FIRST_ORDER" },
    discountType: { type: String, enum: ["PERCENTAGE"], default: "PERCENTAGE" },
    value: { type: Number, required: true, min: 0 },
    maxDiscount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "PKR" },
    validityDays: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ["active", "redeemed", "expired", "disabled"], default: "active" },
    stackable: { type: Boolean, default: false },
    channel: { type: String, default: "KHAYAL_WEBSITE" },
    issuedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    redeemedAt: { type: Date },
    orderId: { type: String, index: true },
  },
  { timestamps: true }
);

WelcomeOfferSchema.index({ status: 1, expiresAt: 1 });

export const WelcomeOffer =
  (mongoose.models.WelcomeOffer as mongoose.Model<IWelcomeOffer>) ||
  mongoose.model<IWelcomeOffer>("WelcomeOffer", WelcomeOfferSchema);
