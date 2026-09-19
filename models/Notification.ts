import mongoose, { Schema } from "mongoose";

export type NotificationType = "customer_order_confirmation" | "admin_new_order" | "admin_payment_proof";
export type NotificationChannel = "email" | "sms" | "whatsapp";
export type NotificationStatus = "pending" | "sent" | "failed";

export interface INotification {
  _id: string;
  type: NotificationType;
  channel: NotificationChannel;
  recipient: string;
  orderId: string;
  subject?: string;
  body: string;
  status: NotificationStatus;
  providerResponse?: string;
  error?: string;
  sentAt?: Date;
  createdAt: Date | string;
  updatedAt: Date | string;
}

const NotificationSchema = new Schema(
  {
    type: { type: String, enum: ["customer_order_confirmation", "admin_new_order", "admin_payment_proof"], required: true },
    channel: { type: String, enum: ["email", "sms", "whatsapp"], required: true },
    recipient: { type: String, required: true },
    orderId: { type: String, required: true, index: true },
    subject: { type: String },
    body: { type: String, required: true },
    status: { type: String, enum: ["pending", "sent", "failed"], default: "pending" },
    providerResponse: { type: String },
    error: { type: String },
    sentAt: { type: Date },
  },
  { timestamps: true }
);

NotificationSchema.index({ status: 1, createdAt: 1 });

export const Notification =
  (mongoose.models.Notification as mongoose.Model<INotification>) ||
  mongoose.model<INotification>("Notification", NotificationSchema);
