import mongoose, { Schema } from "mongoose";

export interface IPost {
  _id: string;
  title: string;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  canonicalUrl?: string;
  noIndex: boolean;
  noFollow: boolean;
  ogImage?: string;
  schemaType: "Article" | "BlogPosting" | "NewsArticle";
  publishedAt: Date;
  excerpt: string;
  coverImage?: {
    url: string;
    alt?: string;
  };
  content: string;
  tags: string[];
  readTime: number;
  status: "draft" | "published";
  authorId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    metaTitle: { type: String },
    metaDescription: { type: String },
    focusKeyword: { type: String },
    canonicalUrl: { type: String },
    noIndex: { type: Boolean, default: false },
    noFollow: { type: Boolean, default: false },
    ogImage: { type: String },
    schemaType: { type: String, enum: ["Article", "BlogPosting", "NewsArticle"], default: "BlogPosting" },
    publishedAt: { type: Date, required: true },
    excerpt: { type: String, required: true, maxlength: 300 },
    coverImage: {
      url: { type: String },
      alt: { type: String },
    },
    content: { type: String, default: "" },
    tags: { type: [String], default: [] },
    readTime: { type: Number, default: 5 },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Post = (mongoose.models.Post as mongoose.Model<IPost>) || mongoose.model<IPost>("Post", PostSchema);
