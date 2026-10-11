import mongoose, { Schema } from "mongoose";

/**
 * One entry in the WhatsApp assistant's answer library.
 * - live:      the bot uses it
 * - suggested: drafted by the daily training run, waiting for someone to approve it in admin
 */
export interface IBotAnswer {
  _id: string;
  question: string;
  answer: string;
  keywords: string[];
  status: "live" | "suggested";
  source: "admin" | "training";
  /** Example customer message that led to a suggested answer. */
  exampleMessage?: string;
  timesUsed: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

const BotAnswerSchema = new Schema(
  {
    question: { type: String, required: true, trim: true, maxlength: 300 },
    answer: { type: String, required: true, trim: true, maxlength: 1500 },
    keywords: { type: [String], default: [] },
    status: { type: String, enum: ["live", "suggested"], default: "live", index: true },
    source: { type: String, enum: ["admin", "training"], default: "admin" },
    exampleMessage: { type: String, maxlength: 1000 },
    timesUsed: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const BotAnswer =
  (mongoose.models.BotAnswer as mongoose.Model<IBotAnswer>) ||
  mongoose.model<IBotAnswer>("BotAnswer", BotAnswerSchema);
