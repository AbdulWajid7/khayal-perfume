# HQ Order Integration

## Integration strategy

The KHAYAL storefront and HQ share the same MongoDB database. Every website order is written to the shared `Order` collection and is immediately visible to authorised users in the admin panel (`/admin/orders`).

This approach avoids duplicate order models and disconnected synchronisation. If a future external HQ system is introduced, the `Order` model already carries the fields needed for a sync layer:

- `channel` — identifies the source (`KHAYAL_WEBSITE`).
- `brandId` — the KHAYAL brand identifier.
- `sourceSystem` / `sourceOrderId` / `hqOrderId` / `syncStatus` (reserved for future extension).

## Visibility

### Super Admin
- Full access to all orders.
- Can verify/reject payments, assign couriers, cancel orders, export data.

### Sub-admins
- Default `editor` role can view, create, and update order status.
- Cannot verify/reject payments, assign couriers, or cancel orders unless granted explicit permissions via the `permissions` array on the `User` model.

## Brand scope

All website orders are created with `brandId = KHAYAL_BRAND_ID` (default `"khayal-fragrance"`). Admin filters allow filtering by `brandId` and `channel`.

## Audit history

Every admin action on an order creates an entry in `auditHistory`:

- `actor` — admin name.
- `actorId` — admin user ID.
- `action` — e.g. `status_changed`, `courier_assigned`, `payment_verified`, `payment_rejected`, `order_cancelled`.
- `before` / `after` — safe snapshots of changed fields.
- `note` — optional human-readable reason.
- `createdAt` — timestamp.

## Duplicate sync prevention

Because there is no separate sync step, duplicates cannot occur from synchronisation. Order creation is protected from duplicates by a unique `idempotencyKey` index and a pre-insert check.

## Retryable failed synchronisation

For any future external HQ sync, the design supports:

1. `syncStatus` field on `Order`.
2. A background worker or cron that queries `syncStatus = "pending"` and retries.
3. Audit log entries for each sync attempt.

## HQ-specific fields

| Field | Purpose |
|-------|---------|
| `channel` | Source channel, e.g. `KHAYAL_WEBSITE`. |
| `brandId` | Brand scope for multi-brand HQ. |
| `attribution` | UTM and campaign data visible in HQ. |
| `auditHistory` | Full state-change audit trail. |
| `paymentVerification` | Bank-transfer proof and verification state. |
| `courier` / `trackingNumber` | Fulfilment assignment. |
