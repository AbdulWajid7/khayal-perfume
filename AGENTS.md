# Project Operations

## Verification

- Type checking: `npx tsc --noEmit`
- Linting: `npm run lint`
- Production build: `npm run build`
- No automated test script is currently configured.

## Analytics ownership

GA4 (`G-FTPHVPR128`) and Meta Pixel (`1376042894320095`) are direct application integrations in `components/analytics/AnalyticsProvider.tsx`. GTM (`GTM-MCGCTF27`) is installed for future marketing tags and data-layer consumers. Do not add a GA4 Configuration/Google tag or Meta Pixel tag in GTM while the direct integrations remain enabled; doing so duplicates page views and conversions. Remove the corresponding direct integration before migrating either platform into GTM.

Microsoft Clarity (`ykfeupmawo`) is also loaded directly by the application. Public tracking IDs belong in the documented `NEXT_PUBLIC_*` environment variables. Private Meta Conversions API tokens must never use a public variable or be committed.
