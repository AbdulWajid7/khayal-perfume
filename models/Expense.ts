import mongoose, { Schema } from "mongoose";

/** A business expense or bill (rent, ads, courier, printing...). Owner's accounts. */
export interface IExpense {
  _id: string;
  date: Date | string;
  category: string;
  description: string;
  amount: number;
  /** Money account it was (or will be) paid from. */
  account: string;
  vendor?: string;
  status: "paid" | "due";
  dueDate?: Date | string;
  paidAt?: Date | string;
  note?: string;
  by?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

const ExpenseSchema = new Schema(
  {
    date: { type: Date, required: true, index: true },
    category: { type: String, required: true, index: true },
    description: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    account: { type: String, default: "cash" },
    vendor: { type: String, trim: true },
    status: { type: String, enum: ["paid", "due"], default: "paid", index: true },
    dueDate: { type: Date },
    paidAt: { type: Date },
    note: { type: String },
    by: { type: String },
  },
  { timestamps: true }
);

export const Expense =
  (mongoose.models.Expense as mongoose.Model<IExpense>) || mongoose.model<IExpense>("Expense", ExpenseSchema);
