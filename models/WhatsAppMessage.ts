import mongoose, { Schema } from "mongoose";

/**
 * How a WhatsApp message was handled:
 * - flow:     part of the button/order flow (menu, product, address, payment...)
 * - ai:       answered by the AI assistant
 * - library:  answered from the answer library without AI
 * - fallback: nothing could answer it, the customer was shown the menu
 */
export type WhatsAppMessageHandler = "flow" | "ai" | "library" | "fallback";

export interface IWhatsAppMessage {
  _id: string;
  waId: string;
  direction: "in" | "out";
  text: string;
  replyId?: string;
  handledBy?: WhatsAppMessageHandler;
  /** The bot could not answer, so the question goes to the training queue. */
  unanswered: boolean;
  /** The customer asked for a person, or the assistant judged a person should reply. */
  needsHuman: boolean;
  /** Set once someone in admin has dealt with the question. */
  reviewed: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

const WhatsAppMessageSchema = new Schema(
  {
    waId: { type: String, required: true, index: true },
    direction: { type: String, enum: ["in", "out"], required: true },
    text: { type: String, default: "" },
    replyId: { type: String },
    handledBy: { type: String, enum: ["flow", "ai", "library", "fallback"] },
    unanswered: { type: Boolean, default: false },
    needsHuman: { type: Boolean, default: false },
    reviewed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

WhatsAppMessageSchema.index({ waId: 1, createdAt: -1 });
WhatsAppMessageSchema.index({ unanswered: 1, reviewed: 1, createdAt: -1 });
WhatsAppMessageSchema.index({ needsHuman: 1, reviewed: 1, createdAt: -1 });
// Chat logs are kept for 180 days.
WhatsAppMessageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 180 * 24 * 60 * 60 });

export const WhatsAppMessage =
  (mongoose.models.WhatsAppMessage as mongoose.Model<IWhatsAppMessage>) ||
  mongoose.model<IWhatsAppMessage>("WhatsAppMessage", WhatsAppMessageSchema);
