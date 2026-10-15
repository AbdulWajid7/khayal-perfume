import mongoose, { Schema } from "mongoose";

/**
 * Every change to stock, in and out: the audit trail and the purchase ledger the
 * accounts section reads (purchases carry what was paid).
 */
export type MovementType = "purchase" | "adjust" | "fill" | "order" | "return";

export interface IStockMovement {
  _id: string;
  itemKind: "supply" | "product";
  itemId: string;
  itemName: string;
  category: string;
  type: MovementType;
  /** Positive adds stock, negative removes it. */
  quantity: number;
  unit: string;
  unitCost?: number;
  totalCost?: number;
  supplier?: string;
  reason?: string;
  note?: string;
  orderNumber?: string;
  balanceAfter: number;
  date: Date | string;
  by?: string;
  createdAt: Date | string;
}

const StockMovementSchema = new Schema(
  {
    itemKind: { type: String, enum: ["supply", "product"], required: true },
    itemId: { type: String, required: true, index: true },
    itemName: { type: String, required: true },
    category: { type: String, default: "other", index: true },
    type: { type: String, enum: ["purchase", "adjust", "fill", "order", "return"], required: true, index: true },
    quantity: { type: Number, required: true },
    unit: { type: String, default: "pcs" },
    unitCost: { type: Number },
    totalCost: { type: Number },
    supplier: { type: String },
    reason: { type: String },
    note: { type: String },
    orderNumber: { type: String, index: true },
    balanceAfter: { type: Number, default: 0 },
    date: { type: Date, default: Date.now, index: true },
    by: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const StockMovement =
  (mongoose.models.StockMovement as mongoose.Model<IStockMovement>) ||
  mongoose.model<IStockMovement>("StockMovement", StockMovementSchema);
