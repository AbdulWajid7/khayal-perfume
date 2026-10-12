import mongoose, { Schema } from "mongoose";
import type { CostRow } from "@/lib/cost-calc";

/**
 * The owner's private cost and profit sheet (one document). Admin-only: it holds
 * supplier prices and internal reference names, so nothing public may read it
 * (not the storefront, the WhatsApp bot or the journal autopilot).
 */
export interface ICostSheet {
  _id: string;
  supplierStatedTotal: number;
  rows: CostRow[];
  updatedBy?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

const RowSchema = new Schema(
  {
    realName: { type: String, default: "" },
    khayalName: { type: String, default: "" },
    makerQtyMl: { type: Number, default: 0 },
    makerPrice: { type: Number, default: 0 },
    bottleMl: { type: Number, default: 50 },
    boxPrice: { type: Number, default: 0 },
    packagingPrice: { type: Number, default: 0 },
    otherCost: { type: Number, default: 0 },
    sellingPrice: { type: Number, default: 0 },
    commissionRate: { type: Number, default: 0 },
  },
  { _id: false }
);

const CostSheetSchema = new Schema(
  {
    supplierStatedTotal: { type: Number, default: 0 },
    rows: { type: [RowSchema], default: [] },
    updatedBy: { type: String },
  },
  { timestamps: true }
);

export const CostSheet =
  (mongoose.models.CostSheet as mongoose.Model<ICostSheet>) ||
  mongoose.model<ICostSheet>("CostSheet", CostSheetSchema);
