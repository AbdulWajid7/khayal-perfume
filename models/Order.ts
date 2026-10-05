import mongoose, { Schema } from "mongoose";

export type OrderStatus =
  | "draft"
  | "pending_confirmation"
  | "payment_review"
  | "confirmed"
  | "processing"
  | "packed"
  | "dispatched"
  | "delivered"
  | "cancelled"
  | "return_requested"
  | "returned";

export type PaymentStatus =
  | "unpaid"
  | "pending_verification"
  | "paid"
  | "rejected"
  | "refunded"
  | "partially_refunded";

export type PaymentMethod = "cod" | "bank_transfer";

export type DeliveryMethod = "self_delivery" | "nationwide_courier";

export type Courier = "self_delivery" | "leopards" | "tcs" | "unassigned";

export type SalesChannel = "KHAYAL_WEBSITE" | "KHAYAL_WHATSAPP";

export interface IOrderAddress {
  line: string;
  area: string;
  city: string;
  province: string;
  postalCode?: string;
  instructions?: string;
}

export interface IOrderCustomer {
  name: string;
  email?: string;
  phone: string;
  normalizedPhone: string;
  address: IOrderAddress;
}

export interface IOrderItem {
  productId: string;
  variantId?: string;
  sku?: string;
  name: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  image?: string;
}

export interface IOrderAttribution {
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

export interface IOrderAuditEntry {
  actor: string;
  actorId?: string;
  action: string;
  before?: Record<string, string | number | boolean | Date | null | undefined>;
  after?: Record<string, string | number | boolean | Date | null | undefined>;
  note?: string;
  createdAt: Date;
}

export interface IPaymentVerification {
  status: Extract<PaymentStatus, "pending_verification" | "paid" | "rejected">;
  verifiedBy?: string;
  verifiedById?: string;
  verifiedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  senderName: string;
  referenceNumber: string;
  transferDate: string;
  proofUrl: string;
  proofFilename: string;
}

export interface IOrder {
  _id: string;
  orderNumber: string;
  idempotencyKey: string;
  channel: SalesChannel;
  brandId?: string;
  customer: IOrderCustomer;
  items: IOrderItem[];
  subtotal: number;
  preDiscountSubtotal: number;
  postDiscountSubtotal: number;
  discount: number;
  discountCode?: string;
  discountCodeHash?: string;
  couponId?: string;
  couponType?: string;
  discountPercentage?: number;
  discountMaxAmount?: number;
  subscriberId?: string;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  fulfilmentStatus: string;
  deliveryMethod: DeliveryMethod;
  courier: Courier;
  trackingNumber?: string;
  customerNotes?: string;
  internalNotes?: string;
  attribution: IOrderAttribution;
  paymentVerification?: IPaymentVerification;
  auditHistory: IOrderAuditEntry[];
  confirmationTime?: Date;
  dispatchTime?: Date;
  deliveryTime?: Date;
  cancellationTime?: Date;
  cancellationReason?: string;
  expectedDeliveryText: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

const OrderAddressSchema = new Schema(
  {
    line: { type: String, required: true },
    area: { type: String, required: true },
    city: { type: String, required: true },
    province: { type: String, required: true },
    postalCode: { type: String },
    instructions: { type: String },
  },
  { _id: false }
);

const OrderCustomerSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String, required: true },
    normalizedPhone: { type: String, required: true },
    address: { type: OrderAddressSchema, required: true },
  },
  { _id: false }
);

const OrderItemSchema = new Schema(
  {
    productId: { type: String, required: true },
    variantId: { type: String },
    sku: { type: String },
    name: { type: String, required: true },
    variantName: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
    image: { type: String },
  },
  { _id: false }
);

const AttributionSchema = new Schema(
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

const AuditEntrySchema = new Schema(
  {
    actor: { type: String, required: true },
    actorId: { type: String },
    action: { type: String, required: true },
    before: { type: Schema.Types.Mixed },
    after: { type: Schema.Types.Mixed },
    note: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const PaymentVerificationSchema = new Schema(
  {
    status: { type: String, enum: ["pending_verification", "paid", "rejected"], required: true },
    verifiedBy: { type: String },
    verifiedById: { type: String },
    verifiedAt: { type: Date },
    rejectedAt: { type: Date },
    rejectionReason: { type: String },
    senderName: { type: String, required: true },
    referenceNumber: { type: String, required: true },
    transferDate: { type: String, required: true },
    proofUrl: { type: String, required: true },
    proofFilename: { type: String, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    idempotencyKey: { type: String, required: true, unique: true, index: true },
    channel: { type: String, enum: ["KHAYAL_WEBSITE", "KHAYAL_WHATSAPP"], default: "KHAYAL_WEBSITE" },
    brandId: { type: String, index: true },
    customer: { type: OrderCustomerSchema, required: true },
    items: { type: [OrderItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    preDiscountSubtotal: { type: Number, required: true, min: 0 },
    postDiscountSubtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    discountCode: { type: String, index: true },
    discountCodeHash: { type: String, index: true },
    couponId: { type: String, index: true },
    couponType: { type: String, index: true },
    discountPercentage: { type: Number },
    discountMaxAmount: { type: Number },
    subscriberId: { type: String, index: true },
    shipping: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "PKR" },
    paymentMethod: { type: String, enum: ["cod", "bank_transfer"], required: true },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "pending_verification", "paid", "rejected", "refunded", "partially_refunded"],
      default: "unpaid",
    },
    orderStatus: {
      type: String,
      enum: [
        "draft",
        "pending_confirmation",
        "payment_review",
        "confirmed",
        "processing",
        "packed",
        "dispatched",
        "delivered",
        "cancelled",
        "return_requested",
        "returned",
      ],
      default: "pending_confirmation",
    },
    fulfilmentStatus: { type: String, default: "unfulfilled" },
    deliveryMethod: { type: String, enum: ["self_delivery", "nationwide_courier"], required: true },
    courier: { type: String, enum: ["self_delivery", "leopards", "tcs", "unassigned"], default: "unassigned" },
    trackingNumber: { type: String },
    customerNotes: { type: String },
    internalNotes: { type: String },
    attribution: { type: AttributionSchema, default: {} },
    paymentVerification: { type: PaymentVerificationSchema },
    auditHistory: { type: [AuditEntrySchema], default: [] },
    confirmationTime: { type: Date },
    dispatchTime: { type: Date },
    deliveryTime: { type: Date },
    cancellationTime: { type: Date },
    cancellationReason: { type: String },
    expectedDeliveryText: { type: String, required: true },
  },
  { timestamps: true }
);

OrderSchema.index({ "customer.normalizedPhone": 1 });
OrderSchema.index({ orderStatus: 1, paymentStatus: 1 });
OrderSchema.index({ "customer.address.city": 1 });
OrderSchema.index({ courier: 1 });
OrderSchema.index({ channel: 1, brandId: 1 });
OrderSchema.index({ createdAt: -1 });

export const Order =
  (mongoose.models.Order as mongoose.Model<IOrder>) || mongoose.model<IOrder>("Order", OrderSchema);
