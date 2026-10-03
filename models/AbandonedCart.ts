import mongoose, { Schema } from "mongoose";

export interface IAbandonedCartItem {
  title: string;
  variantTitle?: string;
  quantity: number;
  price: number;
}

export interface IAbandonedCart {
  _id: string;
  sessionId: string;
  email?: string;
  phone?: string;
  name?: string;
  items: IAbandonedCartItem[];
  subtotal: number;
  status: "open" | "recovered";
  lastSeenAt: Date;
  createdAt: Date | string;
  updatedAt: Date | string;
}

const AbandonedCartSchema = new Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    email: { type: String },
    phone: { type: String },
    name: { type: String },
    items: [
      {
        title: { type: String, required: true },
        variantTitle: { type: String },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true },
      },
    ],
    subtotal: { type: Number, required: true },
    status: { type: String, enum: ["open", "recovered"], default: "open", index: true },
    lastSeenAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const AbandonedCart =
  (mongoose.models.AbandonedCart as mongoose.Model<IAbandonedCart>) ||
  mongoose.model<IAbandonedCart>("AbandonedCart", AbandonedCartSchema);
