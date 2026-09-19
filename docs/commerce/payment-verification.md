# Payment Verification

## Cash on Delivery (COD)

- Customer selects **Cash on Delivery** at checkout.
- Order is created with `paymentStatus = "unpaid"` and `orderStatus = "pending_confirmation"`.
- KHAYAL staff may contact the customer to confirm the order before dispatch.
- `purchase` analytics event fires once on the order-confirmation page.
- No payment proof is required.

## Bank Transfer

1. Customer selects **Bank Transfer** at checkout.
2. Order is created with `paymentStatus = "pending_verification"` and `orderStatus = "payment_review"`.
3. The confirmation page displays the configured bank account details.
4. The customer uploads a screenshot/photo of the transfer receipt, plus sender name, reference number, and transfer date.
5. The system validates:
   - File type: JPEG, PNG, or WebP.
   - File size: max 5 MB.
   - All required transfer fields are present.
6. The image is uploaded to Vercel Blob with a random filename under `payment-proofs/{orderId}/`.
7. A notification record is created for the admin team.
8. An admin with `orders.verifyPayment` permission reviews the proof.
9. Admin can:
   - **Verify** → `paymentStatus = "paid"`, `orderStatus = "confirmed"`. `purchase` analytics event fires on next customer page load.
   - **Reject** → `paymentStatus = "rejected"`. A rejection reason is stored and shown to the customer.

## Security & privacy

- Bank account details are not hardcoded; they are configured via `BankTransferConfig` or environment variables.
- Payment-proof URLs are random and not listed publicly. They are only exposed to authorised admins.
- Rejection reasons and verification metadata are stored in the order audit history.

## Configuration

Configure bank details in production via the admin panel (future) or by seeding `BankTransferConfig`:

```js
{
  bankName: "Example Bank",
  accountTitle: "KHAYAL Fragrances",
  accountNumber: "...",
  iban: "...",
  instructions: "Transfer exact total and upload proof within 24 hours.",
  enabled: true
}
```

Environment variable: `BANK_TRANSFER_RESERVATION_HOURS` (default `24`) controls how long stock is reserved while awaiting proof.
