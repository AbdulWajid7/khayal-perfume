# Checkout Testing

## Test framework

Tests are run with **Vitest** in a Node environment.

- Configuration: `vitest.config.ts`
- Setup: `tests/setup.ts`
- Command: `npm run test` (or `npm run test:watch`)

## Current test coverage

### `tests/lib/shipping.test.ts`

- Free-shipping threshold:
  - Subtotal below PKR 5,000 → PKR 250 shipping.
  - Subtotal exactly PKR 5,000 → free shipping.
  - Subtotal above PKR 5,000 → free shipping.
- Server ignores client-provided shipping values.
- Karachi detection with various casing, spacing, punctuation, and area names.
- Delivery method selection (self vs nationwide).
- Expected delivery text.

### `tests/lib/phone.test.ts`

- Valid Pakistani mobile formats: `03XXXXXXXXX`, `+923XXXXXXXXX`, `923XXXXXXXXX`.
- Formatted numbers with spaces/dashes.
- Invalid numbers rejected.
- Normalisation to local and E.164 formats.

### `tests/lib/attribution-shared.test.ts`

- Attribution strings are trimmed and capped at 200 characters.
- Empty/whitespace values return `undefined`.

### `tests/lib/orders.test.ts`

- Signed order access tokens are generated and verified.
- Tampered tokens are rejected.

## Planned integration tests

To achieve full coverage, the following integration tests should be added when MongoDB infrastructure is available in CI:

- **Orders**
  - Valid COD order creation.
  - Valid bank-transfer order creation.
  - Invalid/inactive product rejection.
  - Out-of-stock and excessive quantity rejection.
  - Duplicate idempotency-key submission returns existing order.
  - Price manipulation ignored (server recalculates).
  - Shipping manipulation ignored.
  - Coupon manipulation rejected.
  - Concurrent stock reservation does not oversell.
  - Cancellation releases stock.
  - Order-number uniqueness.

- **Payments**
  - COD remains `unpaid`.
  - Bank transfer remains `pending_verification`.
  - Unauthorized user cannot verify payment.
  - Rejected payment stores a reason.
  - Payment-proof validation (size, type, extension).

- **HQ / admin**
  - Super Admin sees order.
  - Unauthorized sub-admin blocked.
  - Duplicate sync prevented (by shared model design).

- **Analytics**
  - `begin_checkout` fires on checkout entry.
  - `purchase` fires exactly once.
  - Refresh does not duplicate `purchase`.
  - Pending bank transfer does not fire `purchase`.
  - No PII in analytics payloads.

- **Security**
  - Order enumeration blocked.
  - Private proof protected.
  - Admin routes require authentication.
  - Invalid input rejected.

## Running checks

```bash
npx tsc --noEmit
npm run lint
npm run test
npm run build
```
