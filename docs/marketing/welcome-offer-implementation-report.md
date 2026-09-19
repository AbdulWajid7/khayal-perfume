# Welcome Discount / First-Order Email Acquisition — Implementation Report

## Summary

Implemented a secure, server-authoritative first-order welcome offer for KHAYAL Parfum. New visitors can subscribe via a branded popup, receive a unique 5% discount code bound to their normalized email, and redeem it at checkout. The system is integrated with order management, KHAYAL HQ, analytics, and a Resend email provider.

## Existing implementation discovered

- `components/ui/NewsletterPopup.tsx` — basic popup with immediate 2.5s display.
- `components/ui/NewsletterForm.tsx` — footer newsletter signup.
- `models/Subscriber.ts` — only `email`, `source`, `subscribed`.
- `lib/subscribers.ts` — simple upsert.
- `models/Coupon.ts` — generic fixed/percentage coupons.
- `lib/checkout.ts` — accepts a single discount code and validates via generic coupon service.
- `lib/analytics.ts` — commerce and marketing events.
- No email provider existed; only internal notification records.

## Models reused

- `Subscriber` extended with consent, attribution, welcome-code lifecycle, email delivery status, unsubscribe.
- `Order` extended with structured coupon metadata (coupon ID, type, percentage, max amount, pre/post discount subtotals, subscriber ID).
- `Coupon` kept for generic coupons; welcome codes use a separate model.

## Models created or modified

| Model | Change |
|-------|--------|
| `models/Subscriber.ts` | Extended fields for consent, attribution, welcome code status/expiry, delivery status, unsubscribe. |
| `models/WelcomeOffer.ts` | New. Stores code hash, encrypted raw code, email binding, status, expiry, redemption. |
| `models/WelcomeDiscountConfig.ts` | New. Super Admin campaign settings. |
| `models/Order.ts` | Added coupon metadata fields. |

## Popup changes

- Replaced `components/ui/NewsletterPopup.tsx` with `components/marketing/WelcomePopup.tsx`.
- New copy: “WELCOME TO KHAYAL / Enjoy 5% Off Your First Order / Send My 5% Code / Maybe Later”.
- Success state with “Your Welcome Code Is on Its Way” and rate-limited resend.
- Display rules:
  - Desktop: 8–12s delay or exit intent.
  - Mobile: 30% scroll depth or 12s delay.
  - Excluded on checkout, confirmation, admin, login, track-order.
  - 7-day suppression after dismissal.
  - Permanent suppression after signup (local state only; server enforces eligibility at redemption).
- Focus trapping, Escape close, focus restoration, reduced-motion support, `aria-label`.

## Coupon-generation implementation

- Format: `KHAYAL-XXXX-XXXX` using `crypto.randomBytes`.
- SHA-256 hash stored for lookup; raw code encrypted with AES-256-GCM using `AUTH_SECRET`.
- One active code per normalized email.
- Resend reuses existing active code; expired/redeemed codes are not replaced automatically.
- Rate-limited by email.

## Email-binding implementation

- Email normalised server-side (trim + lowercase).
- Unique index on `Subscriber.normalizedEmail`.
- Coupon redemption requires exact match of code hash + checkout email.
- Safe error messages never reveal the code owner.

## First-order eligibility logic

- Rejected if a non-cancelled, non-rejected order exists for the same `customer.normalizedEmail`.
- Welcome offer status must be `active` and not expired.
- Each email can redeem only once.

## Checkout integration

- New discount code apply/remove UI in `components/checkout/CheckoutClient.tsx`.
- Server action `applyDiscountCode` (in `lib/discounts.ts`) routes welcome codes to `validateWelcomeCoupon` and generic codes to existing coupon validation.
- Discount displayed as a line item.
- Shipping is calculated from the pre-discount subtotal (free shipping over PKR 5,000).
- `createOrder` in `lib/checkout.ts` revalidates the code, redeems atomically, and stores coupon metadata.

## Email-provider integration

- Added `resend` dependency.
- New `lib/email.ts` abstraction with server-side `RESEND_API_KEY`.
- Welcome email subject, preview text, HTML and plain-text body generated in `lib/welcome-offers.ts`.
- Delivery status stored on the subscriber.

## KHAYAL HQ integration

- New admin pages:
  - `/admin/marketing/subscribers`
  - `/admin/marketing/welcome-offers`
  - `/admin/marketing/config`
- Marketing group added to `AdminShell` sidebar.
- Metrics exposed: subscribers, codes issued/redeemed, redemption rate, revenue, discount cost, average order value.
- Access restricted to Super Admin.

## Analytics events

Added to `lib/analytics.ts` and wired into the popup and checkout:

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

No email addresses or raw coupon codes are sent to GA4, Meta, GTM, or Clarity.

## Security controls

- Server-side email validation and normalisation.
- Rate limiting per email for signup and resend.
- Secure coupon generation and hashing; raw codes encrypted at rest.
- Atomic redemption with `findOneAndUpdate` conditions.
- Idempotent order creation via `idempotencyKey`.
- Input sanitisation through Zod.
- Secrets remain server-side.
- Generic responses prevent email enumeration.

## Environment variables required

```bash
# Existing
MONGODB_URI=
AUTH_SECRET=
ADMIN_EMAIL=
ADMIN_PASSWORD=
BLOB_READ_WRITE_TOKEN=
KHAYAL_BRAND_ID=khayal-fragrance

# New
EMAIL_PROVIDER=resend
RESEND_API_KEY=
EMAIL_FROM=KHAYAL <official@khayalparfum.com>
EMAIL_REPLY_TO=official@khayalparfum.com
```

## DNS / email-domain actions required

- Verify `khayalparfum.com` in Resend.
- Add SPF, DKIM, and DMARC records (details in `docs/marketing/email-deliverability.md`).
- Do not enable the public offer until the domain is verified and test emails land in the inbox.

## Tests added

- `tests/lib/welcome-offers.test.ts` — code generation, hash determinism, email normalisation.
- `tests/lib/rate-limit.test.ts` — rate-limit behaviour.
- Existing tests remain passing for shipping, phone, attribution, and order tokens.

## Test results

| Check | Result |
|-------|--------|
| TypeScript (`npx tsc --noEmit`) | Pass |
| ESLint (`npm run lint`) | Pass |
| Tests (`npm run test`) | Pass (28 tests) |

## Production build

```bash
npm run build
```

Result: Build completed successfully with only pre-existing `jose` edge-runtime warnings.

## Remaining manual steps

1. Run `npm run build` and resolve any build warnings.
2. Add DNS records and verify sending domain in Resend.
3. Send a test welcome email to a controlled inbox.
4. Walk through full flow: signup → receive code → checkout with matching email → verify discount and total → place order → verify HQ data.
5. Enable the campaign in `/admin/marketing/config`.
6. Configure a production cron or periodic job to call `releaseExpiredReservations()`.
7. Add MongoDB-backed integration tests once a test database is available in CI.

## Remaining limitations

- Rate limiting is in-memory; multi-instance deployments need Redis.
- Coupon redemption and order creation are not a single distributed transaction; failure between the two may require admin recovery.
- `createWelcomeSignup` returns generic success even if the email already redeemed; a truly malicious actor cannot enumerate status, but UX could be improved with a “already subscribed” hint if privacy policy allows.
- Welcome code format prefix is public, but actual codes are random and hashed.
