import mongoose, { Schema } from "mongoose";

export interface IReview {
  _id: string;
  productId: string;
  productHandle: string;
  productTitle: string;
  name: string;
  rating: number;
  comment: string;
  orderNumber?: string;
  verifiedPurchase: boolean;
  status: "pending" | "approved" | "rejected";
  createdAt: Date | string;
  updatedAt: Date | string;
}

const ReviewSchema = new Schema(
  {
    productId: { type: String, required: true, index: true },
    productHandle: { type: String, required: true, index: true },
    productTitle: { type: String, required: true },
    name: { type: String, required: true, maxlength: 80 },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, maxlength: 2000 },
    orderNumber: { type: String },
    verifiedPurchase: { type: Boolean, default: false },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending", index: true },
  },
  { timestamps: true }
);

export const Review =
  (mongoose.models.Review as mongoose.Model<IReview>) ||
  mongoose.model<IReview>("Review", ReviewSchema);
