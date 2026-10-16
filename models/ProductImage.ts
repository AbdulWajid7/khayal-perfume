import mongoose, { Schema } from "mongoose";

/**
 * Product photos uploaded in the admin when no Vercel Blob store is connected.
 * The browser shrinks each photo first (max 2000 px JPEG), so documents stay well under 16 MB.
 */
export interface IProductImage {
  _id: string;
  data: Buffer;
  contentType: string;
  size: number;
  handle?: string;
  uploadedBy?: string;
  createdAt: Date;
}

const ProductImageSchema = new Schema(
  {
    data: { type: Buffer, required: true },
    contentType: { type: String, required: true },
    size: { type: Number, required: true },
    handle: { type: String, index: true },
    uploadedBy: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const ProductImage =
  (mongoose.models.ProductImage as mongoose.Model<IProductImage>) ||
  mongoose.model<IProductImage>("ProductImage", ProductImageSchema);
