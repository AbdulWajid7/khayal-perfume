# Checkout & Order Management — Architecture Audit

## Date
2026-09-19

## Project
https://www.khayalparfum.com — Next.js 15 App Router, React 19, TypeScript, Tailwind CSS v4, Mongoose, Zod.

## 1. Existing models

### Product (`models/Product.ts`)
- Local MongoDB model; products are authored in admin and surfaced through `lib/products.ts` as Shopify-shaped types.
- Fields: `title`, `handle`, `description`, `price`, `compareAtPrice`, `cost`, `sku`, `stock`, `lowStockThreshold`, `status` (`active` | `draft` | `archived`), `images`, `category`, `tags`, `variants` (embedded array with `id`, `title`, `price`, `compareAtPrice`, `sku`, `stock`, `availableForSale`).
- Stock is a single scalar per product and per variant. No reservation/atomic-movement model exists.

### Order (`models/Order.ts`)
- Basic model already exists with `orderNumber`, embedded `customer`, embedded `items`, `subtotal`, `shipping`, `discount`, `total`, `status`, `paymentStatus`, `tracking`, `notes`, `timestamps`.
- Current status enum: `pending | processing | shipped | delivered | cancelled`.
- Current payment-status enum: `pending | paid | cod | refunded`.
- No idempotency key, no attribution, no audit history, no delivery-method/courier split, no payment proof, no fulfillment timestamps, no channel/brand.

### User (`models/User.ts`)
- Fields: `name`, `email`, `passwordHash`, `role` (`admin` | `editor`), `timestamps`.
- No granular permissions array; role-based access only.

### Subscriber / Post / Product
- Standard content models; not directly used for commerce.

## 2. Reusable services

### Cart (`hooks/useCart.tsx`)
- Client-side React Context + reducer backed by `localStorage` (`khayal-cart`).
- Items carry: `id`, `variantId`, `productId`, `title`, `variantTitle`, `quantity`, `price`, `currencyCode`, `image`.
- Cart does **not** talk to the server; it is purely presentation/estimation state.

### Shipping (`lib/shipping.ts`)
- `qualifiesForFreeShipping(subtotal)` — compares against `siteConfig.freeShippingThreshold`.
- `calculateShipping(subtotal, standardShipping)` — returns `0` above threshold or the standard rate below.
- Reusable as the pricing rule; must still be re-validated server-side with real product prices.

### Auth (`lib/auth.ts` + `lib/session.ts` + `middleware.ts`)
- JWT session cookie `khayal-admin-session` using `jose` HS256, 1-day expiry.
- `requireAuth(allowedRoles?)` returns `null` when unauthorized; server actions throw generic errors.
- Middleware guards `/admin/:path*` for any valid JWT; role checks happen inside actions.

### Blob uploads (`lib/blob.ts`)
- `uploadImage(formData)` uses `@vercel/blob` `put()` with **public** access.
- Used for journal images today. For payment proofs we must not use public URLs or filesystem paths.

### Analytics (`lib/analytics.ts`)
- Direct GA4, dataLayer, Meta Pixel integrations. Consent banner (`components/ui/ConsentBanner.tsx`) gates Meta/Clarity and sets Google Consent Mode v2.
- `trackPurchaseOnce()` already exists with localStorage deduplication keyed by transaction ID.

### MongoDB connection (`lib/mongoose.ts`)
- Cached Mongoose connection using `MONGODB_URI`.
- `toJSON()` serialises documents by round-tripping through JSON.

## 3. Existing admin order surface

- `app/admin/orders/page.tsx` lists all orders; inline status update; delete.
- `app/admin/orders/new/page.tsx` allows manual order creation with JSON items.
- `lib/admin/orders.ts` exposes `getOrders`, `getOrderById`, `createOrder`, `updateOrder`, `deleteOrder`.
- No detail page, no search/filter, no payment verification, no courier assignment, no audit log.

## 4. Required changes

### Data model extensions
1. **Order** — extend to full schema with idempotency key, channel, brandId, customer/delivery snapshots, line-item snapshots, payment method, courier/tracking, fulfilment timestamps, cancellation reason, payment proof reference, attribution, audit history, internal/customer notes.
2. **User** — add optional `permissions` array for RBAC (defaults to `admin` all / `editor` limited).
3. **Coupon** — new model for code, type, value, enabled, usage limits, expiry.
4. **AuditLog** — new model for every order state change with actor, timestamp, before/after.
5. **StockReservation** — new model to reserve stock atomically per order, with expiry for pending bank transfers.
6. **Notification** — new model/log for customer/admin notifications (actual providers can be wired later).
7. **BankTransferConfig** — new singleton/config model holding business bank details (do not hardcode in source).

### Server services
1. `lib/checkout.ts` — authoritative order creation: validate cart items against DB, recalculate prices/shipping/discount, enforce max quantities, idempotency, rate limiting, create order + reservation + audit log.
2. `lib/phone.ts` — normalise Pakistani mobile numbers to `03XXXXXXXXX` and `+923XXXXXXXXX` forms.
3. `lib/coupons.ts` — validate coupon code server-side.
4. `lib/orders.ts` — public order queries (confirmation/tracking by secure token).
5. `lib/admin/orders.ts` — extend with filters, payment verify/reject, courier assign, status timeline, audit retrieval.
6. `lib/attribution.ts` — read `utm_*`/referrer from cookies/localStorage and attach to order.
7. `lib/notifications.ts` — enqueue/log customer and admin notifications without duplicating order creation.

### Routes & pages
1. `app/(shop)/checkout/page.tsx` — multi-section checkout form.
2. `app/api/checkout/route.ts` or Server Action `createOrderAction`.
3. `app/(shop)/order-confirmation/[orderNumber]/page.tsx` — secure confirmation (signed access token via cookie/hash).
4. `app/(shop)/track-order/page.tsx` — customer tracking via order number + phone verification or signed token.
5. `app/admin/orders/[id]/page.tsx` — full order detail with audit timeline.
6. Update `app/admin/orders/page.tsx` — search, filters, status badges.

### Client components
1. Checkout form sections: customer, address, city, delivery method, payment method, summary, policy, place order.
2. COD confirmation view.
3. Bank-transfer proof upload view.
4. Cart drawer “Checkout” button links to `/checkout` and fires `begin_checkout`.

### Analytics
1. `begin_checkout` on entering checkout.
2. `add_shipping_info` after valid delivery form.
3. `add_payment_info` after payment-method selection.
4. `purchase` only after successful order creation, deduplicated via `trackPurchaseOnce`.
5. For bank transfer, fire `generate_lead` on proof upload; fire `purchase` only after admin verification (server-side or on next secure page load).
6. **No PII in analytics payloads** — only product IDs, prices, currency, transaction ID.

### Security
1. Server recalculates all prices; rejects client totals/shipping/discounts.
2. Idempotency key + per-session request log prevents double-submission.
3. Rate limit order creation per IP/phone.
4. Input sanitisation via Zod.
5. Payment-proof validation: image MIME types/extensions, size limit, safe filename, metadata stripping where practical, stored via Vercel Blob with random path and access controlled server-side (blob URL not exposed publicly; served only to authorized admins).
6. Order access via signed token / phone verification; no enumeration by order number alone.
7. RBAC server checks inside every admin action.

### Inventory
1. On order creation: atomically decrement `stock` and create `StockReservation` entry linked to order.
2. For COD: reservation remains until cancellation; on cancellation/delivery the appropriate stock movement is recorded.
3. For bank transfer: reservation expires after configurable window (default 24 h) if payment not verified; release stock.
4. Prevent overselling via `findOneAndUpdate` with `stock >= quantity`.

### HQ integration
- The storefront and the existing admin panel share the same MongoDB.
- Strategy: reuse the same `Order` model and admin pages as the HQ source of truth.
- Every website order is created in the same database and is visible to authorized admins immediately.
- `channel = KHAYAL_WEBSITE`, `brandId` set to the KHAYAL brand ID.
- No separate sync service is required; if a future external HQ system appears, the order model already carries `sourceSystem`, `sourceOrderId`, `hqOrderId`, `syncStatus` fields for a later integration layer.

## 5. Data ownership

- Orders, customers, inventory, and audit logs belong to the KHAYAL business tenant.
- Each order stores a denormalised customer snapshot at time of purchase; no customer record model is needed for v1.
- Payment proofs are owned by the order and accessible only to admins with `orders.viewPaymentProof`.

## 6. Website-to-HQ integration strategy

- Shared MongoDB + shared `Order` model = single source of truth.
- Admin pages under `/admin/orders` act as HQ interface.
- RBAC ensures Super Admin sees all orders; sub-admins can be scoped by permissions.
- Audit log records all state changes for accountability.

## 7. Identified risks

| Risk | Mitigation |
|------|------------|
| Client price manipulation | Server recalculates from DB prices; client totals ignored. |
| Overselling | Atomic `stock` decrement with reservation model. |
| Duplicate orders | Idempotency key + request caching + UI button disabled. |
| Unverified bank-transfer stock lock | Configurable expiry (default 24 h) releases reservation. |
| Admin-only field injection from public | Public checkout action accepts only declared fields; extra fields stripped by Zod. |
| Payment proof exposure | Random blob path, no public listing, server-side access control. |
| PII in analytics | Analytics payloads exclude names/phones/addresses; only product/value data. |
| Missing notification provider | Notifications logged in DB; provider integration stubbed and documented. |

## 8. Migration requirements

1. **Database migration** — extend `orders` collection with new fields. Existing orders keep old shape; defaults handle missing fields.
2. **User migration** — add `permissions` array defaulting to full for `admin` and a read-only subset for `editor`.
3. **Environment variables** — add bank-transfer and notification config (see implementation report).
4. **Index creation** — `orderNumber`, `idempotencyKey`, `customer.phone`, `status`, `paymentStatus`, `channel`, `brandId`, `courier`, `createdAt`.
5. **No destructive operations** — existing products, posts, subscribers, users remain untouched.
