"use server";

import { dbConnect } from "@/lib/mongoose";
import { Notification, type INotification } from "@/models/Notification";
import { siteConfig } from "@/lib/site-config";
import type { IOrder } from "@/models/Order";
import { formatPrice } from "@/lib/utils";

export type NotificationResult = { success: boolean; notifications: INotification[] };

function orderSummary(order: IOrder): string {
  const items = order.items.map((item) => `${item.name} x${item.quantity}`).join("\n");
  return `Order ${order.orderNumber}\nTotal: ${formatPrice(order.total, order.currency)}\nPayment: ${order.paymentMethod.toUpperCase()}\n${items}`;
}

export async function sendOrderNotifications(order: IOrder): Promise<NotificationResult> {
  await dbConnect();
  const created: INotification[] = [];

  if (order.customer.email) {
    const customer = await Notification.create({
      type: "customer_order_confirmation",
      channel: "email",
      recipient: order.customer.email,
      orderId: order._id.toString(),
      subject: `Your KHAYAL order ${order.orderNumber}`,
      body: orderSummary(order),
    });
    created.push(customer as unknown as INotification);
  }

  const admin = await Notification.create({
    type: "admin_new_order",
    channel: "whatsapp",
    recipient: siteConfig.whatsappNumber,
    orderId: order._id.toString(),
    body: `New order ${order.orderNumber} from ${order.customer.address.city} for ${formatPrice(order.total, order.currency)} via ${order.paymentMethod.toUpperCase()}. ${order.paymentStatus === "pending_verification" ? "Payment proof requires review." : ""}`,
  });
  created.push(admin as unknown as INotification);

  return { success: true, notifications: created };
}

export async function sendPaymentProofNotification(order: IOrder): Promise<NotificationResult> {
  await dbConnect();
  const admin = await Notification.create({
    type: "admin_payment_proof",
    channel: "whatsapp",
    recipient: siteConfig.whatsappNumber,
    orderId: order._id.toString(),
    body: `Payment proof uploaded for order ${order.orderNumber}. Please review and verify.`,
  });
  return { success: true, notifications: [admin as unknown as INotification] };
}
