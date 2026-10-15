import mongoose, { Schema } from "mongoose";

/** Money the owner (or a partner) put into the business, or took out of it. */
export interface ICapitalEntry {
  _id: string;
  type: "investment" | "withdrawal";
  person: string;
  amount: number;
  date: Date | string;
  account: string;
  note?: string;
  by?: string;
  createdAt: Date | string;
}

const CapitalEntrySchema = new Schema(
  {
    type: { type: String, enum: ["investment", "withdrawal"], required: true },
    person: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true, index: true },
    account: { type: String, default: "bank" },
    note: { type: String },
    by: { type: String },
  },
  { timestamps: true }
);

export const CapitalEntry =
  (mongoose.models.CapitalEntry as mongoose.Model<ICapitalEntry>) ||
  mongoose.model<ICapitalEntry>("CapitalEntry", CapitalEntrySchema);
