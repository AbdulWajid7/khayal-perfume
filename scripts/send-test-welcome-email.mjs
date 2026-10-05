// Sends the real welcome email template via Resend for testing.
// Usage: node scripts/send-test-welcome-email.mjs <to-email> [from]
// Requires RESEND_API_KEY in .env.local or environment.

import { Resend } from "resend";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Minimal .env.local loader (key=value lines, ignores comments/quotes)
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  console.error("RESEND_API_KEY not found in .env.local or environment");
  process.exit(1);
}

const to = process.argv[2] || "abdulwajid9997@gmail.com";
const from = process.argv[3] || process.env.EMAIL_FROM || "KHAYAL <onboarding@resend.dev>";
const replyTo = process.env.EMAIL_REPLY_TO || "official@khayalparfum.com";

const SAMPLE_CODE = "KHAYAL-TEST-5OFF";
const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-PK", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

const siteUrl = "https://www.khayalparfum.com";
const shopUrl = `${siteUrl}/collection`;
const whatsappUrl = "https://wa.me/923202704617";

const html = `
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
            <td style="font-size:1px;line-height:1px;max-height:0;overflow:hidden;">A personal welcome offer for your first KHAYAL order.</td>
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
              <p style="text-align:center;font-size:24px;letter-spacing:0.1em;font-weight:bold;color:#1a1a1a;padding:20px 0;border-top:1px solid #e5e5e5;border-bottom:1px solid #e5e5e5;margin:24px 0;">${SAMPLE_CODE}</p>
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
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

const text = `
Welcome to KHAYAL

A Fragrance Begins as a Thought

Welcome to KHAYAL—where fragrance, imagination and memory come together.

As a welcome, here is your personal code for 5% off your first order:

${SAMPLE_CODE}

Offer details:
- 5% off your first KHAYAL order
- Maximum discount PKR 500
- Valid until ${expiryDate}
- Available only with this email address
- One-time use
- Cannot be combined with another discount

Discover Your KHAYAL: ${shopUrl}

Need help choosing a fragrance? Speak with us on WhatsApp: ${whatsappUrl}

KHAYAL
A fragrance becomes a memory.
official@khayalparfum.com
`.trim();

const resend = new Resend(apiKey);

console.log(`Sending test welcome email to ${to} from ${from} ...`);

const { data, error } = await resend.emails.send({
  from,
  to,
  replyTo,
  subject: "Welcome to KHAYAL — Your 5% Code Is Inside",
  html,
  text,
});

if (error) {
  console.error("Resend error:", error);
  process.exit(1);
}

console.log("Sent. Resend message id:", data?.id);
