# Order Statuses

## Order status (`orderStatus`)

| Status | Meaning |
|--------|---------|
| `pending_confirmation` | Order placed, awaiting business confirmation / review. Default for COD. |
| `payment_review` | Bank-transfer order placed, awaiting customer proof upload and admin verification. |
| `confirmed` | Payment verified or COD accepted; ready to pack. |
| `processing` | Order is being prepared. |
| `packed` | Order packed, awaiting dispatch. |
| `dispatched` | Order handed to courier / KHAYAL delivery team. |
| `delivered` | Order delivered to customer. |
| `cancelled` | Order cancelled; stock released. |
| `return_requested` | Reserved for future returns flow. |
| `returned` | Reserved for future returns flow. |

## Payment status (`paymentStatus`)

| Status | Meaning |
|--------|---------|
| `unpaid` | COD order, payment not yet collected. |
| `pending_verification` | Bank-transfer proof uploaded or expected; not yet verified. |
| `paid` | Payment verified / collected. |
| `rejected` | Bank-transfer proof rejected; requires customer action. |
| `refunded` | Full refund issued. |
| `partially_refunded` | Partial refund issued. |

## Fulfilment status (`fulfilmentStatus`)

| Status | Meaning |
|--------|---------|
| `unfulfilled` | Not yet processed. |
| `packed` | Items packed. |
| `dispatched` | Items dispatched. |
| `delivered` | Items delivered. |

## Courier values (`courier`)

| Value | Use |
|-------|-----|
| `unassigned` | Nationwide courier not yet chosen (outside Karachi). |
| `self_delivery` | KHAYAL self-delivery (Karachi). |
| `leopards` | Leopards Courier. |
| `tcs` | TCS. |

## Status transitions

- `pending_confirmation` → `confirmed` | `cancelled`
- `payment_review` → `confirmed` (after verify) | `rejected` | `cancelled`
- `confirmed` → `processing` → `packed` → `dispatched` → `delivered`
- Any non-final status → `cancelled` (releases inventory)
