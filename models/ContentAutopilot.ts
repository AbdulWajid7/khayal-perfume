import mongoose, { Schema } from "mongoose";

export type AutopilotKind = "blog" | "article";

export interface IAutopilotRun {
  kind: AutopilotKind;
  at: Date | string;
  status: "published" | "draft" | "failed";
  title?: string;
  postId?: string;
  note?: string;
}

/** Settings and recent history for the daily journal autopilot (one document). */
export interface IContentAutopilot {
  _id: string;
  enabled: boolean;
  /** When off, generated posts are saved as drafts for review instead of going live. */
  autoPublish: boolean;
  runs: IAutopilotRun[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

const RunSchema = new Schema(
  {
    kind: { type: String, enum: ["blog", "article"], required: true },
    at: { type: Date, required: true },
    status: { type: String, enum: ["published", "draft", "failed"], required: true },
    title: { type: String },
    postId: { type: String },
    note: { type: String },
  },
  { _id: false }
);

const ContentAutopilotSchema = new Schema(
  {
    enabled: { type: Boolean, default: true },
    autoPublish: { type: Boolean, default: true },
    runs: { type: [RunSchema], default: [] },
  },
  { timestamps: true }
);

export const ContentAutopilot =
  (mongoose.models.ContentAutopilot as mongoose.Model<IContentAutopilot>) ||
  mongoose.model<IContentAutopilot>("ContentAutopilot", ContentAutopilotSchema);
