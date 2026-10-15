import mongoose, { Schema } from "mongoose";

/**
 * A supply KHAYAL keeps in stock: fragrance oil, empty bottles, boxes, testers,
 * bags, cards, shipping material. Finished 50 ml perfumes are not here: their stock
 * lives on the website product (so checkout and the stock page always agree).
 */
export type StockCategory =
  | "oil"
  | "bottle"
  | "box"
  | "tester"
  | "packaging"
  | "shipping"
  | "other";

/** How the item is used up automatically when an order is packed. */
export type UsageBasis = "none" | "per_order" | "per_bottle";

export interface IStockItem {
  _id: string;
  name: string;
  category: StockCategory;
  unit: string;
  quantity: number;
  lowStockAt: number;
  /** Weighted average price paid per unit (PKR). */
  avgUnitCost: number;
  usageBasis: UsageBasis;
  usageQty: number;
  supplier?: string;
  sku?: string;
  notes?: string;
  active: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

const StockItemSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["oil", "bottle", "box", "tester", "packaging", "shipping", "other"],
      default: "other",
      index: true,
    },
    unit: { type: String, default: "pcs", trim: true },
    quantity: { type: Number, default: 0 },
    lowStockAt: { type: Number, default: 0, min: 0 },
    avgUnitCost: { type: Number, default: 0, min: 0 },
    usageBasis: { type: String, enum: ["none", "per_order", "per_bottle"], default: "none" },
    usageQty: { type: Number, default: 0, min: 0 },
    supplier: { type: String, trim: true },
    sku: { type: String, trim: true },
    notes: { type: String },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const StockItem =
  (mongoose.models.StockItem as mongoose.Model<IStockItem>) ||
  mongoose.model<IStockItem>("StockItem", StockItemSchema);
