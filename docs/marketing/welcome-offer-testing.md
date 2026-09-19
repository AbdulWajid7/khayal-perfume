# Welcome Offer Testing

## Test framework

Tests are run with Vitest (`npm run test`). Utility tests live in `tests/lib/`.

## Current test coverage

### `tests/lib/welcome-offers.test.ts`

- Email normalisation (case, whitespace).
- Welcome-code format `KHAYAL-XXXX-XXXX`.
- Code uniqueness across multiple generations.
- Hash determinism and case-insensitivity.
- Hash collision resistance across different codes.

### `tests/lib/rate-limit.test.ts`

- Requests allowed up to the configured limit.
- Requests blocked beyond the limit with retry-after value.
- Key isolation.

### Existing related tests

- `tests/lib/phone.test.ts` — phone validation used in checkout eligibility checks.
- `tests/lib/shipping.test.ts` — free-shipping threshold calculation, Karachi detection.
- `tests/lib/orders.test.ts` — signed access tokens.
- `tests/lib/attribution-shared.test.ts` — attribution sanitisation.

## Integration tests to add

When a MongoDB test database is available, add integration tests for:

### Signup

- Valid new email creates a subscriber and welcome offer.
- Invalid email rejected.
- Duplicate casing variation does not create duplicate subscribers.
- Existing active code is resent, not replaced.
- Rate limit enforced.
- Disabled offer rejected.

### Coupon validation

- Correct email + code returns correct discount (5% capped at PKR 500).
- Wrong email rejected with safe message.
- Expired code rejected.
- Already redeemed code rejected.
- Existing customer (non-cancelled order) rejected.
- Stacking with another code rejected.
- Manipulated client discount rejected.

### Order creation

- Welcome coupon redemption is atomic.
- Failed order does not consume code (or is recoverable).
- Concurrent redemption prevents double use.
- Order stores coupon metadata.
- Shipping threshold uses pre-discount subtotal.

### Email

- Provider success updates delivery status.
- Provider failure records failure reason.
- Resend respects rate limit.
- Template contains no secrets or internal IDs.

### Popup

- Suppressed after dismissal.
- Suppressed after signup.
- Not shown on checkout/confirmation/admin pages.
- Escape closes popup.
- Focus is trapped and restored.

## Running checks

```bash
npx tsc --noEmit
npm run lint
npm run test
npm run build
```
