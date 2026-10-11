"use server";

import { revalidatePath } from "next/cache";
import { sendReviewRequest } from "@/lib/review-request";
import { dbConnect, toJSON } from "@/lib/mongoose";
import { Order, type IOrder, type OrderStatus, type PaymentStatus, type Courier } from "@/models/Order";
import { Product } from "@/models/Product";
import { StockReservation } from "@/models/StockReservation";
import { requireOrderPermission } from "@/lib/admin/permissions";
import { sendCustomerOrderNotification, sendOrderNotifications } from "@/lib/notifications";
import { calculateShipping } from "@/lib/shipping";

export type OrderFilters = {
  search?: string;
  status?: string;
  paymentStatus?: string;
  city?: string;
  courier?: string;
  channel?: string;
  brandId?: string;
  from?: string;
  to?: string;
};

export async function getOrders(filters: OrderFilters = {}): Promise<IOrder[]> {
  const perm = await requireOrderPermission("orders.view");
  if (!perm.allowed) throw new Error(perm.error);
  await dbConnect();

  const query: Record<string, unknown> = {};
  if (filters.status) query.orderStatus = filters.status;
  if (filters.paymentStatus) query.paymentStatus = filters.paymentStatus;
  if (filters.city) query["customer.address.city"] = { $regex: filters.city, $options: "i" };
  if (filters.courier) query.courier = filters.courier;
  if (filters.channel) query.channel = filters.channel;
  if (filters.brandId) query.brandId = filters.brandId;
  if (filters.from || filters.to) {
    const createdAt: Record<string, Date> = {};
    if (filters.from) createdAt.$gte = new Date(filters.from);
    if (filters.to) createdAt.$lte = new Date(filters.to);
    query.createdAt = createdAt;
  }
  if (filters.search) {
    const term = filters.search.trim();
    query.$or = [
      { orderNumber: { $regex: term, $options: "i" } },
      { "customer.name": { $regex: term, $options: "i" } },
      { "customer.phone": { $regex: term, $options: "i" } },
      { "customer.normalizedPhone": { $regex: term, $options: "i" } },
    ];
  }

  const orders = await Order.find(query).sort({ createdAt: -1 }).lean();
  return toJSON(orders) as unknown as IOrder[];
}

export async function getOrderById(id: string): Promise<IOrder | null> {
  const perm = await requireOrderPermission("orders.view");
  if (!perm.allowed) throw new Error(perm.error);
  await dbConnect();
  const order = await Order.findById(id).lean();
  return toJSON(order) as unknown as IOrder | null;
}

export async function addInternalNote(id: string, formData: FormData) {
  const perm = await requireOrderPermission("orders.update");
  if (!perm.allowed) throw new Error(perm.error);
  await dbConnect();
  const note = formData.get("note")?.toString().trim() || "";
  if (!note) throw new Error("Note is required");
  await pushAudit(
    id,
    "internal_note_added",
    {},
    { internalNotes: note },
    { actor: perm.session.name, actorId: perm.session.id, note }
  );
  revalidatePath(`/admin/orders/${id}`);
}

export async function assignCourier(id: string, formData: FormData) {
  const perm = await requireOrderPermission("orders.assignCourier");
  if (!perm.allowed) throw new Error(perm.error);
  await dbConnect();
  const order = await Order.findById(id);
  if (!order) throw new Error("Order not found");

  const courier = (formData.get("courier")?.toString().trim() || order.courier) as Courier;
  const trackingNumber = formData.get("trackingNumber")?.toString().trim() || undefined;

  const before = { courier: order.courier, trackingNumber: order.trackingNumber };
  order.courier = courier;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  await pushAudit(id, "courier_assigned", before, { courier, trackingNumber }, { actor: perm.session.name, actorId: perm.session.id });
  await order.save();
  revalidatePath(`/admin/orders/${id}`);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function verifyPayment(id: string, _formData?: FormData) {
  const perm = await requireOrderPermission("orders.verifyPayment");
  if (!perm.allowed) throw new Error(perm.error);
  await dbConnect();
  const order = await Order.findById(id);
  if (!order) throw new Error("Order not found");
  if (!order.paymentVerification) throw new Error("No payment proof to verify");

  const before = { paymentStatus: order.paymentStatus, orderStatus: order.orderStatus };
  order.paymentStatus = "paid";
  order.orderStatus = "confirmed";
  order.paymentVerification.status = "paid";
  order.paymentVerification.verifiedBy = perm.session.name;
  order.paymentVerification.verifiedById = perm.session.id;
  order.paymentVerification.verifiedAt = new Date();
  order.confirmationTime = new Date();

  await pushAudit(id, "payment_verified", before, { paymentStatus: "paid", orderStatus: "confirmed" }, { actor: perm.session.name, actorId: perm.session.id });
  await order.save();

  const orderJson = toJSON(order) as unknown as IOrder;
  await sendCustomerOrderNotification(orderJson, "confirmed");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
}

export async function rejectPayment(id: string, formData: FormData) {
  const perm = await requireOrderPermission("orders.rejectPayment");
  if (!perm.allowed) throw new Error(perm.error);
  await dbConnect();
  const order = await Order.findById(id);
  if (!order) throw new Error("Order not found");
  if (!order.paymentVerification) throw new Error("No payment proof to reject");

  const reason = formData.get("reason")?.toString().trim() || "";
  if (!reason) throw new Error("Rejection reason is required");

  const before = { paymentStatus: order.paymentStatus };
  order.paymentStatus = "rejected";
  order.paymentVerification.status = "rejected";
  order.paymentVerification.rejectedAt = new Date();
  order.paymentVerification.rejectionReason = reason;

  await pushAudit(id, "payment_rejected", before, { paymentStatus: "rejected", rejectionReason: reason }, { actor: perm.session.name, actorId: perm.session.id, note: reason });
  await order.save();
  await sendCustomerOrderNotification(toJSON(order) as unknown as IOrder, "payment_rejected", reason);
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
}

export async function updateOrderStatus(id: string, formData: FormData) {
  const perm = await requireOrderPermission("orders.update");
  if (!perm.allowed) throw new Error(perm.error);
  await dbConnect();
  const order = await Order.findById(id);
  if (!order) throw new Error("Order not found");

  const status = (formData.get("status")?.toString().trim() || order.orderStatus) as OrderStatus;
  const note = formData.get("note")?.toString().trim() || undefined;

  const before = { orderStatus: order.orderStatus, fulfilmentStatus: order.fulfilmentStatus };
  order.orderStatus = status;

  if (status === "packed") order.fulfilmentStatus = "packed";
  if (status === "dispatched") {
    order.fulfilmentStatus = "dispatched";
    order.dispatchTime = new Date();
    await convertReservations(id);
  }
  if (status === "delivered") {
    order.fulfilmentStatus = "delivered";
    order.deliveryTime = new Date();
  }
  if (status === "cancelled") {
    order.cancellationTime = new Date();
    await releaseReservations(id, "cancelled");
  }

  await pushAudit(id, "status_changed", before, { orderStatus: status, fulfilmentStatus: order.fulfilmentStatus }, { actor: perm.session.name, actorId: perm.session.id, note });
  await order.save();
  if (before.orderStatus !== status) {
    await sendCustomerOrderNotification(toJSON(order) as unknown as IOrder, status, status === "cancelled" ? note : undefined);
    if (status === "delivered") {
      try {
        await sendReviewRequest(toJSON(order) as unknown as IOrder);
      } catch (error) {
        console.error(`Review request failed for ${order.orderNumber}:`, error);
      }
    }
  }
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
}

export async function cancelOrder(id: string, formData: FormData) {
  const perm = await requireOrderPermission("orders.cancel");
  if (!perm.allowed) throw new Error(perm.error);
  await dbConnect();
  const order = await Order.findById(id);
  if (!order) throw new Error("Order not found");

  const reason = formData.get("reason")?.toString().trim() || "";
  if (!reason) throw new Error("Cancellation reason is required");

  const before = { orderStatus: order.orderStatus, paymentStatus: order.paymentStatus };
  order.orderStatus = "cancelled";
  order.cancellationReason = reason;
  order.cancellationTime = new Date();
  await releaseReservations(id, "cancelled");

  await pushAudit(id, "order_cancelled", before, { orderStatus: "cancelled", cancellationReason: reason }, { actor: perm.session.name, actorId: perm.session.id, note: reason });
  await order.save();
  if (before.orderStatus !== "cancelled") {
    await sendCustomerOrderNotification(toJSON(order) as unknown as IOrder, "cancelled", reason);
  }
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
}

export async function releaseExpiredReservations(): Promise<{ released: number }> {
  await dbConnect();
  const expired = await StockReservation.find({ status: "reserved", expiresAt: { $lte: new Date() } }).lean();
  let released = 0;
  for (const reservation of expired as unknown as { _id: string; orderId: string; productId: string; variantId?: string; quantity: number; status: string }[]) {
    if (reservation.status === "released" || reservation.status === "expired") continue;
    await releaseSingleReservation(reservation, "expired");
    released++;
  }
  return { released };
}

// Legacy admin manual order creation (kept for existing /admin/orders/new page)
export async function createOrder(formData: FormData) {
  const perm = await requireOrderPermission("orders.create");
  if (!perm.allowed) throw new Error(perm.error);
  await dbConnect();

  const orderNumber = getString(formData, "orderNumber") || generateOrderNumber();
  const requestedTotal = Number(getString(formData, "total") || "0");
  const subtotal = Number(getString(formData, "subtotal") || requestedTotal);
  const discount = Math.max(0, Number(getString(formData, "discount") || "0"));
  const shipping = calculateShipping(subtotal, Number(getString(formData, "shipping") || "0"));
  const total = Math.max(0, subtotal + shipping - discount);

  const order = await Order.create({
    orderNumber,
    idempotencyKey: crypto.randomUUID(),
    channel: "KHAYAL_WEBSITE",
    brandId: process.env.KHAYAL_BRAND_ID || "khayal-fragrance",
    customer: {
      name: getString(formData, "customerName"),
      email: getString(formData, "customerEmail"),
      phone: getString(formData, "customerPhone"),
      normalizedPhone: getString(formData, "customerPhone"),
      address: {
        line: getString(formData, "customerAddress"),
        area: "—",
        city: getString(formData, "customerCity"),
        province: "—",
      },
    },
    items: parseItems(getString(formData, "items")),
    subtotal,
    shipping,
    discount,
    total,
    tax: 0,
    currency: "PKR",
    paymentMethod: "cod",
    paymentStatus: "unpaid",
    orderStatus: "pending_confirmation",
    fulfilmentStatus: "unfulfilled",
    deliveryMethod: "nationwide_courier",
    courier: "unassigned",
    expectedDeliveryText: "3–4 working days after confirmation",
    auditHistory: [
      { actor: perm.session.name, actorId: perm.session.id, action: "manual_order_created", createdAt: new Date() },
    ],
  });

  await sendOrderNotifications(toJSON(order) as unknown as IOrder);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

export async function updateOrder(id: string, formData: FormData) {
  const perm = await requireOrderPermission("orders.update");
  if (!perm.allowed) throw new Error(perm.error);
  await dbConnect();

  const order = await Order.findById(id);
  if (!order) throw new Error("Order not found");

  const before = { orderStatus: order.orderStatus, paymentStatus: order.paymentStatus, trackingNumber: order.trackingNumber, notes: order.internalNotes };
  order.orderStatus = (getString(formData, "status") as OrderStatus) || order.orderStatus;
  order.paymentStatus = (getString(formData, "paymentStatus") as PaymentStatus) || order.paymentStatus;
  order.trackingNumber = getString(formData, "tracking") || order.trackingNumber || undefined;
  order.internalNotes = getString(formData, "notes") || order.internalNotes || undefined;

  await pushAudit(id, "order_updated", before, { orderStatus: order.orderStatus, paymentStatus: order.paymentStatus, trackingNumber: order.trackingNumber, notes: order.internalNotes }, { actor: perm.session.name, actorId: perm.session.id });
  await order.save();

  const orderJson = toJSON(order) as unknown as IOrder;
  if (before.orderStatus !== order.orderStatus) {
    await sendCustomerOrderNotification(orderJson, order.orderStatus);
  } else if (before.paymentStatus !== order.paymentStatus && order.paymentStatus === "rejected") {
    await sendCustomerOrderNotification(orderJson, "payment_rejected");
  }

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

export async function deleteOrder(id: string) {
  const perm = await requireOrderPermission("orders.cancel");
  if (!perm.allowed) throw new Error(perm.error);
  await dbConnect();
  await releaseReservations(id, "deleted");
  await Order.findByIdAndDelete(id);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

// Helpers
async function convertReservations(orderId: string) {
  await StockReservation.updateMany({ orderId, status: "reserved" }, { status: "converted" });
}

async function releaseReservations(orderId: string, reason: string) {
  const reservations = await StockReservation.find({ orderId, status: { $in: ["reserved", "converted"] } }).lean();
  for (const reservation of reservations as unknown as { _id: string; orderId: string; productId: string; variantId?: string; quantity: number; status: string }[]) {
    await releaseSingleReservation(reservation, reason);
  }
}

async function releaseSingleReservation(
  reservation: { _id: string; orderId: string; productId: string; variantId?: string; quantity: number; status: string },
  reason: string
) {
  if (reservation.status === "released" || reservation.status === "expired") return;
  const product = await Product.findById(reservation.productId);
  if (product) {
    product.stock += reservation.quantity;
    const variant = product.variants.find((v) => v.id === reservation.variantId);
    if (variant) variant.stock += reservation.quantity;
    await product.save();
  }
  await StockReservation.updateOne(
    { _id: reservation._id },
    { status: reason === "expired" ? "expired" : "released" }
  );
}

async function pushAudit(
  orderId: string,
  action: string,
  before: Record<string, string | number | boolean | Date | null | undefined>,
  after: Record<string, string | number | boolean | Date | null | undefined>,
  options: { actor: string; actorId: string; note?: string }
) {
  await Order.updateOne(
    { _id: orderId },
    {
      $push: {
        auditHistory: {
          actor: options.actor,
          actorId: options.actorId,
          action,
          before,
          after,
          note: options.note,
          createdAt: new Date(),
        },
      },
    }
  );
}

function generateOrderNumber(): string {
  const date = new Date();
  const prefix = `K-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${suffix}`;
}

function getString(formData: FormData, name: string) {
  return formData.get(name)?.toString().trim() || "";
}

function parseItems(json: string): IOrder["items"] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
