# Welcome Email Template

## Purpose
Deliver the personalised 5% first-order welcome code to new subscribers.

## Variables

| Variable | Source |
|----------|--------|
| `{{personal_code}}` | Decrypted from `WelcomeOffer.codeEncrypted` |
| `{{expiry_date}}` | `WelcomeOffer.expiresAt` formatted locally |
| `{{collection_url}}` | `https://www.khayalparfum.com/collection` |
| `{{whatsapp_url}}` | `https://wa.me/923202704617` |

## Subject

Welcome to KHAYAL — Your 5% Code Is Inside

## Preview text

A personal welcome offer for your first KHAYAL order.

## Header

WELCOME TO KHAYAL

## Main heading

A Fragrance Begins as a Thought

## Body

Welcome to KHAYAL—where fragrance, imagination and memory come together.

As a welcome, here is your personal code for 5% off your first order:

[{{personal_code}}]

## Offer details

- 5% off your first KHAYAL order
- Maximum discount PKR 500
- Valid for 7 days
- Available only with this email address
- One-time use
- Cannot be combined with another discount

## CTA

Discover Your KHAYAL
URL: https://www.khayalparfum.com/collection

## Support

Need help choosing a fragrance? Speak with us on WhatsApp.
WhatsApp: https://wa.me/923202704617

## Footer

KHAYAL  
A fragrance becomes a memory.

official@khayalparfum.com

Expiry: {{expiry_date}}

[Unsubscribe]

## Implementation

The HTML version is generated in `lib/welcome-offers.ts` (`buildWelcomeEmailHtml`). The plain-text version is generated in `buildWelcomeEmailText`. Both use the configured email subject and preview text from `WelcomeDiscountConfig`.

No internal IDs, customer names, or raw database values are exposed in the email.
