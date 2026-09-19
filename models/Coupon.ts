import mongoose, { Schema } from "mongoose";

export type DiscountType = "fixed" | "percentage";

export interface ICoupon {
  _id: string;
  code: string;
  description?: string;
  discountType: DiscountType;
  value: number;
  minimumOrderAmount?: number;
  maxUses?: number;
  usedCount: number;
  startsAt?: Date;
  expiresAt?: Date;
  enabled: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

const CouponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    description: { type: String },
    discountType: { type: String, enum: ["fixed", "percentage"], required: true },
    value: { type: Number, required: true, min: 0 },
    minimumOrderAmount: { type: Number, min: 0 },
    maxUses: { type: Number, min: 1 },
    usedCount: { type: Number, default: 0, min: 0 },
    startsAt: { type: Date },
    expiresAt: { type: Date },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Coupon =
  (mongoose.models.Coupon as mongoose.Model<ICoupon>) || mongoose.model<ICoupon>("Coupon", CouponSchema);
