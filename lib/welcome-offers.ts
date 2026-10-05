"use server";

import crypto from "crypto";
import { dbConnect, toJSON } from "@/lib/mongoose";
import { Subscriber, type ISubscriber } from "@/models/Subscriber";
import { WelcomeOffer, type IWelcomeOffer } from "@/models/WelcomeOffer";
import { WelcomeDiscountConfig } from "@/models/WelcomeDiscountConfig";
import { Order } from "@/models/Order";
import { sendEmail, getEmailFrom, getEmailReplyTo } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";
import { captureAttribution } from "@/lib/attribution";
import { siteConfig } from "@/lib/site-config";
import { getWhatsAppUrl } from "@/lib/site-config";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // excludes ambiguous chars

function getEncryptionKey(): Buffer {
  const secret = process.env.AUTH_SECRET || process.env.WELCOME_CODE_ENCRYPTION_KEY;
  if (!secret) throw new Error("AUTH_SECRET or WELCOME_CODE_ENCRYPTION_KEY is required for welcome code encryption");
  return crypto.createHash("sha256").update(secret).digest();
}

function encryptCode(code: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(code, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted.toString("hex")}`;
}

function decryptCode(encrypted: string): string {
  const [ivHex, authTagHex, encryptedHex] = encrypted.split(":");
  if (!ivHex || !authTagHex || !encryptedHex) throw new Error("Invalid encrypted code format");
  const key = getEncryptionKey();
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedHex, "hex")), decipher.final()]);
  return decrypted.toString("utf8");
}

export interface WelcomeSignupResult {
  ok: boolean;
  message: string;
}

export interface WelcomeCouponResult {
  valid: true;
  discount: number;
  percentage: number;
  maxDiscount: number;
  codeHash: string;
  offerId: string;
  subscriberId: string;
  expiryDate: Date;
  message?: string;
}

export interface WelcomeCouponError {
  valid: false;
  reason: "invalid_email" | "invalid_code" | "expired" | "redeemed" | "email_mismatch" | "existing_customer" | "rate_limited" | "not_active" | "stacking_forbidden" | "server_error";
  message: string;
  retryAfterSeconds?: number;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

function generateWelcomeCode(): string {
  const bytes = crypto.randomBytes(8);
  const parts: string[] = [];
  for (let i = 0; i < 8; i++) {
    parts.push(CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length]);
  }
  return `KHAYAL-${parts.slice(0, 4).join("")}-${parts.slice(4, 8).join("")}`;
}

function hashCode(code: string): string {
  return crypto.createHash("sha256").update(code.trim().toUpperCase()).digest("hex");
}

function codeHint(code: string): string {
  return `${code.slice(0, 6)}...${code.slice(-2)}`;
}

export async function getWelcomeDiscountConfig() {
  await dbConnect();
  const config = await WelcomeDiscountConfig.findOne().sort({ createdAt: -1 }).lean();
  return toJSON(config) as unknown as { enabled: boolean; percentage: number; maxDiscount: number; validityDays: number; popupDelaySeconds?: number; dismissalSuppressionDays?: number; emailSubject?: string; emailPreviewText?: string } | null;
}

export async function createWelcomeSignup(
  email: string,
  source: string = "popup",
  pagePath: string = ""
): Promise<WelcomeSignupResult> {
  const normalizedEmail = normalizeEmail(email);
  if (!isValidEmail(normalizedEmail)) {
    return { ok: false, message: "Please enter a valid email address." };
  }

  const emailKey = `welcome-signup-email:${normalizedEmail}`;
  const emailLimit = checkRateLimit(emailKey, 5, 60 * 60 * 1000); // 5 per hour per email
  if (!emailLimit.allowed) {
    return { ok: false, message: "Too many attempts. Please try again later." };
  }

  await dbConnect();
  const config = await getWelcomeDiscountConfig();
  const offerEnabled = Boolean(config?.enabled);
  const attribution = await captureAttribution();

  const subscriber = await Subscriber.findOne({ normalizedEmail }).lean();

  if (subscriber) {
    const sub = subscriber as unknown as ISubscriber;
    if (sub.unsubscribed) {
      return { ok: false, message: "This email is unsubscribed." };
    }
    if (sub.welcomeOfferId) {
      const existingOffer = await WelcomeOffer.findById(sub.welcomeOfferId).lean();
      if (existingOffer) {
        const offer = existingOffer as unknown as IWelcomeOffer;
        if (offer.status === "active" && new Date(offer.expiresAt) > new Date()) {
          // Resend existing active code
          const sendResult = await sendWelcomeEmail(normalizedEmail, sub._id.toString(), offer.codeHash);
          await updateSubscriberEmailStatus(sub._id.toString(), sendResult);
          await Subscriber.findByIdAndUpdate(sub._id, {
            welcomeCodeStatus: "resent",
            updatedAt: new Date(),
          });
          return { ok: true, message: "Your welcome code has been resent." };
        }
        if (offer.status === "redeemed") {
          return { ok: false, message: "This email has already redeemed a welcome offer." };
        }
      }
    }
  }

  // Create or update subscriber regardless of offer state
  const subscriberDoc = await Subscriber.findOneAndUpdate(
    { normalizedEmail },
    {
      email,
      normalizedEmail,
      source,
      subscribed: true,
      consentAt: new Date(),
      consentSource: source,
      signupPage: pagePath,
      attribution,
      emailDeliveryStatus: "pending",
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  if (!offerEnabled) {
    return { ok: true, message: "Thank you for subscribing." };
  }

  const offer = await createWelcomeOffer(subscriberDoc._id.toString(), normalizedEmail, config!);

  await Subscriber.findByIdAndUpdate(subscriberDoc._id, {
    welcomeCodeStatus: "issued",
    welcomeCodeIssuedAt: offer.issuedAt,
    welcomeCodeExpiresAt: offer.expiresAt,
    welcomeOfferId: offer._id.toString(),
  });

  const sendResult = await sendWelcomeEmail(normalizedEmail, subscriberDoc._id.toString(), offer.codeHash);
  await updateSubscriberEmailStatus(subscriberDoc._id.toString(), sendResult);

  return { ok: true, message: "Your welcome code is on its way." };
}

export async function resendWelcomeCode(
  email: string
): Promise<WelcomeSignupResult> {
  const normalizedEmail = normalizeEmail(email);
  if (!isValidEmail(normalizedEmail)) {
    return { ok: false, message: "Please enter a valid email address." };
  }

  const rate = checkRateLimit(`welcome-resend:${normalizedEmail}`, 3, 60 * 60 * 1000);
  if (!rate.allowed) {
    return { ok: false, message: "Too many resend attempts. Please try again later." };
  }

  await dbConnect();
  const subscriber = await Subscriber.findOne({ normalizedEmail }).lean();
  if (!subscriber) {
    return { ok: true, message: "If a welcome code exists for this email, it has been resent." };
  }

  const sub = subscriber as unknown as ISubscriber;
  if (!sub.welcomeOfferId) {
    return { ok: true, message: "If a welcome code exists for this email, it has been resent." };
  }

  const offer = await WelcomeOffer.findById(sub.welcomeOfferId).lean();
  if (!offer || (offer as unknown as IWelcomeOffer).status !== "active") {
    return { ok: true, message: "If a welcome code exists for this email, it has been resent." };
  }

  const sendResult = await sendWelcomeEmail(normalizedEmail, sub._id.toString(), (offer as unknown as IWelcomeOffer).codeHash);
  await updateSubscriberEmailStatus(sub._id.toString(), sendResult);
  await Subscriber.findByIdAndUpdate(sub._id, { welcomeCodeStatus: "resent" });

  return { ok: true, message: "Your welcome code has been resent." };
}

async function createWelcomeOffer(
  subscriberId: string,
  normalizedEmail: string,
  config: { percentage: number; maxDiscount: number; validityDays: number }
): Promise<IWelcomeOffer> {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + config.validityDays * 24 * 60 * 60 * 1000);

  let code = generateWelcomeCode();
  let codeHash = hashCode(code);
  let attempts = 0;
  while ((await WelcomeOffer.countDocuments({ codeHash })) > 0 && attempts < 10) {
    code = generateWelcomeCode();
    codeHash = hashCode(code);
    attempts++;
  }
  if (attempts >= 10) {
    throw new Error("Unable to generate unique welcome code");
  }

  const rawCode = code; // sent to email only
  const offerDoc = await WelcomeOffer.create({
    codeHash,
    codeEncrypted: encryptCode(rawCode),
    codeHint: codeHint(rawCode),
    subscriberId,
    normalizedEmail,
    type: "WELCOME_FIRST_ORDER",
    discountType: "PERCENTAGE",
    value: config.percentage,
    maxDiscount: config.maxDiscount,
    currency: "PKR",
    validityDays: config.validityDays,
    status: "active",
    stackable: false,
    channel: "KHAYAL_WEBSITE",
    issuedAt: now,
    expiresAt,
  });

  return toJSON(offerDoc) as unknown as IWelcomeOffer;
}

async function sendWelcomeEmail(
  to: string,
  subscriberId: string,
  codeHash: string
): Promise<{ ok: boolean; providerResponse?: string; error?: string }> {
  await dbConnect();
  const offer = await WelcomeOffer.findOne({ codeHash }).lean();
  if (!offer) return { ok: false, error: "Offer not found" };

  const offerTyped = offer as unknown as IWelcomeOffer;
  let rawCode: string;
  try {
    rawCode = decryptCode(offerTyped.codeEncrypted);
  } catch {
    return { ok: false, error: "Unable to decrypt welcome code" };
  }

  const config = await getWelcomeDiscountConfig();
  const expiryDate = new Date((offer as unknown as IWelcomeOffer).expiresAt).toLocaleDateString("en-PK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const subject = config?.emailSubject || "Welcome to KHAYAL — Your 5% Code Is Inside";
  const previewText = config?.emailPreviewText || "A personal welcome offer for your first KHAYAL order.";

  const html = buildWelcomeEmailHtml(rawCode, expiryDate, previewText);
  const text = buildWelcomeEmailText(rawCode, expiryDate);

  const result = await sendEmail({
    to,
    from: getEmailFrom(),
    replyTo: getEmailReplyTo(),
    subject,
    html,
    text,
  });

  return result.ok
    ? { ok: true, providerResponse: result.providerResponse }
    : { ok: false, error: result.error };
}

async function updateSubscriberEmailStatus(
  subscriberId: string,
  result: { ok: boolean; providerResponse?: string; error?: string }
): Promise<void> {
  await Subscriber.findByIdAndUpdate(subscriberId, {
    emailDeliveryStatus: result.ok ? "sent" : "failed",
    emailProviderResponse: result.providerResponse || undefined,
    emailFailureReason: result.error || undefined,
  });
}

export async function validateWelcomeCoupon(
  code: string,
  email: string,
  currentSubtotal: number,
  existingDiscountCode?: string
): Promise<WelcomeCouponResult | WelcomeCouponError> {
  const normalizedEmail = normalizeEmail(email);
  if (!isValidEmail(normalizedEmail)) {
    return { valid: false, reason: "invalid_email", message: "Please enter a valid email address." };
  }
  if (!code || code.trim().length === 0) {
    return { valid: false, reason: "invalid_code", message: "This welcome code is not valid." };
  }
  if (existingDiscountCode && existingDiscountCode.toUpperCase() !== code.trim().toUpperCase()) {
    return { valid: false, reason: "stacking_forbidden", message: "This offer cannot be combined with another discount." };
  }

  await dbConnect();
  const codeHash = hashCode(code);
  const offer = await WelcomeOffer.findOne({ codeHash }).lean();

  if (!offer) {
    return { valid: false, reason: "invalid_code", message: "This welcome code is not valid." };
  }

  const offerTyped = offer as unknown as IWelcomeOffer;
  const now = new Date();

  if (offerTyped.status === "redeemed") {
    return { valid: false, reason: "redeemed", message: "This welcome code has already been used." };
  }
  if (offerTyped.status !== "active" || now > new Date(offerTyped.expiresAt)) {
    return { valid: false, reason: "expired", message: "This welcome code has expired." };
  }
  if (offerTyped.normalizedEmail !== normalizedEmail) {
    return { valid: false, reason: "email_mismatch", message: "This welcome code was issued to a different email address. Please use the same email that received the code." };
  }

  const existingOrder = await Order.findOne({
    "customer.normalizedEmail": normalizedEmail,
    orderStatus: { $nin: ["cancelled"] },
    paymentStatus: { $nin: ["rejected"] },
  }).lean();

  if (existingOrder) {
    return { valid: false, reason: "existing_customer", message: "This offer is available on your first KHAYAL order." };
  }

  const discount = Math.min(currentSubtotal * (offerTyped.value / 100), offerTyped.maxDiscount);

  return {
    valid: true,
    discount,
    percentage: offerTyped.value,
    maxDiscount: offerTyped.maxDiscount,
    codeHash,
    offerId: offerTyped._id.toString(),
    subscriberId: offerTyped.subscriberId,
    expiryDate: new Date(offerTyped.expiresAt),
    message: `5% off applied (max PKR ${offerTyped.maxDiscount.toLocaleString("en-PK")}).`,
  };
}

export async function redeemWelcomeOffer(
  code: string,
  email: string,
  orderId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const normalizedEmail = normalizeEmail(email);
  const codeHash = hashCode(code);

  await dbConnect();
  const now = new Date();

  const offer = await WelcomeOffer.findOneAndUpdate(
    {
      codeHash,
      normalizedEmail,
      status: "active",
      expiresAt: { $gt: now },
    },
    {
      status: "redeemed",
      redeemedAt: now,
      orderId,
    },
    { new: true }
  );

  if (!offer) {
    return { ok: false, error: "Coupon could not be redeemed. It may be expired, already used, or email mismatch." };
  }

  await Subscriber.findOneAndUpdate(
    { normalizedEmail },
    {
      welcomeCodeStatus: "redeemed",
      welcomeCodeRedeemedAt: now,
      relatedOrderId: orderId,
    }
  );

  return { ok: true };
}

function buildWelcomeEmailHtml(code: string, expiryDate: string, previewText: string): string {
  const shopUrl = `${siteConfig.url}/collection`;
  const whatsappUrl = getWhatsAppUrl("Need help choosing a fragrance?");
  const unsubscribeUrl = `${siteConfig.url}/unsubscribe?email={{email}}`; // template handled by provider or app

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to KHAYAL</title>
</head>
<body style="margin:0;padding:0;background-color:#f8f5f0;font-family:Georgia,serif;color:#1a1a1a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f8f5f0;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="background-color:#ffffff;max-width:600px;width:100%;">
          <tr style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
            <td style="font-size:1px;line-height:1px;max-height:0;overflow:hidden;">${previewText}</td>
          </tr>
          <tr>
            <td align="center" style="padding:48px 32px 16px;">
              <p style="margin:0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#6b6b6b;">Welcome to KHAYAL</p>
              <h1 style="margin:16px 0 0;font-size:28px;font-weight:400;line-height:1.3;">A Fragrance Begins as a Thought</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px;font-size:15px;line-height:1.6;color:#4a4a4a;">
              <p>Welcome to KHAYAL—where fragrance, imagination and memory come together.</p>
              <p>As a welcome, here is your personal code for 5% off your first order:</p>
              <p style="text-align:center;font-size:24px;letter-spacing:0.1em;font-weight:bold;color:#1a1a1a;padding:20px 0;border-top:1px solid #e5e5e5;border-bottom:1px solid #e5e5e5;margin:24px 0;">${code}</p>
              <p style="font-size:13px;color:#6b6b6b;">Offer details:</p>
              <ul style="font-size:13px;color:#6b6b6b;padding-left:20px;">
                <li>5% off your first KHAYAL order</li>
                <li>Maximum discount PKR 500</li>
                <li>Valid until ${expiryDate}</li>
                <li>Available only with this email address</li>
                <li>One-time use</li>
                <li>Cannot be combined with another discount</li>
              </ul>
              <p style="text-align:center;padding:24px 0;">
                <a href="${shopUrl}" style="display:inline-block;background-color:#1a1a1a;color:#ffffff;padding:14px 32px;text-decoration:none;font-size:13px;letter-spacing:0.05em;">Discover Your KHAYAL</a>
              </p>
              <p style="text-align:center;font-size:13px;">Need help choosing a fragrance? <a href="${whatsappUrl}" style="color:#BFA15F;text-decoration:underline;">Speak with us on WhatsApp</a>.</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:24px 32px;border-top:1px solid #e5e5e5;font-size:12px;color:#6b6b6b;">
              <p style="margin:0 0 8px;font-weight:bold;letter-spacing:0.15em;">KHAYAL</p>
              <p style="margin:0 0 16px;font-style:italic;">A fragrance becomes a memory.</p>
              <p style="margin:0;">official@khayalparfum.com</p>
              <p style="margin:16px 0 0;font-size:11px;"><a href="${unsubscribeUrl}" style="color:#6b6b6b;">Unsubscribe</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function buildWelcomeEmailText(code: string, expiryDate: string): string {
  const shopUrl = `${siteConfig.url}/collection`;
  return `
Welcome to KHAYAL

A Fragrance Begins as a Thought

Welcome to KHAYAL—where fragrance, imagination and memory come together.

As a welcome, here is your personal code for 5% off your first order:

${code}

Offer details:
- 5% off your first KHAYAL order
- Maximum discount PKR 500
- Valid until ${expiryDate}
- Available only with this email address
- One-time use
- Cannot be combined with another discount

Discover Your KHAYAL: ${shopUrl}

Need help choosing a fragrance? Speak with us on WhatsApp: ${getWhatsAppUrl("Need help choosing a fragrance?")}

KHAYAL
A fragrance becomes a memory.
official@khayalparfum.com
  `.trim();
}

export { normalizeEmail, hashCode, generateWelcomeCode };
