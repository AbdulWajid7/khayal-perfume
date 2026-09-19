# Welcome Discount / First-Order Email Acquisition — Audit

## Date
2026-09-19

## Objective
Implement a secure, production-ready first-order email acquisition and personalized welcome-coupon system offering **5% off the first KHAYAL order** with a unique one-time code per normalized email.

## Current implementation

### Newsletter popup
- File: `components/ui/NewsletterPopup.tsx`
- Displays after 2.5 seconds unconditionally.
- Copy: “Join the Khayal Circle”.
- Stores dismissal only in `sessionStorage`.
- No exit-intent, scroll-depth, mobile-specific, or 7-day suppression logic.
- Uses `subscribeToNewsletter(email, "popup")` from `lib/subscribers.ts`.

### Newsletter form
- File: `components/ui/NewsletterForm.tsx`
- Footer inline signup using the same `subscribeToNewsletter` action.
- Tracks `newsletter_signup` with placement.

### Subscriber model
- File: `models/Subscriber.ts`
- Fields: `email` (lowercased, unique), `source`, `subscribed`, timestamps.
- No normalized-email field beyond the existing lowercased email.
- No welcome-code fields, consent timestamp, attribution, delivery status, or unsubscribe tracking.

### Coupon model
- File: `models/Coupon.ts`
- Supports `fixed` and `percentage` discount types.
- Fields: code, value, maxUses, usedCount, enabled, dates, minimum order amount.
- No per-email binding, code hashing, or `WELCOME_FIRST_ORDER` type.

### Checkout
- Files: `app/(shop)/checkout/page.tsx`, `components/checkout/CheckoutClient.tsx`, `lib/checkout.ts`
- Has a discount-code input field that passes the code to `createOrder`.
- `lib/checkout.ts` calls `validateCoupon` from `lib/coupons.ts`.
- Current coupon validation is generic and not aware of welcome-offer rules (email binding, first-order eligibility, maximum cap, single use per email).

### Order model
- File: `models/Order.ts`
- Has `discount`, `discountCode`, `subtotal`, `shipping`, `total`.
- Missing structured coupon metadata: `couponId`, `couponType`, `preDiscountSubtotal`, `postDiscountSubtotal`, `discountPercentage`, `discountAmountCap`, `subscriberId`.

### Email provider
- No existing email-sending service found.
- Only `lib/notifications.ts` creates notification records in MongoDB.
- No SMTP/API provider integration, no template system, no delivery tracking.

### Analytics
- File: `lib/analytics.ts`
- Already supports `newsletter_signup`, `coupon_apply`, and commerce events.
- No welcome-offer-specific events yet.

### Admin / HQ
- Files: `app/admin/subscribers/page.tsx`, `lib/admin/users.ts`
- Subscribers are listed, but there is no welcome-offer status, redemption tracking, or campaign metrics.
- No marketing-specific RBAC permissions.

### Rate limiting / scheduled jobs
- No rate-limiting or scheduled-job infrastructure.

## Reusable components

| Component / service | How it will be reused |
|---------------------|----------------------|
| `models/Subscriber.ts` | Extend with welcome-code and consent fields. |
| `lib/subscribers.ts` | Extend to issue welcome codes after subscription. |
| `models/Coupon.ts` | Keep for generic coupons; create separate `WelcomeOffer` model for email-bound codes. |
| `lib/checkout.ts` | Extend validation and discount calculation to support welcome codes. |
| `components/ui/NewsletterPopup.tsx` | Replace/upgrade with `WelcomePopup`. |
| `components/ui/NewsletterForm.tsx` | Keep for newsletter-only signups (not part of welcome offer). |
| `lib/analytics.ts` | Add `welcome_offer_*` events alongside existing events. |
| `lib/notifications.ts` | Extend to create email-sending notification records. |
| `lib/attribution.ts` | Reuse to attach first/latest touch attribution to subscribers. |

## Required changes

1. **Data models**
   - Extend `Subscriber` with consent, attribution, welcome-code status, delivery status, unsubscribe status.
   - Create `WelcomeOffer` model with code hash, email binding, expiry, redemption state, audit fields.
   - Create `WelcomeDiscountConfig` model for Super Admin campaign settings.
   - Extend `Order` with structured coupon metadata.

2. **Secure coupon generation**
   - Cryptographically secure random code generation (e.g. `KHAYAL-XXXX-XXXX`).
   - Store only a hash; send raw code once in the email.
   - Rate-limit issuance per email and per IP.

3. **Popup experience**
   - Replace `NewsletterPopup` with `WelcomePopup`.
   - Implement delay, exit intent, scroll-depth, mobile rules, suppression, focus trapping, Escape close, reduced motion.
   - Add success state with resend capability.

4. **Checkout integration**
   - Add apply/remove coupon UI.
   - Server-side validation of welcome code against checkout email.
   - Enforce 5% / PKR 500 cap, pre-discount shipping threshold, no stacking.
   - Store coupon metadata on the order.

5. **Email provider**
   - Add Resend provider with server-side API key.
   - Build welcome email template (HTML + plain text).
   - Track delivery/failure status.

6. **Admin HQ integration**
   - Add subscriber/welcome-offer admin pages with metrics.
   - Add marketing RBAC permissions.

7. **Analytics**
   - Add `welcome_offer_view`, `welcome_offer_dismiss`, `welcome_offer_submit`, `welcome_offer_success`, `welcome_offer_error`, `welcome_offer_resend`, `coupon_apply_success`, `coupon_apply_failure`.
   - Never send email or raw code.

8. **Security**
   - Server-side email normalisation.
   - Rate limiting.
   - Atomic coupon redemption inside order creation.
   - First-order eligibility check.
   - Safe error messages to prevent enumeration.

## Data flow

1. Visitor browses; popup appears after rules are met.
2. Visitor submits email; server normalises, checks eligibility, creates/updates `Subscriber`, generates `WelcomeOffer`, stores hash, sends email with raw code.
3. Server returns generic success regardless of duplicate or existing code.
4. Customer checks out with same email and enters code.
5. Server validates code hash, email match, expiry, prior orders, and returns discount.
6. On order creation, server repeats validation, atomically redeems the offer, writes order coupon metadata.
7. Welcome email metrics and redemption data are visible in `/admin/marketing`.

## Security risks

| Risk | Mitigation |
|------|------------|
| Predictable codes | Use `crypto.randomBytes` and alphanumeric format. |
| Code enumeration | Store hash only; public responses generic. |
| Email enumeration | Generic success/error messages; rate limit. |
| Replay / double redemption | Atomic `findOneAndUpdate` with `status: active`; idempotency key on order. |
| Client discount manipulation | Server recalculates all totals and ignores client discount amount. |
| Prior-order bypass | Server checks non-cancelled/completed orders for normalized email. |
| Secret leakage | Resend key server-side only; never in bundles. |

## Email-provider status

No working email provider exists. Resend will be added as the production provider abstraction with a pluggable fallback to notification records.

## DNS/email-domain actions required

- Verify sending domain `khayalparfum.com` in Resend.
- Configure SPF, DKIM, DMARC (documented separately).
- Do not enable the public offer until domain verification and successful test delivery.
