"use server";

import { dbConnect } from "@/lib/mongoose";
import { Notification, type INotification } from "@/models/Notification";
import { siteConfig } from "@/lib/site-config";
import type { IOrder } from "@/models/Order";
import { formatPrice } from "@/lib/utils";
import { getEmailFrom, getEmailReplyTo, sendEmail } from "@/lib/email";
import { renderOrderEmail, mapOrderToEmailData, type EmailOrderStatus } from "@/lib/khayal-emails";

export type NotificationResult = { success: boolean; notifications: INotification[] };
export type CustomerOrderEvent = EmailOrderStatus;

export async function sendCustomerOrderNotification(order: IOrder, event: CustomerOrderEvent, detail?: string): Promise<NotificationResult> {
  if (!order.customer.email) return { success: true, notifications: [] };

  try {
    await dbConnect();
    const content = renderOrderEmail(event, mapOrderToEmailData(order, detail));
    const notification = await Notification.create({
      type: event === "placed" ? "customer_order_confirmation" : "customer_order_update",
      channel: "email",
      recipient: order.customer.email,
      orderId: order._id.toString(),
      subject: content.subject,
      body: content.text,
    });
    const result = await sendEmail({ to: order.customer.email, from: getEmailFrom(), replyTo: getEmailReplyTo(), ...content });
    notification.status = result.ok ? "sent" : "failed";
    notification.sentAt = result.ok ? new Date() : undefined;
    notification.providerResponse = result.ok ? result.providerResponse : undefined;
    notification.error = result.ok ? undefined : result.error;
    await notification.save();
    return { success: result.ok, notifications: [notification as unknown as INotification] };
  } catch (error) {
    console.error(`Customer order email failed for ${order.orderNumber}:`, error);
    return { success: false, notifications: [] };
  }
}

export async function sendOrderNotifications(order: IOrder): Promise<NotificationResult> {
  const customerResult = await sendCustomerOrderNotification(order, "placed");
  const created = [...customerResult.notifications];

  try {
    await dbConnect();
    const admin = await Notification.create({
      type: "admin_new_order",
      channel: "whatsapp",
      recipient: siteConfig.whatsappNumber,
      orderId: order._id.toString(),
      body: `New order ${order.orderNumber} from ${order.customer.address.city} for ${formatPrice(order.total, order.currency)} via ${order.paymentMethod.toUpperCase()}. ${order.paymentStatus === "pending_verification" ? "Payment proof requires review." : ""}`,
    });
    created.push(admin as unknown as INotification);
  } catch (error) {
    console.error(`Admin order notification failed for ${order.orderNumber}:`, error);
  }

  return { success: customerResult.success, notifications: created };
}

export async function sendPaymentProofNotification(order: IOrder): Promise<NotificationResult> {
  try {
    await dbConnect();
    const admin = await Notification.create({
      type: "admin_payment_proof",
      channel: "whatsapp",
      recipient: siteConfig.whatsappNumber,
      orderId: order._id.toString(),
      body: `Payment proof uploaded for order ${order.orderNumber}. Please review and verify.`,
    });
    return { success: true, notifications: [admin as unknown as INotification] };
  } catch (error) {
    console.error(`Payment proof notification failed for ${order.orderNumber}:`, error);
    return { success: false, notifications: [] };
  }
}
