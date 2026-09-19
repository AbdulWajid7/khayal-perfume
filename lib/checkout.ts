"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { dbConnect, toJSON } from "@/lib/mongoose";
import { Product, type IProduct } from "@/models/Product";
import { Order, type IOrder, type IOrderItem, type IOrderCustomer, type OrderStatus, type PaymentStatus } from "@/models/Order";
import { StockReservation } from "@/models/StockReservation";
import { calculateShipping, getDeliveryMethod, getExpectedDeliveryText, isKarachi } from "@/lib/shipping";
import { normalizePhone, isValidPakistaniMobile } from "@/lib/phone";
import { incrementCouponUsage } from "@/lib/coupons";
import { applyDiscountCode } from "@/lib/discounts";
import { redeemWelcomeOffer } from "@/lib/welcome-offers";
import { sendOrderNotifications } from "@/lib/notifications";
import { captureAttribution } from "@/lib/attribution";
import { siteConfig } from "@/lib/site-config";

const MAX_QUANTITY_PER_ITEM = 10;
const BANK_TRANSFER_RESERVATION_HOURS = Number(process.env.BANK_TRANSFER_RESERVATION_HOURS || "24");
const COD_RESERVATION_HOURS = Number(process.env.COD_RESERVATION_HOURS || "168"); // 7 days
const KHAYAL_BRAND_ID = process.env.KHAYAL_BRAND_ID || "khayal-fragrance";

export interface CartItemInput {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface CreateOrderInput {
  idempotencyKey: string;
  customer: {
    name: string;
    email?: string;
    phone: string;
  };
  address: {
    line: string;
    area: string;
    city: string;
    province: string;
    postalCode?: string;
    instructions?: string;
  };
  items: CartItemInput[];
  paymentMethod: "cod" | "bank_transfer";
  customerNotes?: string;
  discountCode?: string;
}

const CustomerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(100).optional().or(z.literal("")),
  phone: z.string().min(10).max(20),
});

const AddressSchema = z.object({
  line: z.string().min(5).max(200),
  area: z.string().min(2).max(100),
  city: z.string().min(2).max(100),
  province: z.string().min(2).max(100),
  postalCode: z.string().max(20).optional().or(z.literal("")),
  instructions: z.string().max(500).optional().or(z.literal("")),
});

const ItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1).optional(),
  quantity: z.number().int().min(1).max(MAX_QUANTITY_PER_ITEM),
});

const CreateOrderSchema = z.object({
  idempotencyKey: z.string().uuid().min(1),
  customer: CustomerSchema,
  address: AddressSchema,
  items: z.array(ItemSchema).min(1).max(20),
  paymentMethod: z.enum(["cod", "bank_transfer"]),
  customerNotes: z.string().max(500).optional().or(z.literal("")),
  discountCode: z.string().max(50).optional().or(z.literal("")),
});

export type CheckoutResult =
  | { success: true; order: IOrder }
  | { success: false; error: string; field?: string };

export async function createOrder(input: CreateOrderInput): Promise<CheckoutResult> {
  await dbConnect();

  const parsed = CreateOrderSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { success: false, error: issue.message, field: issue.path.join(".") };
  }

  const data = parsed.data;

  if (!isValidPakistaniMobile(data.customer.phone)) {
    return { success: false, error: "Please enter a valid Pakistani mobile number", field: "customer.phone" };
  }

  const normalized = normalizePhone(data.customer.phone);

  // Idempotency check
  const existing = await Order.findOne({ idempotencyKey: data.idempotencyKey }).lean();
  if (existing) {
    return { success: true, order: toJSON(existing) as unknown as IOrder };
  }

  // Validate products and prices
  const productIds = [...new Set(data.items.map((i) => i.productId))];
  const products = await Product.find({ _id: { $in: productIds }, status: "active" }).lean();
  const productMap = new Map<string, IProduct>();
  for (const p of products) productMap.set(p._id.toString(), p as unknown as IProduct);

  const lineItems: IOrderItem[] = [];
  let subtotal = 0;

  for (const item of data.items) {
    const product = productMap.get(item.productId);
    if (!product) {
      return { success: false, error: `Product not found or unavailable: ${item.productId}`, field: "items" };
    }

    const variant = item.variantId
      ? product.variants.find((v) => v.id === item.variantId)
      : product.variants[0] || undefined;

    if (item.variantId && !variant) {
      return { success: false, error: `Variant not found for ${product.title}`, field: "items" };
    }

    const unitPrice = variant ? variant.price : product.price;
    if (unitPrice <= 0) {
      return { success: false, error: `Invalid price for ${product.title}`, field: "items" };
    }

    const stockSource = variant ? variant.stock : product.stock;
    if (stockSource < item.quantity) {
      return { success: false, error: `Insufficient stock for ${product.title} (${variant?.title || "default"})`, field: "items" };
    }

    const lineTotal = unitPrice * item.quantity;
    subtotal += lineTotal;
    lineItems.push({
      productId: product._id.toString(),
      variantId: variant?.id,
      sku: variant?.sku || product.sku,
      name: product.title,
      variantName: variant?.title,
      quantity: item.quantity,
      unitPrice,
      lineTotal,
      image: product.images[0],
    });
  }

  // Validate coupon and calculate discount (server-authoritative)
  let discount = 0;
  let discountType: string | undefined;
  let couponId: string | undefined;
  let subscriberId: string | undefined;
  let codeHash: string | undefined;
  let discountPercentage: number | undefined;
  let discountMaxAmount: number | undefined;

  if (data.discountCode) {
    const discountResult = await applyDiscountCode(data.discountCode, data.customer.email, subtotal);
    if (!discountResult.valid) {
      return { success: false, error: discountResult.message, field: "discountCode" };
    }
    discount = discountResult.discount;
    discountType = discountResult.type === "welcome_offer" ? "WELCOME_FIRST_ORDER" : "COUPON";
    discountPercentage = discountResult.percentage;
    discountMaxAmount = discountResult.maxDiscount;
    if (discountResult.type === "welcome_offer") {
      couponId = discountResult.offerId;
      subscriberId = discountResult.subscriberId;
      codeHash = discountResult.codeHash;
    }
  }

  // Calculate shipping and total using pre-discount subtotal
  const preDiscountSubtotal = subtotal;
  const postDiscountSubtotal = Math.max(0, preDiscountSubtotal - discount);
  const deliveryMethod = getDeliveryMethod(data.address.city);
  const shipping = calculateShipping(preDiscountSubtotal);
  const total = Math.max(0, preDiscountSubtotal + shipping - discount);

  const orderStatus: OrderStatus = data.paymentMethod === "cod" ? "pending_confirmation" : "payment_review";
  const paymentStatus: PaymentStatus = data.paymentMethod === "cod" ? "unpaid" : "pending_verification";

  const customer: IOrderCustomer = {
    name: data.customer.name.trim(),
    email: data.customer.email?.trim() || undefined,
    phone: data.customer.phone.trim(),
    normalizedPhone: normalized.e164,
    address: {
      line: data.address.line.trim(),
      area: data.address.area.trim(),
      city: data.address.city.trim(),
      province: data.address.province.trim(),
      postalCode: data.address.postalCode?.trim() || undefined,
      instructions: data.address.instructions?.trim() || undefined,
    },
  };

  const attribution = await captureAttribution();

  // Atomically decrement stock for each item
  for (const item of data.items) {
    const product = productMap.get(item.productId)!;
    const variant = item.variantId ? product.variants.find((v) => v.id === item.variantId) : undefined;

    const filter: Record<string, unknown> = { _id: product._id };
    const update: { $inc: Record<string, number> } = { $inc: { stock: -item.quantity } };

    if (variant) {
      filter["variants.id"] = item.variantId;
      update.$inc["variants.$.stock"] = -item.quantity;
      // Ensure variant stock is sufficient atomically
      filter["variants"] = { $elemMatch: { id: item.variantId, stock: { $gte: item.quantity } } };
    } else {
      filter.stock = { $gte: item.quantity };
    }

    const result = await Product.findOneAndUpdate(filter, update, { new: false });
    if (!result) {
      return { success: false, error: `Stock changed while placing order for ${product.title}`, field: "items" };
    }
  }

  // Generate order number
  const orderNumber = generateOrderNumber();

  const order = await Order.create({
    orderNumber,
    idempotencyKey: data.idempotencyKey,
    channel: "KHAYAL_WEBSITE" as const,
    brandId: KHAYAL_BRAND_ID,
    customer,
    items: lineItems,
    subtotal,
    preDiscountSubtotal,
    postDiscountSubtotal,
    discount,
    discountCode: data.discountCode?.toUpperCase().trim() || undefined,
    discountCodeHash: codeHash,
    couponId,
    couponType: discountType,
    discountPercentage,
    discountMaxAmount,
    subscriberId,
    shipping,
    tax: 0,
    total,
    currency: siteConfig.currency,
    paymentMethod: data.paymentMethod,
    paymentStatus,
    orderStatus,
    fulfilmentStatus: "unfulfilled",
    deliveryMethod,
    courier: deliveryMethod === "self_delivery" ? "self_delivery" : "unassigned",
    trackingNumber: undefined,
    customerNotes: data.customerNotes?.trim() || undefined,
    internalNotes: undefined,
    attribution,
    expectedDeliveryText: getExpectedDeliveryText(data.address.city),
    auditHistory: [
      {
        actor: "customer",
        action: "order_created",
        after: { orderStatus, paymentStatus, total },
        note: `Order placed via ${data.paymentMethod}`,
        createdAt: new Date(),
      },
    ],
  });

  // Create stock reservations
  const reservationHours = data.paymentMethod === "cod" ? COD_RESERVATION_HOURS : BANK_TRANSFER_RESERVATION_HOURS;
  const expiresAt = new Date(Date.now() + reservationHours * 60 * 60 * 1000);
  for (const item of data.items) {
    await StockReservation.create({
      orderId: order._id.toString(),
      productId: item.productId,
      variantId: item.variantId,
      quantity: item.quantity,
      status: "reserved",
      expiresAt,
    });
  }

  // Redeem welcome coupon or increment generic coupon usage
  if (data.discountCode) {
    if (discountType === "WELCOME_FIRST_ORDER" && codeHash) {
      const redeemResult = await redeemWelcomeOffer(data.discountCode, data.customer.email || "", order._id.toString());
      if (!redeemResult.ok) {
        order.auditHistory.push({
          actor: "system",
          action: "welcome_coupon_redeem_failed",
          note: redeemResult.error,
          createdAt: new Date(),
        });
        await order.save();
      }
    } else {
      await incrementCouponUsage(data.discountCode);
    }
  }

  const orderJson = toJSON(order) as unknown as IOrder;
  await sendOrderNotifications(orderJson);

  revalidatePath("/admin/orders");
  return { success: true, order: orderJson };
}

function generateOrderNumber(): string {
  const date = new Date();
  const prefix = `K-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${suffix}`;
}

export { isKarachi };
