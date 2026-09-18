"use server";

import { revalidatePath } from "next/cache";
import { dbConnect, toJSON } from "@/lib/mongoose";
import { Order, type IOrder } from "@/models/Order";
import { requireAuth } from "@/lib/auth";
import { calculateShipping } from "@/lib/shipping";

export async function getOrders(): Promise<IOrder[]> {
  const session = await requireAuth(["admin", "editor"]);
  if (!session) throw new Error("Unauthorized");
  await dbConnect();
  const orders = await Order.find().sort({ createdAt: -1 }).lean();
  return toJSON(orders) as unknown as IOrder[];
}

export async function getOrderById(id: string): Promise<IOrder | null> {
  const session = await requireAuth(["admin", "editor"]);
  if (!session) throw new Error("Unauthorized");
  await dbConnect();
  const order = await Order.findById(id).lean();
  return toJSON(order) as unknown as IOrder | null;
}

export async function createOrder(formData: FormData) {
  const session = await requireAuth(["admin", "editor"]);
  if (!session) throw new Error("Unauthorized");
  await dbConnect();

  const orderNumber = getString(formData, "orderNumber") || generateOrderNumber();
  const requestedTotal = Number(getString(formData, "total") || "0");
  const subtotal = Number(getString(formData, "subtotal") || requestedTotal);
  const discount = Math.max(0, Number(getString(formData, "discount") || "0"));
  const shipping = calculateShipping(subtotal, Number(getString(formData, "shipping") || "0"));
  const total = Math.max(0, subtotal + shipping - discount);

  await Order.create({
    orderNumber,
    customer: {
      name: getString(formData, "customerName"),
      email: getString(formData, "customerEmail"),
      phone: getString(formData, "customerPhone"),
      address: getString(formData, "customerAddress"),
      city: getString(formData, "customerCity"),
    },
    items: parseItems(getString(formData, "items")),
    subtotal,
    shipping,
    discount,
    total,
    status: (getString(formData, "status") as IOrder["status"]) || "pending",
    paymentStatus: (getString(formData, "paymentStatus") as IOrder["paymentStatus"]) || "pending",
    tracking: getString(formData, "tracking") || undefined,
    notes: getString(formData, "notes") || undefined,
  });

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

export async function updateOrder(id: string, formData: FormData) {
  const session = await requireAuth(["admin", "editor"]);
  if (!session) throw new Error("Unauthorized");
  await dbConnect();

  const order = await Order.findById(id);
  if (!order) throw new Error("Order not found");

  order.status = (getString(formData, "status") as IOrder["status"]) || order.status;
  order.paymentStatus =
    (getString(formData, "paymentStatus") as IOrder["paymentStatus"]) || order.paymentStatus;
  order.tracking = getString(formData, "tracking") || order.tracking || undefined;
  order.notes = getString(formData, "notes") || order.notes || undefined;

  await order.save();

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

export async function deleteOrder(id: string) {
  const session = await requireAuth(["admin"]);
  if (!session) throw new Error("Unauthorized");
  await dbConnect();
  await Order.findByIdAndDelete(id);
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}

function getString(formData: FormData, name: string) {
  return formData.get(name)?.toString().trim() || "";
}

function generateOrderNumber(): string {
  const date = new Date();
  const prefix = `K-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${suffix}`;
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
