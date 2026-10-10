import { dbConnect, toJSON } from "@/lib/mongoose";
import { Product, type IProduct } from "@/models/Product";
import { Order } from "@/models/Order";
import {
  WhatsAppSession,
  type IWhatsAppSession,
  type WhatsAppBotState,
} from "@/models/WhatsAppSession";
import { WhatsAppOptIn } from "@/models/WhatsAppOptIn";
import { sendText, sendButtons, sendList, sendImage } from "@/lib/whatsapp";
import { createOrder } from "@/lib/checkout";
import { normalizePhone } from "@/lib/phone";
import { siteConfig } from "@/lib/site-config";
import { formatPrice } from "@/lib/utils";
import { calculateShipping, isKarachi, getExpectedDeliveryText } from "@/lib/shipping";
import { getEnabledBankTransferConfig } from "@/lib/admin/bank-config";
import { bankDetailsAvailable, qrAvailable } from "@/lib/payment-options";
import type { IBankTransferConfig } from "@/models/BankTransferConfig";

const TESTER_LINE =
  "Every order includes a tester. Try it first; if the scent isn't for you, return the sealed bottle on delivery day.";

const PROVINCES: { match: RegExp; name: string }[] = [
  { match: /\bsindh\b/i, name: "Sindh" },
  { match: /\bpunjab\b/i, name: "Punjab" },
  { match: /\b(kpk|kp|khyber pakhtunkhwa|khyber)\b/i, name: "Khyber Pakhtunkhwa" },
  { match: /\b(balochistan|baluchistan)\b/i, name: "Balochistan" },
  { match: /\b(islamabad|ict)\b/i, name: "Islamabad" },
  { match: /\b(gilgit|gilgit-baltistan|gb)\b/i, name: "Gilgit-Baltistan" },
  { match: /\b(ajk|azad kashmir|azad jammu)\b/i, name: "Azad Kashmir" },
];

/** Accepts "Karachi", "Karachi Sindh" or "Lahore, Punjab" and returns a city and province. */
export function parseCityProvince(raw: string): { city: string; province: string } | null {
  const text = raw.trim().replace(/\s+/g, " ");
  if (text.length < 2 || text.length > 100) return null;
  if (text.includes(",")) {
    const [city, ...rest] = text.split(",").map((p) => p.trim()).filter(Boolean);
    if (!city) return null;
    return { city, province: rest.join(", ") || (isKarachi(city) ? "Sindh" : city) };
  }
  const found = PROVINCES.find((p) => p.match.test(text));
  if (found) {
    const city = text.replace(found.match, "").trim() || text;
    return { city, province: found.name };
  }
  return { city: text, province: isKarachi(text) ? "Sindh" : text };
}

function paymentLabel(method?: string): string {
  return method === "cod" ? "Cash on Delivery" : "Bank Transfer / QR";
}

async function paymentButtons(): Promise<{ id: string; title: string }[]> {
  const config = await getEnabledBankTransferConfig();
  const buttons = [{ id: "pay_cod", title: "Cash on Delivery" }];
  if (config) {
    buttons.push({
      id: "pay_bank",
      title: bankDetailsAvailable(config) && qrAvailable(config) ? "Bank / QR" : qrAvailable(config) ? "QR Payment" : "Bank Transfer",
    });
  }
  return buttons;
}

async function sendPaymentDetails(waId: string, orderNumber: string, total: number, config: IBankTransferConfig) {
  const lines = [`*How to pay for ${orderNumber}*`, `Amount: ${formatPrice(total, "PKR")}`];
  if (bankDetailsAvailable(config)) {
    lines.push(
      "",
      `Bank: ${config.bankName}`,
      `Account title: ${config.accountTitle}`,
      ...(config.accountNumber ? [`Account #: ${config.accountNumber}`] : []),
      ...(config.iban ? [`IBAN: ${config.iban}`] : [])
    );
  }
  if (config.instructions) lines.push("", config.instructions);
  lines.push("", "After paying, send the payment screenshot here and we'll confirm your order.");
  await sendText(waId, lines.join("\n"));
  if (qrAvailable(config) && config.qrImageUrl) {
    await sendImage(
      waId,
      config.qrImageUrl,
      `${bankDetailsAvailable(config) ? "Or scan" : "Scan"} to pay${config.qrLabel ? ` (${config.qrLabel})` : ""}. Use ${orderNumber} as the reference.`
    );
  }
}

const MENU_KEYWORDS = ["hi", "hello", "hey", "salam", "start", "menu", "restart", "aoa", "assalam"];

async function getSession(waId: string): Promise<IWhatsAppSession> {
  const doc = await WhatsAppSession.findOneAndUpdate(
    { waId },
    { $setOnInsert: { waId, state: "menu" } },
    { upsert: true, new: true }
  );
  return toJSON(doc) as unknown as IWhatsAppSession;
}

async function setState(waId: string, patch: Partial<IWhatsAppSession>) {
  await WhatsAppSession.findOneAndUpdate({ waId }, { $set: patch });
}

async function resetToMenu(waId: string) {
  await WhatsAppSession.findOneAndUpdate(
    { waId },
    {
      $set: { state: "menu" as WhatsAppBotState },
      $unset: {
        productId: "",
        variantId: "",
        quantity: "",
        customerName: "",
        city: "",
        province: "",
        addressLine: "",
        paymentMethod: "",
        orderKey: "",
        trackPhone: "",
      },
    }
  );
}

async function showMenu(waId: string) {
  await sendButtons(
    waId,
    "Assalamualaikum! Welcome to *KHAYAL* ✦\nLong-lasting extraits de parfum, crafted in Karachi and delivered across Pakistan. Cash on delivery available.\n\nHow can I help you today?",
    [
      { id: "menu_browse", title: "Browse Perfumes" },
      { id: "menu_track", title: "Track My Order" },
      { id: "menu_human", title: "Talk to a Human" },
    ]
  );
}

async function showProducts(waId: string) {
  const products = (toJSON(
    await Product.find({ status: "active", stock: { $gt: 0 } }).sort({ createdAt: -1 }).limit(10).lean()
  ) || []) as IProduct[];

  if (!products.length) {
    await sendText(waId, "We're restocking right now — please check back soon or type *human* to talk to our team.");
    return;
  }

  await sendList(
    waId,
    "Here are our available fragrances. Tap one to see details and order:",
    "View Perfumes",
    products.map((p) => ({
      id: `prod_${p._id}`,
      title: p.title.slice(0, 24),
      description: `${formatPrice(p.price, "PKR")} · ${p.sizeMl || 50}ml · ${p.category || "Fragrance"}`,
    }))
  );
  await setState(waId, { state: "browse" });
}

async function showProduct(waId: string, productId: string) {
  const product = (toJSON(
    await Product.findOne({ _id: productId, status: "active" }).lean()
  ) as unknown as IProduct | null);

  if (!product) {
    await sendText(waId, "Sorry, that fragrance is no longer available. Type *menu* to start over.");
    await resetToMenu(waId);
    return;
  }

  const inStock = (product.stock ?? 0) > 0;
  const notes = [
    product.scentNotesTop?.length ? `Top: ${product.scentNotesTop.join(", ")}` : "",
    product.scentNotesHeart?.length ? `Heart: ${product.scentNotesHeart.join(", ")}` : "",
    product.scentNotesBase?.length ? `Base: ${product.scentNotesBase.join(", ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  await sendButtons(
    waId,
    `*${product.title}*\n${formatPrice(product.price, "PKR")} · ${product.sizeMl || 50}ml\n\n${(product.description || "").slice(0, 300)}\n\n${notes ? `*Notes*\n${notes}\n\n` : ""}${inStock ? "In stock — ready to ship." : "Currently out of stock."}`,
    inStock
      ? [
          { id: `order_${product._id}`, title: "Order This" },
          { id: "menu_browse", title: "Back to List" },
          { id: "menu_main", title: "Main Menu" },
        ]
      : [
          { id: "menu_browse", title: "Back to List" },
          { id: "menu_main", title: "Main Menu" },
        ]
  );
  await setState(waId, { state: "product", productId, variantId: product.variants?.[0]?.id });
}

async function askQuantity(waId: string, unitPrice?: number) {
  const threshold = siteConfig.freeShippingThreshold;
  const needed = unitPrice && unitPrice > 0 ? Math.ceil(threshold / unitPrice) : 0;
  const nudge =
    needed > 1
      ? `\n\nDelivery is free on orders over ${formatPrice(threshold, "PKR")}. Choose ${needed} bottles, or add a second scent later, and delivery is free.`
      : "";
  await sendList(waId, `How many bottles would you like?${nudge}`, "Select Quantity", [
    { id: "qty_1", title: "1 bottle" },
    { id: "qty_2", title: "2 bottles" },
    { id: "qty_3", title: "3 bottles" },
    { id: "qty_4", title: "4 bottles" },
    { id: "qty_5", title: "5 bottles" },
  ]);
  await setState(waId, { state: "quantity" });
}

async function showSummary(waId: string, session: IWhatsAppSession) {
  const product = (toJSON(
    await Product.findById(session.productId).lean()
  ) as unknown as IProduct | null);
  if (!product) {
    await resetToMenu(waId);
    await showMenu(waId);
    return;
  }
  const subtotal = product.price * (session.quantity || 1);
  const shipping = calculateShipping(subtotal);
  const total = subtotal + shipping;
  await sendButtons(
    waId,
    `*Order Summary*\n\n${session.quantity}x ${product.title}\nSubtotal: ${formatPrice(subtotal, "PKR")}\nDelivery: ${shipping === 0 ? "FREE" : formatPrice(shipping, "PKR")}\n*Total: ${formatPrice(total, "PKR")}*${session.paymentMethod === "cod" ? " (pay on delivery)" : ""}\n\n*Deliver to:*\n${session.customerName}\n${session.addressLine}\n${session.city}, ${session.province}\nPhone: +${waId}\n\nPayment: ${paymentLabel(session.paymentMethod)}\n\n${TESTER_LINE}`,
    [
      { id: "order_confirm", title: "Confirm Order" },
      { id: "order_cancel", title: "Cancel" },
    ]
  );
  await setState(waId, { state: "confirm", orderKey: crypto.randomUUID() });
}

async function placeOrder(waId: string, session: IWhatsAppSession) {
  const result = await createOrder({
    idempotencyKey: session.orderKey || crypto.randomUUID(),
    customer: { name: session.customerName!, phone: `+${waId}` },
    address: {
      line: session.addressLine!,
      area: session.city!,
      city: session.city!,
      province: session.province || session.city!,
    },
    items: [
      {
        productId: session.productId!,
        variantId: session.variantId,
        quantity: session.quantity || 1,
      },
    ],
    paymentMethod: session.paymentMethod!,
    channel: "KHAYAL_WHATSAPP",
    customerNotes: "Order placed via WhatsApp bot",
  });

  if (!result.success) {
    await sendButtons(
      waId,
      `Sorry, we couldn't place your order: ${result.error}\n\nWant to try again?`,
      [
        { id: "menu_browse", title: "Browse Again" },
        { id: "menu_human", title: "Talk to a Human" },
      ]
    );
    await resetToMenu(waId);
    return;
  }

  const order = result.order;
  const trackUrl = `${siteConfig.url}/track-order`;
  await sendText(
    waId,
    `*Order Confirmed* ✦\n\nOrder: *${order.orderNumber}*\nTotal: ${formatPrice(order.total, "PKR")}\nDelivery: ${order.expectedDeliveryText}\n\nTrack anytime at: ${trackUrl}\nQuestions? Just reply here.\n\nThank you for choosing KHAYAL!`
  );
  if (session.paymentMethod === "bank_transfer") {
    const config = await getEnabledBankTransferConfig();
    if (config) {
      await sendPaymentDetails(waId, order.orderNumber, order.total, config);
    } else {
      await sendText(waId, "Our team will send you the payment details shortly.");
    }
  }
  await resetToMenu(waId);
  await askMarketingOptIn(waId);
}

async function askMarketingOptIn(waId: string) {
  const existing = await WhatsAppOptIn.findOne({ waId }).lean();
  if (existing) return;
  await sendButtons(
    waId,
    "Would you like to hear about new KHAYAL scents and offers here on WhatsApp? You can stop anytime by replying STOP.",
    [
      { id: "optin_yes", title: "Yes, keep me posted" },
      { id: "optin_no", title: "No thanks" },
    ]
  );
}

async function recordOptIn(waId: string, optedIn: boolean) {
  await WhatsAppOptIn.findOneAndUpdate(
    { waId },
    { $set: { optedIn, decidedAt: new Date() }, $setOnInsert: { waId, source: "whatsapp_bot_after_order" } },
    { upsert: true }
  );
}

async function handleTrack(waId: string, text: string, session: IWhatsAppSession) {
  if (!session.trackPhone) {
    const orderNumber = text.trim().toUpperCase();
    const order = await Order.findOne({ orderNumber }).lean();
    if (!order) {
      await sendText(waId, `I couldn't find order *${orderNumber}*. Check the number on your confirmation, or type *menu* to go back.`);
      return;
    }
    const orderPhone = order.customer.normalizedPhone || order.customer.phone;
    const waPhone = normalizePhone(`+${waId}`).e164;
    if (orderPhone !== waPhone && orderPhone !== `+${waId}`) {
      await sendText(waId, "For your privacy, I can only show orders placed from this WhatsApp number. Type *menu* to go back.");
      await resetToMenu(waId);
      return;
    }
    await sendText(
      waId,
      `*${order.orderNumber}*\nStatus: ${order.orderStatus.replace(/_/g, " ")}\nTotal: ${formatPrice(order.total, order.currency)}\nDelivery: ${order.expectedDeliveryText}${order.trackingNumber ? `\nTracking: ${order.trackingNumber}` : ""}\n\nType *menu* for anything else.`
    );
    await resetToMenu(waId);
    return;
  }
}

export async function handleIncomingMessage(
  waId: string,
  messageId: string,
  type: string,
  text: string,
  replyId?: string
): Promise<void> {
  await dbConnect();
  const session = await getSession(waId);

  if (session.lastMessageId === messageId) return; // Meta retries
  await setState(waId, { lastMessageId: messageId });

  const lowered = text.trim().toLowerCase();
  const input = replyId || text.trim();

  // Global shortcuts
  if (MENU_KEYWORDS.some((k) => lowered === k || lowered.startsWith(k + " ")) || input === "menu_main") {
    await resetToMenu(waId);
    await showMenu(waId);
    return;
  }
  if (input === "optin_yes" || input === "optin_no") {
    await recordOptIn(waId, input === "optin_yes");
    await sendText(
      waId,
      input === "optin_yes"
        ? "Thank you. We'll only message you about new scents and offers. Reply STOP anytime."
        : "No problem. We'll only message you about your orders."
    );
    return;
  }
  if (lowered === "stop" || lowered === "unsubscribe") {
    await recordOptIn(waId, false);
    await sendText(waId, "You won't receive offers from KHAYAL on WhatsApp. We'll still message you about your orders.");
    return;
  }
  if (input === "menu_human") {
    await sendText(
      waId,
      `Our team is happy to help.\n\n📞 ${siteConfig.phoneDisplay}\n✉️ ${siteConfig.email}\n\nOr keep chatting here — we reply on this number too.`
    );
    return;
  }
  if (input === "menu_track") {
    await sendText(waId, "Send me your order number (e.g., K-20251004-AB12) and I'll check its status.");
    await setState(waId, { state: "track", trackPhone: waId });
    return;
  }
  if (input === "menu_browse") {
    await showProducts(waId);
    return;
  }

  switch (session.state) {
    case "menu": {
      if (input.startsWith("prod_")) {
        await showProduct(waId, input.slice(5));
      } else {
        await showMenu(waId);
      }
      return;
    }

    case "browse": {
      if (input.startsWith("prod_")) {
        await showProduct(waId, input.slice(5));
      } else {
        await showProducts(waId);
      }
      return;
    }

    case "product": {
      if (input.startsWith("order_")) {
        const product = (toJSON(
          await Product.findById(session.productId).lean()
        ) as unknown as IProduct | null);
        await askQuantity(waId, product?.price);
      } else if (input.startsWith("prod_")) {
        await showProduct(waId, input.slice(5));
      } else {
        await showProduct(waId, session.productId!);
      }
      return;
    }

    case "quantity": {
      const qty = input.startsWith("qty_") ? Number(input.slice(4)) : Number(text);
      if (!qty || qty < 1 || qty > 10) {
        await sendText(waId, "Please pick a quantity (1–5) from the list, or type a number.");
        const product = (toJSON(
          await Product.findById(session.productId).lean()
        ) as unknown as IProduct | null);
        await askQuantity(waId, product?.price);
        return;
      }
      await setState(waId, { quantity: qty, state: "name" });
      await sendText(waId, "Great choice. What's your *full name* for delivery?");
      return;
    }

    case "name": {
      if (text.trim().length < 2 || text.trim().length > 100) {
        await sendText(waId, "Please send your full name (2–100 characters).");
        return;
      }
      await setState(waId, { customerName: text.trim(), state: "city_province" });
      await sendText(waId, "Thanks! Which *city* should we deliver to? (e.g. Karachi)");
      return;
    }

    case "city_province": {
      const parsed = parseCityProvince(text);
      if (!parsed) {
        await sendText(waId, "Please send the name of your city, e.g. Karachi or Lahore.");
        return;
      }
      await setState(waId, { city: parsed.city, province: parsed.province, state: "address" });
      await sendText(
        waId,
        `Almost done. Send your *full delivery address* (house, street, area).\n\nDelivery to ${parsed.city}: ${getExpectedDeliveryText(parsed.city).toLowerCase()}.`
      );
      return;
    }

    case "address": {
      if (text.trim().length < 10) {
        await sendText(waId, "Please send a complete address (house number, street, area) — at least 10 characters.");
        return;
      }
      await setState(waId, { addressLine: text.trim(), state: "payment" });
      await sendButtons(waId, "How would you like to pay?", await paymentButtons());
      return;
    }

    case "payment": {
      const bankOffered = input === "pay_bank" && Boolean(await getEnabledBankTransferConfig());
      const method = input === "pay_cod" ? "cod" : bankOffered ? "bank_transfer" : null;
      if (!method) {
        await sendButtons(waId, "Please choose a payment method:", await paymentButtons());
        return;
      }
      const updated = { ...session, paymentMethod: method as "cod" | "bank_transfer" };
      await setState(waId, { paymentMethod: method });
      await showSummary(waId, updated);
      return;
    }

    case "confirm": {
      if (input === "order_confirm") {
        await placeOrder(waId, session);
      } else if (input === "order_cancel") {
        await sendText(waId, "No problem — order cancelled. Type *menu* whenever you're ready.");
        await resetToMenu(waId);
      } else {
        await showSummary(waId, session);
      }
      return;
    }

    case "track": {
      await handleTrack(waId, text, { ...session, trackPhone: waId });
      return;
    }

    default: {
      await resetToMenu(waId);
      await showMenu(waId);
    }
  }
}

