# Welcome Offer Architecture

## Goal
Convert first-time website visitors into email subscribers and first-time customers with a unique, email-bound 5% discount code.

## Components

### Data models

| Model | Purpose |
|-------|---------|
| `Subscriber` | Stores email, consent, attribution, welcome-code lifecycle, delivery status. |
| `WelcomeOffer` | Stores a single unique code per subscriber: hash, encrypted raw code, email binding, expiry, redemption. |
| `WelcomeDiscountConfig` | Super Admin campaign settings (percentage, max discount, validity, popup delay, suppression, email copy). |
| `Order` | Extended with structured coupon metadata for redemption tracking and reporting. |

### Key services

| Service | Responsibility |
|---------|--------------|
| `lib/welcome-offers.ts` | Code generation, signup, resend, coupon validation, redemption, email rendering. |
| `lib/discounts.ts` | Unified discount-code validation (welcome codes + generic coupons). |
| `lib/email.ts` | Resend provider abstraction with server-side API key. |
| `lib/rate-limit.ts` | In-memory rate limiting per key. |
| `lib/checkout.ts` | Revalidates welcome codes at order creation and atomically redeems them. |
| `components/marketing/WelcomePopup.tsx` | Popup UX with delay, exit intent, scroll depth, suppression, focus trapping. |
| `lib/admin/marketing.ts` | Admin HQ metrics, subscriber/offer lists, campaign configuration. |

## Code lifecycle

1. **Generation**
   - `generateWelcomeCode()` creates `KHAYAL-XXXX-XXXX` from `crypto.randomBytes`.
   - `hashCode()` produces a SHA-256 lookup key stored in `WelcomeOffer`.
   - `encryptCode()` encrypts the raw code with AES-256-GCM using `AUTH_SECRET` for resends.

2. **Issuance**
   - Visitor submits email in `WelcomePopup`.
   - `createWelcomeSignup()` normalises email, checks rate limits, creates/updates `Subscriber`.
   - If an unexpired active code exists, it is resent; otherwise a new `WelcomeOffer` is created.
   - Welcome email is sent via Resend; delivery status stored on the subscriber.

3. **Redemption**
   - Customer enters code at checkout with the same email.
   - `applyDiscountCode()` / `validateWelcomeCoupon()` verifies code hash, email match, expiry, first-order eligibility.
   - Discount is recalculated server-side: 5% of merchandise subtotal, capped at PKR 500.
   - Shipping remains based on the pre-discount subtotal (PKR 5,000 free-shipping threshold).
   - On order creation, `redeemWelcomeOffer()` atomically marks the offer `redeemed` if still active.

4. **Recovery**
   - Failed order creation after redemption leaves the offer marked redeemed. Admin can reactivate if needed.
   - Failed email delivery is logged on the subscriber and visible in HQ.

## Security

- Raw codes are never stored unencrypted or logged.
- Public messages are generic to prevent email/code enumeration.
- Rate limits cap signup/resend attempts per email.
- All discount/pricing calculations happen server-side.
- First-order eligibility is checked against non-cancelled/non-rejected orders.

## Analytics

Events are sent through the existing `lib/analytics.ts` infrastructure. No email or raw code is included.

- `welcome_offer_view`
- `welcome_offer_dismiss`
- `welcome_offer_submit`
- `welcome_offer_success`
- `welcome_offer_error`
- `welcome_offer_resend`
- `coupon_apply`
- `coupon_apply_success`
- `coupon_apply_failure`
- `purchase`

## HQ visibility

Admin routes under `/admin/marketing/*` expose:

- Subscriber list with consent source, code status, expiry, related order, email delivery status.
- Welcome-offer list with code hint, status, issued/redeemed dates, related order.
- Metrics: subscribers, codes issued/redeemed, redemption rate, revenue, discount cost, average order value.

Access is restricted to Super Admin (`requireAuth(["admin"])`).
