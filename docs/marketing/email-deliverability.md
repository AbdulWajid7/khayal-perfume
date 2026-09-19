# Email Deliverability

## Sending domain

The welcome email uses:

- **From:** `KHAYAL <official@khayalparfum.com>`
- **Reply-To:** `official@khayalparfum.com`

Before enabling the public offer, the `khayalparfum.com` domain must be verified in Resend.

## Required DNS records (Resend-specific)

Resend will provide exact DNS records during domain verification. Do not paste DNS secrets into source code. Configure them in the DNS provider for `khayalparfum.com`.

Typical records include:

| Type | Host | Value | Purpose |
|------|------|-------|---------|
| TXT | @ | SPF v=spf1 include:_spf.resend.com ~all | Authorise Resend IPs |
| DKIM | resend._domainkey | CNAME / TXT provided by Resend | Cryptographic signature |
| TXT | _dmarc | v=DMARC1; p=quarantine; rua=mailto:dmarc@khayalparfum.com | Policy & reporting |

## DMARC recommendation

Start with `p=quarantine` and monitor reports. Move to `p=reject` only after stable, low complaint rates are confirmed.

## Bounce handling

- Track hard bounces and suppress invalid addresses.
- Update `Subscriber.emailDeliveryStatus` to `failed` with reason when a bounce is reported.

## Complaint handling

- Process spam complaints immediately.
- Mark complaining subscribers as unsubscribed and do not email them again.

## Unsubscribe handling

Every marketing email contains an unsubscribe link. Unsubscribe requests must:

- Mark `Subscriber.unsubscribed = true`.
- Record `unsubscribedAt`.
- Stop all promotional email within 24 hours.

## Testing checklist

- [ ] Domain verified in Resend.
- [ ] SPF/DKIM/DMARC records propagated.
- [ ] Test email delivered to inbox (not spam).
- [ ] Reply-to address monitored.
- [ ] Unsubscribe link functional.
- [ ] Plain-text version readable.

## Do not enable the public offer until

- DNS verification is complete.
- A test welcome email successfully lands in the inbox.
