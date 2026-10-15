import mongoose, { Schema } from "mongoose";

/**
 * A promoter or partner (e.g. The Terrace Cafe). Orders that use one of their codes
 * (or that the owner tags to them) earn them a share of the profit. They sign in to
 * the partner portal at /partner with their own email and password.
 */
export interface IPromoterPayout {
  _id?: string;
  amount: number;
  paidAt: Date | string;
  note?: string;
  recordedBy?: string;
}

export interface IPromoter {
  _id: string;
  name: string;
  contactName?: string;
  phone?: string;
  email: string;
  passwordHash?: string;
  /** Discount codes credited to this promoter (uppercase). */
  codes: string[];
  /** Share of profit, 0.2 = 20%. */
  commissionRate: number;
  active: boolean;
  notes?: string;
  /** Orders credited by hand (e.g. WhatsApp orders where the customer mentioned them). */
  taggedOrders: string[];
  payouts: IPromoterPayout[];
  lastLoginAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

const PayoutSchema = new Schema(
  {
    amount: { type: Number, required: true, min: 0 },
    paidAt: { type: Date, required: true },
    note: { type: String },
    recordedBy: { type: String },
  },
  { _id: true }
);

const PromoterSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    contactName: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    codes: { type: [String], default: [], index: true },
    commissionRate: { type: Number, default: 0.2, min: 0, max: 1 },
    active: { type: Boolean, default: true },
    notes: { type: String },
    taggedOrders: { type: [String], default: [] },
    payouts: { type: [PayoutSchema], default: [] },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

export const Promoter =
  (mongoose.models.Promoter as mongoose.Model<IPromoter>) ||
  mongoose.model<IPromoter>("Promoter", PromoterSchema);
