import mongoose, { Schema } from "mongoose";

export interface ISubscriber {
  _id: string;
  email: string;
  source: "popup" | "footer" | string;
  subscribed: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

const SubscriberSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    source: { type: String, default: "popup" },
    subscribed: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Subscriber = (mongoose.models.Subscriber as mongoose.Model<ISubscriber>) ||
  mongoose.model<ISubscriber>("Subscriber", SubscriberSchema);
