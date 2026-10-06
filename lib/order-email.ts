import { siteConfig } from "@/lib/site-config";
import type { IOrder, OrderStatus } from "@/models/Order";
import { formatPrice } from "@/lib/utils";

export type CustomerOrderEvent = "placed" | OrderStatus | "payment_rejected";

type EmailContent = { subject: string; heading: string; message: string };

const eventContent: Record<CustomerOrderEvent, EmailContent> = {
  placed: { subject: "We received your KHAYAL order", heading: "Thank you for your order", message: "We have received your order and will keep you updated as it moves forward." },
  draft: { subject: "Your KHAYAL order draft", heading: "Order draft saved", message: "Your order is currently saved as a draft." },
  pending_confirmation: { subject: "Your KHAYAL order is awaiting confirmation", heading: "Order received", message: "Your order is awaiting confirmation from our team." },
  payment_review: { subject: "Your KHAYAL payment is under review", heading: "Payment under review", message: "We have received your order and your bank transfer is awaiting verification." },
  confirmed: { subject: "Your KHAYAL order is confirmed", heading: "Order confirmed", message: "Your order has been confirmed and will be prepared shortly." },
  processing: { subject: "Your KHAYAL order is being prepared", heading: "Order in progress", message: "We are carefully preparing your fragrances for delivery." },
  packed: { subject: "Your KHAYAL order is packed", heading: "Order packed", message: "Your order has been packed and is ready for dispatch." },
  dispatched: { subject: "Your KHAYAL order is on the way", heading: "Order dispatched", message: "Your order has left us and is now on its way to you." },
  delivered: { subject: "Your KHAYAL order has been delivered", heading: "Order delivered", message: "Your order has been marked as delivered. We hope you enjoy your KHAYAL fragrances." },
  cancelled: { subject: "Your KHAYAL order was cancelled", heading: "Order cancelled", message: "Your order has been cancelled. Please contact us if you need any help." },
  return_requested: { subject: "Your KHAYAL return request was received", heading: "Return requested", message: "We have received your return request and our team will contact you with the next steps." },
  returned: { subject: "Your KHAYAL return is complete", heading: "Order returned", message: "Your order has been marked as returned." },
  payment_rejected: { subject: "Action needed for your KHAYAL payment", heading: "Payment could not be verified", message: "We could not verify your bank transfer. Please review the reason below or contact our team for help." },
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[character] || character);
}

function orderSummary(order: IOrder): string {
  const items = order.items.map((item) => `${item.name}${item.variantName ? ` (${item.variantName})` : ""} × ${item.quantity} — ${formatPrice(item.lineTotal, order.currency)}`).join("\n");
  return `Order ${order.orderNumber}\n${items}\nTotal: ${formatPrice(order.total, order.currency)}\nPayment: ${order.paymentMethod === "cod" ? "Cash on delivery" : "Bank transfer"}`;
}

export function getCustomerOrderEmail(order: IOrder, event: CustomerOrderEvent, detail?: string): { subject: string; text: string; html: string } {
  const content = eventContent[event];
  const tracking = event === "dispatched" && order.trackingNumber ? `Tracking number: ${order.trackingNumber}` : "";
  const reason = detail ? `Details: ${detail}` : "";
  const text = `${content.heading}\n\nHello ${order.customer.name},\n\n${content.message}\n\n${orderSummary(order)}${tracking ? `\n${tracking}` : ""}${reason ? `\n${reason}` : ""}\n\nQuestions? Reply to this email or contact ${siteConfig.phoneDisplay}.`;
  const rows = order.items.map((item) => `<tr><td style="padding:8px 0;color:#292524">${escapeHtml(item.name)}${item.variantName ? ` <span style="color:#78716c">(${escapeHtml(item.variantName)})</span>` : ""} × ${item.quantity}</td><td style="padding:8px 0;text-align:right;color:#292524">${escapeHtml(formatPrice(item.lineTotal, order.currency))}</td></tr>`).join("");
  const extra = [tracking, reason].filter(Boolean).map((line) => `<p style="margin:12px 0;padding:12px;background:#f5f1e8;color:#44403c;border-radius:8px">${escapeHtml(line)}</p>`).join("");
  const html = `<div style="background:#f7f4ee;padding:32px 16px;font-family:Arial,sans-serif;color:#292524"><div style="max-width:600px;margin:0 auto;background:#fff;padding:32px;border-radius:12px"><p style="margin:0 0 24px;color:#a88648;letter-spacing:3px;font-weight:600">KHAYAL</p><h1 style="font-size:26px;margin:0 0 16px">${escapeHtml(content.heading)}</h1><p>Hello ${escapeHtml(order.customer.name)},</p><p style="line-height:1.6">${escapeHtml(content.message)}</p>${extra}<h2 style="font-size:18px;margin-top:28px">Order ${escapeHtml(order.orderNumber)}</h2><table style="width:100%;border-collapse:collapse">${rows}<tr style="border-top:1px solid #e7e5e4"><td style="padding-top:16px;font-weight:700">Total</td><td style="padding-top:16px;text-align:right;font-weight:700">${escapeHtml(formatPrice(order.total, order.currency))}</td></tr></table><p style="margin-top:28px;color:#78716c;font-size:13px;line-height:1.6">Questions? Reply to this email or contact ${escapeHtml(siteConfig.phoneDisplay)}.</p></div></div>`;
  return { subject: `${content.subject} — ${order.orderNumber}`, text, html };
}
