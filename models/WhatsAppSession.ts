import mongoose, { Schema } from "mongoose";

export type WhatsAppBotState =
  | "menu"
  | "browse"
  | "product"
  | "quantity"
  | "name"
  | "city_province"
  | "address"
  | "payment"
  | "confirm"
  | "track";

export interface IWhatsAppSession {
  waId: string;
  state: WhatsAppBotState;
  productId?: string;
  variantId?: string;
  quantity?: number;
  customerName?: string;
  city?: string;
  province?: string;
  addressLine?: string;
  paymentMethod?: "cod" | "bank_transfer";
  orderKey?: string;
  trackPhone?: string;
  lastMessageId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const WhatsAppSessionSchema = new Schema(
  {
    waId: { type: String, required: true, unique: true, index: true },
    state: { type: String, required: true, default: "menu" },
    productId: { type: String },
    variantId: { type: String },
    quantity: { type: Number },
    customerName: { type: String },
    city: { type: String },
    province: { type: String },
    addressLine: { type: String },
    paymentMethod: { type: String, enum: ["cod", "bank_transfer"] },
    orderKey: { type: String },
    trackPhone: { type: String },
    lastMessageId: { type: String },
  },
  { timestamps: true }
);

// Sessions auto-expire after 24h of inactivity
WhatsAppSessionSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 86400 });

export const WhatsAppSession =
  (mongoose.models.WhatsAppSession as mongoose.Model<IWhatsAppSession>) ||
  mongoose.model<IWhatsAppSession>("WhatsAppSession", WhatsAppSessionSchema);
