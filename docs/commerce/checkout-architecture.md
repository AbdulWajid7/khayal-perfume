# Checkout Architecture

## Overview

The KHAYAL storefront checkout is a server-authoritative, privacy-first flow. The client cart is local-only; the server validates every line item, price, discount, and shipping cost at order creation.

## Flow

1. Customer adds products to cart via `useCart` (React Context + `localStorage`).
2. Customer clicks **Checkout** in `CartDrawer` → `/checkout`.
3. `/checkout` renders a multi-section form (customer info, address, delivery method, payment method, summary).
4. On submit, `createOrder` server action validates inputs with Zod, recalculates prices, checks stock, creates an `Order`, reserves inventory, writes audit log, and enqueues notifications.
5. Customer is redirected to `/order-confirmation/[orderNumber]?token=...`.
6. For COD, the confirmation page fires the `purchase` analytics event once.
7. For bank transfer, the confirmation page shows bank details and a proof-upload form. `purchase` is fired only after an admin verifies payment.
8. Admins manage orders in `/admin/orders` and `/admin/orders/[id]`.
9. Customers can track orders at `/track-order` using order number + phone, or the signed token link.

## Key services

| File | Responsibility |
|------|--------------|
| `lib/checkout.ts` | Authoritative order creation, validation, pricing, stock decrement, reservation creation. |
| `lib/orders.ts` | Order access-token generation/verification, public order lookup, payment-proof submission. |
| `lib/admin/orders.ts` | Admin order list/filters, status changes, courier assignment, payment verify/reject, cancellation, audit logging, stock release. |
| `lib/shipping.ts` | Free-shipping threshold, shipping calculation, Karachi detection, delivery-method/ETA labels. |
| `lib/phone.ts` | Pakistani mobile validation and normalisation. |
| `lib/coupons.ts` | Coupon validation and usage counting. |
| `lib/attribution.ts` / `lib/attribution-shared.ts` | Campaign attribution capture from cookies/search params, stored on the order. |
| `lib/notifications.ts` | Creates customer/admin notification records (provider integration stubbed). |
| `lib/admin/bank-config.ts` | Bank-transfer details configuration for admin. |

## Data model

### Order (`models/Order.ts`)

Extended from the original order model to include:

- `orderNumber` + `idempotencyKey` (unique).
- `channel` = `KHAYAL_WEBSITE`, `brandId`.
- Immutable customer snapshot with `normalizedPhone`.
- Immutable line-item snapshots (`productId`, `variantId`, `sku`, `name`, `quantity`, `unitPrice`, `lineTotal`, `image`).
- Server-calculated `subtotal`, `discount`, `shipping`, `tax`, `total`.
- `paymentMethod`, `paymentStatus`, `orderStatus`, `fulfilmentStatus`.
- `deliveryMethod`, `courier`, `trackingNumber`.
- `attribution` object.
- `paymentVerification` object for bank-transfer proofs.
- `auditHistory` array.
- Timestamps for confirmation/dispatch/delivery/cancellation.

### StockReservation (`models/StockReservation.ts`)

Tracks why stock was removed from inventory. Status: `reserved | converted | released | expired`.

### Coupon (`models/Coupon.ts`)

Supports fixed and percentage discounts, usage limits, date windows, and minimum-order thresholds.

### User permissions (`models/User.ts`)

Optional `permissions` array extends the existing `admin`/`editor` roles with granular order actions.

## Security

- All prices recalculated server-side.
- Idempotency key prevents duplicate submissions.
- Zod validates and sanitises all public inputs.
- Order access uses signed JWT tokens + phone verification for tracking.
- Payment-proof uploads are restricted by MIME type, extension, size, and stored with random filenames. Access is controlled server-side.
- Admin routes protected by middleware + server-side permission checks.

## Privacy / analytics

- No customer PII (name, phone, email, address) is sent to GA4, Meta Pixel, GTM, or Clarity.
- Analytics events include only product IDs, prices, quantities, currency, and transaction ID.
- `purchase` is deduplicated via `trackPurchaseOnce` using `localStorage` keyed by transaction ID.
