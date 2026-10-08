import { siteConfig } from "@/lib/site-config";
import type { IOrder } from "@/models/Order";

export const BRAND = {
  name: "KHAYAL",
  tagline: "Some fragrances become memories.",
  storeUrl: siteConfig.url,
  supportEmail: siteConfig.email,
  whatsapp: siteConfig.phoneDisplay,
  whatsappUrl: `https://wa.me/${siteConfig.whatsappNumber}`,
  instagram: siteConfig.social.instagram,
  currency: "Rs.",
  watermarkUrl: `${siteConfig.url}/images/khayal-watermark.png`,
  watermarkDarkUrl: `${siteConfig.url}/images/khayal-watermark.png`,
};

const C = {
  paper: "#F4EEE6",
  card: "#FBF8F4",
  ink: "#371930",
  soft: "#7B6873",
  line: "#E6DCD3",
  gold: "#6E345F",
  goldLight: "#D9C2D2",
  sage: "#5E7A62",
  rose: "#A4584E",
  night: "#34142C",
};

export type EmailOrderStatus =
  | "placed"
  | "pending_confirmation"
  | "payment_review"
  | "confirmed"
  | "processing"
  | "packed"
  | "dispatched"
  | "delivered"
  | "cancelled"
  | "return_requested"
  | "returned"
  | "payment_rejected"
  | "draft";

export interface OrderItem {
  name: string;
  variant?: string;
  qty: number;
  price: number;
  image?: string;
}

export interface OrderEmailData {
  customerName: string;
  orderNumber: string;
  orderDate?: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount?: number;
  total: number;
  paymentMethod?: string;
  shippingAddress?: string;
  trackingNumber?: string;
  courier?: string;
  trackingUrl?: string;
  reason?: string;
  orderUrl?: string;
  uploadProofUrl?: string;
  expectedDeliveryText?: string;
}

export interface WelcomeEmailData {
  customerName?: string;
  code: string;
  expiresAt?: string;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

const esc = (s: unknown) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const money = (n: number) =>
  `${BRAND.currency} ${Math.round(n).toLocaleString("en-PK")}`;

const firstName = (n?: string) => (n ? n.trim().split(/\s+/)[0] : "there");

const SERIF = `'Libre Caslon Text', 'Baskerville', Georgia, 'Times New Roman', serif`;
const SANS = `'Jost', 'Helvetica Neue', Helvetica, Arial, sans-serif`;

function absoluteUrl(value: string): string {
  if (/^https?:\/\//i.test(value)) return value;
  return `${BRAND.storeUrl}${value.startsWith("/") ? value : `/${value}`}`;
}

function layout(opts: { preheader: string; body: string; accent?: string }) {
  const accent = opts.accent ?? C.gold;
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>${BRAND.name}</title>
<link href="https://fonts.googleapis.com/css2?family=Libre+Caslon+Text:ital,wght@0,400;1,400&family=Jost:wght@300;400;500&display=swap" rel="stylesheet">
<style>
  body{margin:0;padding:0;width:100%!important;background:${C.paper};-webkit-font-smoothing:antialiased}
  table{border-collapse:collapse}
  img{border:0;line-height:100%;outline:none;text-decoration:none;display:block}
  a{color:${accent}}
  @keyframes kRise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
  @keyframes kTrail{0%{background-position:200% 0}100%{background-position:-200% 0}}
  @keyframes kPulse{0%{box-shadow:0 0 0 0 rgba(110,52,95,.55)}70%{box-shadow:0 0 0 9px rgba(110,52,95,0)}100%{box-shadow:0 0 0 0 rgba(110,52,95,0)}}
  @keyframes kGrow{from{width:0}}
  @keyframes kGlow{0%,100%{opacity:.55}50%{opacity:1}}
  .k-rise{animation:kRise .9s cubic-bezier(.2,.7,.2,1) both}
  .k-d1{animation-delay:.12s}.k-d2{animation-delay:.24s}.k-d3{animation-delay:.36s}.k-d4{animation-delay:.48s}
  .k-trail{background-image:linear-gradient(90deg,rgba(110,52,95,0) 0%,${C.goldLight} 50%,rgba(110,52,95,0) 100%)!important;background-size:200% 100%!important;animation:kTrail 4s linear infinite}
  .k-pulse{animation:kPulse 2.2s ease-out infinite}
  .k-grow{animation:kGrow 1.6s cubic-bezier(.2,.7,.2,1) .3s both}
  .k-glow{animation:kGlow 3s ease-in-out infinite}
  @media (prefers-reduced-motion:reduce){.k-rise,.k-trail,.k-pulse,.k-grow,.k-glow{animation:none!important}}
  @media only screen and (max-width:620px){
    .k-wrap{width:100%!important}
    .k-pad{padding-left:24px!important;padding-right:24px!important}
    .k-h1{font-size:34px!important;line-height:40px!important}
    .k-code{font-size:26px!important;letter-spacing:5px!important}
    .k-step-label{font-size:8px!important;letter-spacing:.5px!important}
    .k-hide-sm{display:none!important}
  }
  @media (prefers-color-scheme:dark){
    body,.k-bg{background:#1E0D19!important}
    .k-card{background-color:#28131F!important}
    .k-ink{color:#F4EEE6!important}
    .k-soft{color:#C2AFBA!important}
    .k-line{border-color:#4A2B40!important}
    .k-panel{background:rgba(52,25,43,0.75)!important}
    .k-wm{background-image:url('${BRAND.watermarkDarkUrl}')!important}
  }
</style>
</head>
<body style="margin:0;padding:0;background:${C.paper};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${esc(opts.preheader)}&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="k-bg" style="background:${C.paper};">
<tr><td align="center" style="padding:40px 12px;">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" class="k-wrap" style="width:600px;max-width:600px;">
    <tr><td align="center" style="background:${C.night};padding:30px 20px 24px;">
      <a href="${BRAND.storeUrl}" style="text-decoration:none;">
        <div style="font-family:${SERIF};font-size:30px;letter-spacing:12px;color:#F4EEE6;">${BRAND.name}</div>
        <div style="font-family:${SERIF};font-size:20px;color:${C.goldLight};margin-top:6px;">خیال</div>
      </a>
    </td></tr>
    <tr><td class="k-card k-wm" background="${BRAND.watermarkUrl}" style="background-color:${C.card};background-image:url('${BRAND.watermarkUrl}');background-repeat:no-repeat;background-position:center center;background-size:340px auto;border:1px solid ${C.line};border-top:none;">
      ${opts.body}
    </td></tr>
    <tr><td align="center" class="k-pad" style="padding:28px 40px 10px;">
      <div style="font-family:${SANS};font-size:11px;letter-spacing:2px;text-transform:uppercase;">
        <a href="${BRAND.storeUrl}/shop" style="color:${C.soft};text-decoration:none;" class="k-soft">Shop</a>
        <span style="color:${C.line};">&nbsp;&nbsp;·&nbsp;&nbsp;</span>
        <a href="${BRAND.instagram}" style="color:${C.soft};text-decoration:none;" class="k-soft">Instagram</a>
        <span style="color:${C.line};">&nbsp;&nbsp;·&nbsp;&nbsp;</span>
        <a href="mailto:${BRAND.supportEmail}" style="color:${C.soft};text-decoration:none;" class="k-soft">Help</a>
      </div>
      <div style="height:14px;"></div>
      <div class="k-soft" style="font-family:${SANS};font-size:11px;line-height:18px;color:#9C8C95;">
        Questions? Reply to this email or WhatsApp us at ${esc(BRAND.whatsapp)}.<br>
        © ${new Date().getFullYear()} ${esc(BRAND.name)} · Made in Pakistan
      </div>
    </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;
}

function hero(o: { eyebrow: string; title: string; text: string; accent?: string; icon?: string }) {
  const accent = o.accent ?? C.gold;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr><td align="center" class="k-pad" style="padding:52px 56px 8px;">
    ${o.icon ? `<div class="k-rise" style="font-size:22px;line-height:22px;color:${accent};margin-bottom:18px;">${o.icon}</div>` : ""}
    <div class="k-rise" style="font-family:${SANS};font-size:11px;letter-spacing:4px;text-transform:uppercase;color:${accent};font-weight:500;">${o.eyebrow}</div>
    <div style="height:16px;"></div>
    <h1 class="k-h1 k-ink k-rise k-d1" style="margin:0;font-family:${SERIF};font-weight:400;font-size:42px;line-height:48px;color:${C.ink};">${o.title}</h1>
    <div style="height:18px;"></div>
    <p class="k-soft k-rise k-d2" style="margin:0;font-family:${SANS};font-weight:300;font-size:15px;line-height:25px;color:${C.soft};">${o.text}</p>
  </td></tr></table>`;
}

function button(label: string, href: string, accent = C.ink) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" align="center" class="k-rise k-d3" style="margin:0 auto;">
  <tr><td align="center" style="background:${accent};">
    <a href="${esc(href)}" style="display:inline-block;padding:16px 38px;font-family:${SANS};font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#F6F1E8;text-decoration:none;font-weight:500;">${label}&nbsp;&nbsp;→</a>
  </td></tr></table>`;
}

function divider() {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td class="k-pad" style="padding:0 56px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="border-top:1px solid ${C.line};" class="k-line"></td>
      <td width="40" align="center" style="font-family:${SERIF};color:${C.gold};font-size:14px;line-height:10px;">✦</td>
      <td style="border-top:1px solid ${C.line};" class="k-line"></td>
    </tr></table>
  </td></tr></table>`;
}

function spacer(h: number) {
  return `<div style="height:${h}px;line-height:${h}px;font-size:0;">&nbsp;</div>`;
}

const STEPS = ["Placed", "Confirmed", "Processing", "Packed", "On the way", "Delivered"];

function tracker(current: number, complete = false) {
  const pct = complete ? 100 : Math.round((current / (STEPS.length - 1)) * 100);
  const cells = STEPS.map((label, i) => {
    const done = i < current || complete;
    const now = i === current && !complete;
    const dot = now
      ? `<div class="k-pulse" style="width:12px;height:12px;border-radius:12px;background:${C.gold};margin:0 auto;"></div>`
      : done
        ? `<div style="width:10px;height:10px;border-radius:10px;background:${C.gold};margin:1px auto;"></div>`
        : `<div style="width:8px;height:8px;border-radius:8px;border:1px solid #CFC3B0;background:${C.card};margin:1px auto;"></div>`;
    const color = now ? C.ink : done ? C.gold : "#B3A898";
    return `<td width="16.66%" align="center" valign="top" style="padding-top:2px;">
      ${dot}
      <div class="k-step-label ${now ? "k-ink" : ""}" style="font-family:${SANS};font-size:9px;letter-spacing:1.5px;text-transform:uppercase;color:${color};margin-top:10px;font-weight:${now ? 500 : 400};">${label}</div>
    </td>`;
  }).join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td class="k-pad" style="padding:34px 48px 6px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:0 8%;">
      <div style="height:2px;background:${C.line};" class="k-panel">
        <div class="k-grow" style="height:2px;width:${pct}%;background:${C.gold};"></div>
      </div>
    </td></tr></table>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:-7px;"><tr>${cells}</tr></table>
  </td></tr></table>`;
}

function panel(inner: string, accent = C.gold) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td class="k-pad" style="padding:0 56px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="k-panel k-rise k-d2" style="background:rgba(244,238,230,0.72);border-left:2px solid ${accent};">
      <tr><td style="padding:22px 26px;">${inner}</td></tr>
    </table>
  </td></tr></table>`;
}

function label(t: string) {
  return `<div style="font-family:${SANS};font-size:10px;letter-spacing:3px;text-transform:uppercase;color:${C.soft};" class="k-soft">${t}</div>`;
}

function orderMeta(d: OrderEmailData) {
  const col = (k: string, v: string) => `<td valign="top" style="padding:0 6px;">
      ${label(k)}
      <div class="k-ink" style="font-family:${SERIF};font-size:20px;color:${C.ink};margin-top:6px;">${v}</div>
    </td>`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td class="k-pad" style="padding:0 50px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      ${col("Order", `#${esc(d.orderNumber)}`)}
      ${d.orderDate ? col("Date", esc(d.orderDate)) : ""}
      ${col("Total", money(d.total))}
    </tr></table>
  </td></tr></table>`;
}

function itemsTable(d: OrderEmailData) {
  const rows = d.items
    .map((it) => {
      const img = it.image
        ? `<img src="${esc(it.image)}" width="64" height="80" alt="" style="width:64px;height:80px;object-fit:cover;background:${C.paper};">`
        : `<div style="width:64px;height:80px;background:linear-gradient(160deg,#EFE5D3,#D9C4A0);text-align:center;font-family:${SERIF};font-size:24px;line-height:80px;color:${C.gold};">✦</div>`;
      return `<tr>
        <td width="64" valign="top" style="padding:16px 0;border-bottom:1px solid ${C.line};" class="k-line">${img}</td>
        <td valign="middle" style="padding:16px 16px;border-bottom:1px solid ${C.line};" class="k-line">
          <div class="k-ink" style="font-family:${SERIF};font-size:20px;line-height:24px;color:${C.ink};">${esc(it.name)}</div>
          ${it.variant ? `<div class="k-soft" style="font-family:${SANS};font-size:12px;color:${C.soft};margin-top:4px;">${esc(it.variant)}</div>` : ""}
          <div class="k-soft" style="font-family:${SANS};font-size:12px;color:${C.soft};margin-top:4px;">Qty ${it.qty}</div>
        </td>
        <td align="right" valign="middle" style="padding:16px 0;border-bottom:1px solid ${C.line};font-family:${SANS};font-size:14px;color:${C.ink};white-space:nowrap;" class="k-line k-ink">${money(it.price * it.qty)}</td>
      </tr>`;
    })
    .join("");

  const line = (k: string, v: string, strong = false) => `<tr>
    <td style="padding:6px 0;font-family:${SANS};font-size:${strong ? 15 : 13}px;color:${strong ? C.ink : C.soft};" class="${strong ? "k-ink" : "k-soft"}">${k}</td>
    <td align="right" style="padding:6px 0;font-family:${strong ? SERIF : SANS};font-size:${strong ? 24 : 13}px;color:${C.ink};" class="k-ink">${v}</td>
  </tr>`;

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td class="k-pad" style="padding:0 56px;">
    ${label("Your selection")}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
    ${spacer(12)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${line("Subtotal", money(d.subtotal))}
      ${d.discount ? line("Discount", `− ${money(d.discount)}`) : ""}
      ${line("Shipping", d.shipping ? money(d.shipping) : "Complimentary")}
      <tr><td colspan="2" style="padding-top:8px;border-bottom:1px solid ${C.line};" class="k-line"></td></tr>
      ${line("Total", money(d.total), true)}
    </table>
  </td></tr></table>`;
}

function deliveryInfo(d: OrderEmailData) {
  if (!d.shippingAddress && !d.paymentMethod) return "";
  const block = (k: string, v: string) => `<td valign="top" width="50%" style="padding-right:12px;">
    ${label(k)}
    <div class="k-ink" style="font-family:${SANS};font-size:13px;line-height:21px;color:${C.ink};margin-top:8px;">${v}</div>
  </td>`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td class="k-pad" style="padding:0 56px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      ${d.shippingAddress ? block("Delivering to", esc(d.shippingAddress).replace(/\n/g, "<br>")) : ""}
      ${d.paymentMethod ? block("Payment", esc(d.paymentMethod)) : ""}
    </tr></table>
  </td></tr></table>`;
}

export function renderWelcomeEmail(d: WelcomeEmailData): RenderedEmail {
  const name = firstName(d.customerName);
  const body = `
  ${hero({
    eyebrow: "A gift, for you",
    title: `Welcome to the<br><em style="color:${C.gold};">world of Khayal</em>`,
    text: `Hello ${esc(name)}, every Khayal scent begins as a thought, a memory, a feeling. We're so glad you're here. To begin your story with us, here is a little something.`,
  })}
  ${spacer(36)}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td class="k-pad" align="center" style="padding:0 56px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="k-rise k-d2" style="background:${C.night};">
      <tr><td align="center" style="padding:34px 20px 30px;">
        <div style="font-family:${SANS};font-size:10px;letter-spacing:4px;text-transform:uppercase;color:${C.goldLight};">Your welcome code</div>
        <div style="height:14px;"></div>
        <div style="font-family:${SERIF};font-size:56px;line-height:56px;color:#F6F1E8;">5<span style="font-size:28px;">%</span> <em style="font-size:28px;color:${C.goldLight};">off</em></div>
        <div style="height:22px;"></div>
        <table role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>
          <td style="border:1px dashed ${C.gold};padding:14px 28px;">
            <div class="k-code" style="font-family:${SANS};font-size:24px;letter-spacing:4px;color:${C.goldLight};font-weight:500;">${esc(d.code)}</div>
          </td>
        </tr></table>
        <div style="height:10px;"></div>
        <div class="k-trail" style="height:1px;width:180px;margin:0 auto;background:${C.gold};font-size:0;line-height:1px;">&nbsp;</div>
        <div style="height:14px;"></div>
        <div style="font-family:${SANS};font-size:12px;color:#A99E8E;">${d.expiresAt ? `Valid until ${esc(d.expiresAt)} · ` : ""}Apply at checkout · Max ${money(500)} off</div>
      </td></tr>
    </table>
  </td></tr></table>
  ${spacer(36)}
  ${button("Discover the collection", `${BRAND.storeUrl}/shop`)}
  ${spacer(44)}
  ${divider()}
  ${spacer(32)}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td class="k-pad" style="padding:0 40px 48px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      ${[
        ["Long-lasting", "Concentrated oils that stay with you"],
        ["Crafted in Pakistan", "Blended in small batches"],
        ["Delivered nationwide", "Packed with care, to your door"],
      ]
        .map(
          ([t, s]) => `<td width="33%" align="center" valign="top" style="padding:0 8px;">
          <div style="font-family:${SERIF};color:${C.gold};font-size:16px;">✦</div>
          <div class="k-ink" style="font-family:${SERIF};font-size:17px;color:${C.ink};margin-top:6px;">${t}</div>
          <div class="k-soft" style="font-family:${SANS};font-size:11px;line-height:17px;color:${C.soft};margin-top:4px;">${s}</div>
        </td>`,
        )
        .join("")}
    </tr></table>
  </td></tr></table>`;

  return {
    subject: `Your 5% welcome gift from Khayal`,
    html: layout({ preheader: `Your code ${d.code} is inside. Welcome to Khayal.`, body }),
    text: `Welcome to Khayal, ${name}.\n\nHere is 5% off your first order.\nCode: ${d.code}${d.expiresAt ? `\nValid until ${d.expiresAt}` : ""}\n\nShop: ${BRAND.storeUrl}/shop\n\n— Khayal`,
  };
}

interface StatusConfig {
  subject: (d: OrderEmailData) => string;
  preheader: (d: OrderEmailData) => string;
  eyebrow: string;
  title: (d: OrderEmailData) => string;
  text: (d: OrderEmailData) => string;
  icon?: string;
  accent?: string;
  step?: number;
  complete?: boolean;
  extra?: (d: OrderEmailData) => string;
  cta?: (d: OrderEmailData) => { label: string; href: string } | null;
  showItems?: boolean;
}

const orderLink = (d: OrderEmailData) => d.orderUrl || BRAND.storeUrl;
const em = (t: string, color = C.gold) => `<em style="color:${color};">${t}</em>`;

const STATUS: Record<EmailOrderStatus, StatusConfig> = {
  placed: {
    subject: (d) => `We've received your order #${d.orderNumber}`,
    preheader: () => "Thank you. Your Khayal order has been received.",
    eyebrow: "Order received",
    icon: "✦",
    title: () => `Thank you,<br>${em("it's yours.")}`,
    text: (d) =>
      `Dear ${esc(firstName(d.customerName))}, your order has been received and is now in our hands. We'll keep you updated at every step of its journey to you.`,
    step: 0,
    showItems: true,
    cta: (d) => ({ label: "View your order", href: orderLink(d) }),
  },

  pending_confirmation: {
    subject: (d) => `Action needed: confirm your order #${d.orderNumber}`,
    preheader: () => "We'll reach out shortly to confirm your order details.",
    eyebrow: "Awaiting confirmation",
    icon: "◌",
    title: () => `Just one ${em("small step")}`,
    text: (d) =>
      `Dear ${esc(firstName(d.customerName))}, before we prepare your fragrance, our team will contact you by call or WhatsApp to confirm your order and delivery details.`,
    step: 1,
    extra: () =>
      `${label("Please keep your phone nearby")}<div class="k-ink" style="font-family:${SANS};font-size:14px;line-height:22px;color:${C.ink};margin-top:8px;">Our confirmation message will come from <strong>${esc(BRAND.whatsapp)}</strong>. Simply reply to confirm and we'll take it from there.</div>`,
    showItems: true,
  },

  payment_review: {
    subject: (d) => `Your payment for order #${d.orderNumber} is under review`,
    preheader: () => "We've received your payment proof and are verifying it.",
    eyebrow: "Payment under review",
    icon: "◌",
    title: () => `We're verifying<br>${em("your payment")}`,
    text: (d) =>
      `Thank you, ${esc(firstName(d.customerName))}. We've received your bank transfer proof. Verification usually takes a few working hours, and we'll write to you the moment it's confirmed.`,
    step: 1,
    extra: (d) =>
      `${label("Amount under review")}<div class="k-ink" style="font-family:${SERIF};font-size:28px;color:${C.ink};margin-top:6px;">${money(d.total)}</div>`,
    showItems: false,
  },

  confirmed: {
    subject: (d) => `Order #${d.orderNumber} is confirmed`,
    preheader: () => "Confirmed. Your scent is about to be prepared.",
    eyebrow: "Confirmed",
    icon: "✓",
    title: () => `Your order is<br>${em("confirmed")}`,
    text: (d) =>
      `Wonderful news, ${esc(firstName(d.customerName))}. Everything is in order and your fragrance will now begin its preparation.`,
    step: 1,
    showItems: true,
    cta: (d) => ({ label: "Track your order", href: orderLink(d) }),
  },

  processing: {
    subject: () => `Your Khayal scent is being prepared`,
    preheader: () => "Our team is preparing your order with care.",
    eyebrow: "In preparation",
    icon: "❋",
    title: () => `Being prepared<br>${em("with care")}`,
    text: () =>
      `Each bottle is checked, finished and readied by hand. Good things take a little time, and yours is well on its way.`,
    step: 2,
    showItems: false,
    cta: (d) => ({ label: "Track your order", href: orderLink(d) }),
  },

  packed: {
    subject: (d) => `Packed and ready: order #${d.orderNumber}`,
    preheader: () => "Wrapped, sealed and ready to leave our studio.",
    eyebrow: "Packed",
    icon: "❖",
    title: () => `Wrapped and ${em("sealed")}`,
    text: () =>
      `Your order is packed and waiting for our courier partner. You'll receive your tracking details as soon as it leaves our studio.`,
    step: 3,
    showItems: false,
    cta: (d) => ({ label: "Track your order", href: orderLink(d) }),
  },

  dispatched: {
    subject: (d) => `On its way: order #${d.orderNumber}`,
    preheader: (d) => `Tracking number ${d.trackingNumber ?? ""}. Your scent is on its way.`,
    eyebrow: "Dispatched",
    icon: "➝",
    title: () => `Your scent is<br>${em("on its way")}`,
    text: (d) =>
      `${esc(firstName(d.customerName))}, your order has left our studio and is travelling to you. ${d.expectedDeliveryText ? `Expected: ${esc(d.expectedDeliveryText)}.` : "Delivery usually takes 2 to 5 working days."}`,
    step: 4,
    extra: (d) =>
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
        <td valign="top">${label("Tracking number")}<div class="k-ink" style="font-family:${SANS};font-size:20px;letter-spacing:2px;color:${C.ink};margin-top:8px;font-weight:500;">${esc(d.trackingNumber ?? "—")}</div></td>
        ${d.courier ? `<td valign="top" align="right">${label("Courier")}<div class="k-ink" style="font-family:${SERIF};font-size:20px;color:${C.ink};margin-top:6px;">${esc(d.courier)}</div></td>` : ""}
      </tr></table>`,
    showItems: false,
    cta: (d) => (d.trackingUrl ? { label: "Track shipment", href: d.trackingUrl } : { label: "View your order", href: orderLink(d) }),
  },

  delivered: {
    subject: () => `Delivered. Wear it well.`,
    preheader: () => "Your Khayal order has arrived. We hope you love it.",
    eyebrow: "Delivered",
    icon: "✦",
    accent: C.sage,
    title: () => `It has ${em("arrived", C.sage)}`,
    text: (d) =>
      `Your order has been delivered, ${esc(firstName(d.customerName))}. Apply on pulse points, let it settle, and let it become part of your story. We'd love to hear what you think.`,
    step: 5,
    complete: true,
    extra: () =>
      `${label("A small ritual")}<div class="k-ink" style="font-family:${SERIF};font-style:italic;font-size:19px;line-height:27px;color:${C.ink};margin-top:8px;">Spray on wrists and neck. Don't rub, just let the notes unfold.</div>`,
    showItems: false,
    cta: () => ({ label: "Share your review", href: BRAND.storeUrl }),
  },

  cancelled: {
    subject: (d) => `Your order #${d.orderNumber} has been cancelled`,
    preheader: () => "Your order has been cancelled. Details inside.",
    eyebrow: "Order cancelled",
    icon: "—",
    accent: C.rose,
    title: () => `Your order has<br>${em("been cancelled", C.rose)}`,
    text: (d) =>
      `Dear ${esc(firstName(d.customerName))}, we're sorry to let you know that order #${esc(d.orderNumber)} has been cancelled. If you've already paid, your refund will be processed within 5 to 7 working days.`,
    extra: (d) =>
      `${label("Reason")}<div class="k-ink" style="font-family:${SANS};font-size:14px;line-height:22px;color:${C.ink};margin-top:8px;">${esc(d.reason || "No reason was provided.")}</div>`,
    showItems: true,
    cta: () => ({ label: "Continue shopping", href: `${BRAND.storeUrl}/shop` }),
  },

  return_requested: {
    subject: (d) => `Return request received for order #${d.orderNumber}`,
    preheader: () => "We've received your return request.",
    eyebrow: "Return requested",
    icon: "↺",
    title: () => `We've received your<br>${em("return request")}`,
    text: (d) =>
      `Dear ${esc(firstName(d.customerName))}, our team is reviewing your request and will contact you shortly with pickup details. Please keep the item in its original packaging.`,
    extra: (d) =>
      d.reason
        ? `${label("Your note")}<div class="k-ink" style="font-family:${SANS};font-size:14px;line-height:22px;color:${C.ink};margin-top:8px;">${esc(d.reason)}</div>`
        : `${label("What happens next")}<div class="k-ink" style="font-family:${SANS};font-size:14px;line-height:22px;color:${C.ink};margin-top:8px;">Review → Pickup → Inspection → Refund or exchange</div>`,
    showItems: true,
  },

  returned: {
    subject: (d) => `Your return for order #${d.orderNumber} is complete`,
    preheader: () => "Your return has been completed.",
    eyebrow: "Return complete",
    icon: "✓",
    accent: C.sage,
    title: () => `Your return is ${em("complete", C.sage)}`,
    text: (d) =>
      `Thank you for your patience, ${esc(firstName(d.customerName))}. Your return has been received and processed. If a refund applies, it will reach you within 5 to 7 working days.`,
    showItems: true,
    cta: () => ({ label: "Explore the collection", href: `${BRAND.storeUrl}/shop` }),
  },

  payment_rejected: {
    subject: (d) => `Action needed: payment for order #${d.orderNumber}`,
    preheader: () => "We couldn't verify your payment. Here's how to fix it.",
    eyebrow: "Payment not verified",
    icon: "!",
    accent: C.rose,
    title: () => `We couldn't verify<br>${em("your payment", C.rose)}`,
    text: (d) =>
      `Dear ${esc(firstName(d.customerName))}, unfortunately we weren't able to verify the payment proof for order #${esc(d.orderNumber)}. Your order is on hold, and you can re-upload a clear receipt to continue.`,
    extra: (d) =>
      `${label("Reason")}<div class="k-ink" style="font-family:${SANS};font-size:14px;line-height:22px;color:${C.ink};margin-top:8px;">${esc(d.reason || "The payment proof could not be matched.")}</div>`,
    showItems: false,
    cta: (d) => ({ label: "Upload new proof", href: d.uploadProofUrl || orderLink(d) }),
  },

  draft: {
    subject: (d) => `Your order #${d.orderNumber} is saved`,
    preheader: () => "Your order is saved as a draft.",
    eyebrow: "Saved as draft",
    icon: "◌",
    title: () => `Your order is ${em("on hold")}`,
    text: (d) =>
      `Dear ${esc(firstName(d.customerName))}, your order has been saved as a draft and hasn't been placed yet. Our team may reach out to finalise the details with you.`,
    showItems: true,
    cta: (d) => ({ label: "Review your order", href: orderLink(d) }),
  },
};

export function renderOrderEmail(status: EmailOrderStatus, d: OrderEmailData): RenderedEmail {
  const s = STATUS[status];
  if (!s) throw new Error(`Unknown order status: ${status}`);
  const accent = s.accent ?? C.gold;
  const cta = s.cta?.(d) ?? null;

  const parts: string[] = [
    hero({ eyebrow: s.eyebrow, title: s.title(d), text: s.text(d), accent, icon: s.icon }),
  ];
  if (s.step !== undefined) parts.push(tracker(s.step, s.complete));
  parts.push(spacer(34), orderMeta(d), spacer(28));
  if (s.extra) parts.push(panel(s.extra(d), accent), spacer(30));
  if (cta) parts.push(button(cta.label, cta.href, s.accent === C.rose ? C.rose : C.ink), spacer(40));
  if (s.showItems) parts.push(divider(), spacer(30), itemsTable(d), spacer(30));
  if (s.showItems && (d.shippingAddress || d.paymentMethod)) parts.push(deliveryInfo(d), spacer(44));
  else parts.push(spacer(14));

  return {
    subject: s.subject(d),
    html: layout({ preheader: s.preheader(d), body: parts.join("\n"), accent }),
    text: toText(status, d, s, cta),
  };
}

function toText(status: EmailOrderStatus, d: OrderEmailData, s: StatusConfig, cta: { label: string; href: string } | null) {
  const strip = (h: string) => h.replace(/<br\s*\/?>/g, " ").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
  const lines = [
    s.eyebrow.toUpperCase(),
    strip(s.title(d)),
    "",
    strip(s.text(d)),
    "",
    `Order #${d.orderNumber} · Total ${money(d.total)}`,
  ];
  if (status === "dispatched" && d.trackingNumber) lines.push(`Tracking: ${d.trackingNumber}${d.courier ? ` (${d.courier})` : ""}`);
  if (d.reason && ["cancelled", "payment_rejected", "return_requested"].includes(status)) lines.push(`Reason: ${d.reason}`);
  if (d.paymentMethod) lines.push(`Payment: ${d.paymentMethod}`);
  if (d.shippingAddress) lines.push(`Deliver to: ${d.shippingAddress.split("\n").join(", ")}`);
  if (s.showItems) {
    lines.push("", ...d.items.map((i) => `- ${i.name}${i.variant ? ` (${i.variant})` : ""} x${i.qty}  ${money(i.price * i.qty)}`));
  }
  if (cta) lines.push("", `${cta.label}: ${cta.href}`);
  lines.push("", `Questions? ${BRAND.supportEmail} · WhatsApp ${BRAND.whatsapp}`, "— Khayal");
  return lines.join("\n");
}

function courierLabel(order: IOrder): string {
  if (order.courier === "self_delivery") return "KHAYAL Delivery";
  if (order.courier === "unassigned") return "";
  return order.courier.toUpperCase();
}

export function mapOrderToEmailData(order: IOrder, reason?: string): OrderEmailData {
  const address = order.customer.address;
  const orderUrl = `${BRAND.storeUrl}/track-order`;
  return {
    customerName: order.customer.name,
    orderNumber: order.orderNumber,
    orderDate: new Date(order.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" }),
    items: order.items.map((item) => ({
      name: item.name,
      variant: item.variantName,
      qty: item.quantity,
      price: item.unitPrice,
      image: item.image ? absoluteUrl(item.image) : undefined,
    })),
    subtotal: order.subtotal,
    shipping: order.shipping,
    discount: order.discount || undefined,
    total: order.total,
    paymentMethod: order.paymentMethod === "cod" ? "Cash on Delivery" : "Bank Transfer",
    shippingAddress: [
      order.customer.name,
      address.line,
      address.area,
      `${address.city}, ${address.province}${address.postalCode ? ` ${address.postalCode}` : ""}`,
      order.customer.phone,
    ].join("\n"),
    trackingNumber: order.trackingNumber,
    courier: courierLabel(order),
    reason,
    orderUrl,
    uploadProofUrl: orderUrl,
    expectedDeliveryText: order.expectedDeliveryText,
  };
}
