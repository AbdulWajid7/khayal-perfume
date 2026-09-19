import mongoose, { Schema } from "mongoose";

export interface IWelcomeDiscountConfig {
  _id: string;
  enabled: boolean;
  percentage: number;
  maxDiscount: number;
  validityDays: number;
  popupDelaySeconds: number;
  dismissalSuppressionDays: number;
  campaignStartDate?: Date;
  campaignEndDate?: Date;
  eligibleProductIds?: string[];
  eligibleCategory?: string;
  emailSubject: string;
  emailPreviewText: string;
  updatedAt: Date | string;
  createdAt: Date | string;
}

const WelcomeDiscountConfigSchema = new Schema(
  {
    enabled: { type: Boolean, default: false },
    percentage: { type: Number, default: 5, min: 0, max: 100 },
    maxDiscount: { type: Number, default: 500, min: 0 },
    validityDays: { type: Number, default: 7, min: 1 },
    popupDelaySeconds: { type: Number, default: 10, min: 0 },
    dismissalSuppressionDays: { type: Number, default: 7, min: 0 },
    campaignStartDate: { type: Date },
    campaignEndDate: { type: Date },
    eligibleProductIds: { type: [String], default: undefined },
    eligibleCategory: { type: String },
    emailSubject: { type: String, default: "Welcome to KHAYAL — Your 5% Code Is Inside" },
    emailPreviewText: { type: String, default: "A personal welcome offer for your first KHAYAL order." },
  },
  { timestamps: true }
);

export const WelcomeDiscountConfig =
  (mongoose.models.WelcomeDiscountConfig as mongoose.Model<IWelcomeDiscountConfig>) ||
  mongoose.model<IWelcomeDiscountConfig>("WelcomeDiscountConfig", WelcomeDiscountConfigSchema);
