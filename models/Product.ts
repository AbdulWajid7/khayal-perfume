import mongoose, { Schema } from "mongoose";

export interface IVariant {
  id: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  sku?: string;
  stock: number;
  availableForSale: boolean;
}

export interface IProduct {
  _id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml?: string;
  price: number;
  compareAtPrice?: number;
  cost?: number;
  sku?: string;
  stock: number;
  lowStockThreshold: number;
  status: "active" | "draft" | "archived";
  images: string[];
  category: string;
  tags: string[];
  variants: IVariant[];
  scentNotes?: { top?: string[]; heart?: string[]; base?: string[] };
  longevity?: string;
  occasion?: string;
  dayNight?: string;
  season?: string;
  intensity?: string;
  accentColor?: string;
  backgroundColor?: string;
  storyImage?: string;
  transparentBottleImage?: string;
  threeDModelUrl?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

const VariantSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number },
    sku: { type: String },
    stock: { type: Number, default: 0, min: 0 },
    availableForSale: { type: Boolean, default: true },
  },
  { _id: false }
);

const ProductSchema = new Schema(
  {
    title: { type: String, required: true },
    handle: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    descriptionHtml: { type: String },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number },
    cost: { type: Number, default: 0 },
    sku: { type: String },
    stock: { type: Number, default: 0, min: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    status: { type: String, enum: ["active", "draft", "archived"], default: "draft" },
    images: { type: [String], default: [] },
    category: { type: String, default: "Unisex" },
    tags: { type: [String], default: [] },
    variants: { type: [VariantSchema], default: [] },
    scentNotes: {
      top: { type: [String], default: [] },
      heart: { type: [String], default: [] },
      base: { type: [String], default: [] },
    },
    longevity: { type: String },
    occasion: { type: String },
    dayNight: { type: String },
    season: { type: String },
    intensity: { type: String },
    accentColor: { type: String },
    backgroundColor: { type: String },
    storyImage: { type: String },
    transparentBottleImage: { type: String },
    threeDModelUrl: { type: String },
  },
  { timestamps: true }
);

export const Product =
  (mongoose.models.Product as mongoose.Model<IProduct>) ||
  mongoose.model<IProduct>("Product", ProductSchema);
