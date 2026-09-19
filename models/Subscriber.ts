import mongoose, { Schema } from "mongoose";

export interface ISubscriberAttribution {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  referrer?: string;
  landingPage?: string;
  affiliateCode?: string;
  partnerCode?: string;
  cafeQrCode?: string;
}

export interface ISubscriber {
  _id: string;
  email: string;
  normalizedEmail: string;
  source: "popup" | "footer" | "checkout" | string;
  subscribed: boolean;
  consentAt?: Date;
  consentSource?: string;
  signupPage?: string;
  attribution: ISubscriberAttribution;
  welcomeCodeStatus: "none" | "issued" | "resent" | "redeemed" | "expired" | "disabled";
  welcomeCodeIssuedAt?: Date;
  welcomeCodeExpiresAt?: Date;
  welcomeCodeRedeemedAt?: Date;
  welcomeOfferId?: string;
  relatedOrderId?: string;
  emailDeliveryStatus: "pending" | "sent" | "failed";
  emailProviderResponse?: string;
  emailFailureReason?: string;
  unsubscribed: boolean;
  unsubscribedAt?: Date;
  createdAt: Date | string;
  updatedAt: Date | string;
}

const SubscriberAttributionSchema = new Schema(
  {
    utmSource: { type: String },
    utmMedium: { type: String },
    utmCampaign: { type: String },
    utmContent: { type: String },
    utmTerm: { type: String },
    referrer: { type: String },
    landingPage: { type: String },
    affiliateCode: { type: String },
    partnerCode: { type: String },
    cafeQrCode: { type: String },
  },
  { _id: false }
);

const SubscriberSchema = new Schema(
  {
    email: { type: String, required: true, trim: true },
    normalizedEmail: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    source: { type: String, default: "popup" },
    subscribed: { type: Boolean, default: true },
    consentAt: { type: Date },
    consentSource: { type: String },
    signupPage: { type: String },
    attribution: { type: SubscriberAttributionSchema, default: {} },
    welcomeCodeStatus: { type: String, enum: ["none", "issued", "resent", "redeemed", "expired", "disabled"], default: "none" },
    welcomeCodeIssuedAt: { type: Date },
    welcomeCodeExpiresAt: { type: Date },
    welcomeCodeRedeemedAt: { type: Date },
    welcomeOfferId: { type: String, index: true },
    relatedOrderId: { type: String, index: true },
    emailDeliveryStatus: { type: String, enum: ["pending", "sent", "failed"], default: "pending" },
    emailProviderResponse: { type: String },
    emailFailureReason: { type: String },
    unsubscribed: { type: Boolean, default: false },
    unsubscribedAt: { type: Date },
  },
  { timestamps: true }
);

SubscriberSchema.index({ subscribed: 1, unsubscribed: 1 });

export const Subscriber =
  (mongoose.models.Subscriber as mongoose.Model<ISubscriber>) ||
  mongoose.model<ISubscriber>("Subscriber", SubscriberSchema);
