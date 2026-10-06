import { siteConfig } from "@/lib/site-config";
import type { IOrder, OrderStatus } from "@/models/Order";
import { formatPrice } from "@/lib/utils";

export type CustomerOrderEvent = "placed" | OrderStatus | "payment_rejected";

type EmailContent = { subject: string; eyebrow: string; heading: string; message: string };

const eventContent: Record<CustomerOrderEvent, EmailContent> = {
  placed: { subject: "We received your KHAYAL order", eyebrow: "Order received", heading: "Thank you for your order", message: "Your order is now with us. We’ll keep you informed at every step, from confirmation to delivery." },
  draft: { subject: "Your KHAYAL order draft", eyebrow: "Order draft", heading: "Your selection is saved", message: "Your order is currently saved as a draft and has not yet been submitted for fulfilment." },
  pending_confirmation: { subject: "Your KHAYAL order is awaiting confirmation", eyebrow: "Awaiting confirmation", heading: "We’re reviewing your order", message: "Our team is reviewing the details and will confirm your order shortly." },
  payment_review: { subject: "Your KHAYAL payment is under review", eyebrow: "Payment review", heading: "We’re verifying your payment", message: "Your bank transfer details are safely with us. We’ll confirm your order as soon as verification is complete." },
  confirmed: { subject: "Your KHAYAL order is confirmed", eyebrow: "Order confirmed", heading: "Your order is confirmed", message: "Everything is in order. Our team will now prepare your fragrances with care." },
  processing: { subject: "Your KHAYAL order is being prepared", eyebrow: "In preparation", heading: "The ritual has begun", message: "Your fragrances are being carefully prepared and checked before packing." },
  packed: { subject: "Your KHAYAL order is packed", eyebrow: "Ready to travel", heading: "Beautifully packed and ready", message: "Your order has passed its final check and is ready to begin its journey to you." },
  dispatched: { subject: "Your KHAYAL order is on the way", eyebrow: "Order dispatched", heading: "Your fragrance is on its way", message: "Your order has left us and is travelling to your delivery address." },
  delivered: { subject: "Your KHAYAL order has been delivered", eyebrow: "Delivered", heading: "A new memory has arrived", message: "Your order has been marked as delivered. We hope your KHAYAL fragrance becomes part of a beautiful memory." },
  cancelled: { subject: "Your KHAYAL order was cancelled", eyebrow: "Order update", heading: "Your order has been cancelled", message: "This order will not be processed further. If this was unexpected, our team is ready to help." },
  return_requested: { subject: "Your KHAYAL return request was received", eyebrow: "Return requested", heading: "We’ve received your request", message: "Our team will review your return request and contact you with the next steps." },
  returned: { subject: "Your KHAYAL return is complete", eyebrow: "Return complete", heading: "Your return is complete", message: "This order has been marked as returned. Thank you for your patience throughout the process." },
  payment_rejected: { subject: "Action needed for your KHAYAL payment", eyebrow: "Payment update", heading: "We couldn’t verify your payment", message: "Please review the information below. You can reply to this email if you need help from our team." },
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] || character);
}

function absoluteUrl(value: string): string {
  if (/^https?:\/\//i.test(value)) return value;
  return `${siteConfig.url}${value.startsWith("/") ? value : `/${value}`}`;
}

function money(value: number | undefined, currency: string): string {
  return formatPrice(value || 0, currency);
}

function paymentLabel(order: IOrder): string {
  return order.paymentMethod === "cod" ? "Cash on delivery" : "Bank transfer";
}

function courierLabel(order: IOrder): string {
  if (order.courier === "self_delivery") return "KHAYAL delivery";
  if (order.courier === "unassigned") return "To be assigned";
  return order.courier.toUpperCase();
}

function addressText(order: IOrder): string[] {
  const address = order.customer.address;
  return [address.line, address.area, `${address.city}, ${address.province}`, address.postalCode].filter((value): value is string => Boolean(value));
}

function orderSummary(order: IOrder): string {
  const items = order.items.map((item) => `${item.name}${item.variantName ? ` (${item.variantName})` : ""} × ${item.quantity} — ${money(item.lineTotal, order.currency)}`).join("\n");
  const address = addressText(order).join(", ");
  return `Order ${order.orderNumber}\n${items}\n\nSubtotal: ${money(order.subtotal, order.currency)}\nDiscount: ${money(order.discount, order.currency)}\nShipping: ${order.shipping ? money(order.shipping, order.currency) : "Complimentary"}\nTotal: ${money(order.total, order.currency)}\nPayment: ${paymentLabel(order)}\nDeliver to: ${address}`;
}

function itemRows(order: IOrder): string {
  return order.items.map((item) => {
    const image = item.image ? `<img src="${escapeHtml(absoluteUrl(item.image))}" width="92" alt="${escapeHtml(item.name)}" style="display:block;width:92px;height:112px;object-fit:cover;background:#f4f0e8;border:0" />` : `<div style="width:92px;height:112px;background:#f4f0e8;text-align:center;line-height:112px;color:#b79a5b;font-family:Georgia,serif;font-size:28px">K</div>`;
    return `<tr><td class="item-image" width="112" valign="top" style="padding:24px 20px 24px 0;border-bottom:1px solid #e8e2d8">${image}</td><td valign="middle" style="padding:24px 12px 24px 0;border-bottom:1px solid #e8e2d8"><p style="margin:0 0 7px;font-family:Georgia,'Times New Roman',serif;font-size:18px;line-height:24px;color:#201d1a">${escapeHtml(item.name)}</p>${item.variantName ? `<p style="margin:0 0 6px;font-size:12px;line-height:18px;color:#7b746b">${escapeHtml(item.variantName)}</p>` : ""}${item.sku ? `<p style="margin:0;font-size:10px;line-height:16px;letter-spacing:1px;text-transform:uppercase;color:#a39a8d">Ref. ${escapeHtml(item.sku)}</p>` : ""}<p style="margin:8px 0 0;font-size:12px;line-height:18px;color:#5e574f">Quantity&nbsp; ${item.quantity}</p></td><td width="110" valign="middle" align="right" style="padding:24px 0;border-bottom:1px solid #e8e2d8;font-size:13px;line-height:20px;color:#201d1a;white-space:nowrap">${escapeHtml(money(item.lineTotal, order.currency))}</td></tr>`;
  }).join("");
}

function totalRow(label: string, value: string, strong = false): string {
  return `<tr><td style="padding:${strong ? "16px 0 0" : "5px 0"};${strong ? "border-top:1px solid #d8d0c4;" : ""}font-size:${strong ? "15px" : "12px"};font-weight:${strong ? "700" : "400"};color:${strong ? "#201d1a" : "#6f675e"}">${label}</td><td align="right" style="padding:${strong ? "16px 0 0" : "5px 0"};${strong ? "border-top:1px solid #d8d0c4;" : ""}font-size:${strong ? "16px" : "12px"};font-weight:${strong ? "700" : "400"};color:#201d1a">${escapeHtml(value)}</td></tr>`;
}

export function getCustomerOrderEmail(order: IOrder, event: CustomerOrderEvent, detail?: string): { subject: string; text: string; html: string } {
  const content = eventContent[event];
  const tracking = event === "dispatched" && order.trackingNumber ? `Tracking number: ${order.trackingNumber}` : "";
  const reason = detail ? `Details: ${detail}` : "";
  const text = `${content.heading}\n\nHello ${order.customer.name},\n\n${content.message}\n\n${orderSummary(order)}${tracking ? `\n${tracking}` : ""}${reason ? `\n${reason}` : ""}\n\nQuestions? Reply to this email, write to ${siteConfig.email}, or call ${siteConfig.phoneDisplay}.`;
  const infoBox = tracking || reason ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:26px 0 0;background:#f4f0e8;border-left:3px solid #b49352"><tr><td style="padding:18px 20px;font-size:13px;line-height:21px;color:#4f4942">${tracking ? `<strong style="color:#201d1a">${escapeHtml(tracking)}</strong>` : ""}${tracking && reason ? "<br />" : ""}${reason ? escapeHtml(reason) : ""}</td></tr></table>` : "";
  const address = addressText(order).map(escapeHtml).join("<br />");
  const totals = `${totalRow("Subtotal", money(order.subtotal, order.currency))}${order.discount ? totalRow("Discount", `− ${money(order.discount, order.currency)}`) : ""}${totalRow("Shipping", order.shipping ? money(order.shipping, order.currency) : "Complimentary")}${totalRow("Order total", money(order.total, order.currency), true)}`;
  const preheader = `${content.heading}. Order ${order.orderNumber}.`;
  const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><style>@media only screen and (max-width:620px){.shell{width:100%!important}.pad{padding-left:22px!important;padding-right:22px!important}.hero-title{font-size:36px!important;line-height:42px!important}.detail-cell{display:block!important;width:100%!important;padding:0 0 24px!important}.item-image{width:88px!important}.item-image img,.item-image div{width:72px!important;height:88px!important;line-height:88px!important}.nav{font-size:9px!important;letter-spacing:1px!important}.desktop-gap{display:none!important}}</style></head><body style="margin:0;padding:0;background:#211f1d"><div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${escapeHtml(preheader)}</div><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="width:100%;background:#211f1d"><tr><td align="center" style="padding:24px 10px"><table role="presentation" class="shell" width="620" cellspacing="0" cellpadding="0" style="width:620px;max-width:620px;background:#fffdf9;border-radius:28px;overflow:hidden"><tr><td class="pad" align="center" style="padding:34px 42px 25px;border-bottom:1px solid #e8e2d8"><a href="${escapeHtml(siteConfig.url)}" style="text-decoration:none"><img src="${escapeHtml(absoluteUrl("/logo.png"))}" width="58" height="58" alt="Khayal Fragrance" style="display:block;width:58px;height:58px;margin:0 auto 12px;border-radius:50%;object-fit:cover;border:0" /><span style="display:block;font-family:Georgia,'Times New Roman',serif;font-size:24px;letter-spacing:8px;color:#201d1a">KHAYAL</span><span style="display:block;margin-top:7px;font-family:Arial,sans-serif;font-size:8px;letter-spacing:3px;color:#9a7c43">FRAGRANCE</span></a></td></tr><tr><td class="nav pad" align="center" style="padding:16px 42px;border-bottom:1px solid #e8e2d8;font-family:Arial,sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase"><a href="${escapeHtml(`${siteConfig.url}/shop/men`)}" style="color:#4f4942;text-decoration:none">Men</a><span style="color:#c8b995">&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;</span><a href="${escapeHtml(`${siteConfig.url}/shop/women`)}" style="color:#4f4942;text-decoration:none">Women</a><span style="color:#c8b995">&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;</span><a href="${escapeHtml(`${siteConfig.url}/shop/unisex`)}" style="color:#4f4942;text-decoration:none">Unisex</a></td></tr><tr><td class="pad" align="center" style="padding:54px 52px 46px;background:#f8f4ec"><p style="margin:0 0 18px;font-family:Arial,sans-serif;font-size:10px;line-height:16px;letter-spacing:3px;text-transform:uppercase;color:#9a7c43">${escapeHtml(content.eyebrow)}</p><h1 class="hero-title" style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:44px;line-height:50px;font-weight:400;color:#201d1a">${escapeHtml(content.heading)}</h1><div style="width:42px;height:1px;background:#b49352;margin:25px auto"></div><p style="margin:0;max-width:440px;font-family:Arial,sans-serif;font-size:14px;line-height:24px;color:#655e56">Hello ${escapeHtml(order.customer.name)},<br />${escapeHtml(content.message)}</p>${infoBox}</td></tr><tr><td class="pad" style="padding:34px 42px 0"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td style="padding-bottom:12px;border-bottom:1px solid #201d1a;font-family:Arial,sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#201d1a">Order details</td><td align="right" style="padding-bottom:12px;border-bottom:1px solid #201d1a;font-family:Arial,sans-serif;font-size:11px;color:#6f675e">${escapeHtml(order.orderNumber)}</td></tr>${itemRows(order)}</table></td></tr><tr><td class="pad" style="padding:34px 42px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td class="detail-cell" width="52%" valign="top" style="padding-right:30px"><p style="margin:0 0 14px;font-family:Arial,sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#201d1a">Shipping address</p><p style="margin:0;font-family:Arial,sans-serif;font-size:12px;line-height:20px;color:#6f675e"><strong style="color:#201d1a">${escapeHtml(order.customer.name)}</strong><br />${address}<br />${escapeHtml(order.customer.phone)}</p>${order.expectedDeliveryText ? `<p style="margin:18px 0 0;font-family:Arial,sans-serif;font-size:11px;line-height:18px;color:#9a7c43">Expected: ${escapeHtml(order.expectedDeliveryText)}</p>` : ""}</td><td class="detail-cell" width="48%" valign="top"><p style="margin:0 0 9px;font-family:Arial,sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#201d1a">Order total</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0">${totals}</table><p style="margin:18px 0 0;font-family:Arial,sans-serif;font-size:11px;line-height:18px;color:#6f675e">${escapeHtml(paymentLabel(order))}<br />Delivery: ${escapeHtml(courierLabel(order))}</p></td></tr></table></td></tr><tr><td class="pad" align="center" style="padding:40px 42px;background:#201d1a"><p style="margin:0 0 10px;font-family:Georgia,'Times New Roman',serif;font-size:25px;line-height:32px;color:#fffdf9">Some fragrances become memories.</p><p style="margin:0 0 24px;font-family:Arial,sans-serif;font-size:11px;line-height:18px;color:#bdb5aa">Discover scents crafted in Karachi and delivered across Pakistan.</p><a href="${escapeHtml(`${siteConfig.url}/shop`)}" style="display:inline-block;padding:13px 24px;border:1px solid #b49352;font-family:Arial,sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#fffdf9;text-decoration:none">Explore the collection</a></td></tr><tr><td class="pad" align="center" style="padding:30px 42px;background:#f8f4ec"><p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:11px;line-height:18px;color:#6f675e">Need help? Reply to this email or contact us at<br /><a href="mailto:${escapeHtml(siteConfig.email)}" style="color:#9a7c43;text-decoration:none">${escapeHtml(siteConfig.email)}</a> &nbsp;·&nbsp; <a href="https://wa.me/${escapeHtml(siteConfig.whatsappNumber)}" style="color:#9a7c43;text-decoration:none">${escapeHtml(siteConfig.phoneDisplay)}</a></p><p style="margin:0;font-family:Arial,sans-serif;font-size:9px;line-height:16px;letter-spacing:1px;color:#a39a8d">© ${new Date().getFullYear()} KHAYAL FRAGRANCE · KARACHI, PAKISTAN</p></td></tr></table></td></tr></table></body></html>`;
  return { subject: `${content.subject} — ${order.orderNumber}`, text, html };
}
