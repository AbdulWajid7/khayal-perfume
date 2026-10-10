import mongoose, { Schema } from "mongoose";

/**
 * Records whether a WhatsApp customer agreed to receive marketing messages
 * (new scents, offers). Meta requires this opt-in before sending marketing templates.
 */
export interface IWhatsAppOptIn {
  waId: string;
  optedIn: boolean;
  source: string;
  decidedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WhatsAppOptInSchema = new Schema(
  {
    waId: { type: String, required: true, unique: true, index: true },
    optedIn: { type: Boolean, required: true },
    source: { type: String, default: "whatsapp_bot_after_order" },
    decidedAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export const WhatsAppOptIn =
  (mongoose.models.WhatsAppOptIn as mongoose.Model<IWhatsAppOptIn>) ||
  mongoose.model<IWhatsAppOptIn>("WhatsAppOptIn", WhatsAppOptInSchema);
