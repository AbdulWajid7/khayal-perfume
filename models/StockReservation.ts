import mongoose, { Schema } from "mongoose";

export type ReservationStatus = "reserved" | "released" | "converted" | "expired";

export interface IStockReservation {
  _id: string;
  orderId: string;
  productId: string;
  variantId?: string;
  quantity: number;
  status: ReservationStatus;
  expiresAt: Date;
  createdAt: Date | string;
  updatedAt: Date | string;
}

const StockReservationSchema = new Schema(
  {
    orderId: { type: String, required: true, index: true },
    productId: { type: String, required: true, index: true },
    variantId: { type: String, index: true },
    quantity: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ["reserved", "released", "converted", "expired"], default: "reserved" },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

StockReservationSchema.index({ status: 1, expiresAt: 1 });

export const StockReservation =
  (mongoose.models.StockReservation as mongoose.Model<IStockReservation>) ||
  mongoose.model<IStockReservation>("StockReservation", StockReservationSchema);
