# Project Operations

## Verification

- Type checking: `npx tsc --noEmit`
- Linting: `npm run lint`
- Production build: `npm run build`
- Tests: `npm run test` (Vitest, `tests/**/*.{test,spec}.{ts,tsx}`)

## Analytics ownership

GA4 (`G-FTPHVPR128`) and Meta Pixel (`1376042894320095`) are direct application integrations in `components/analytics/AnalyticsProvider.tsx`. GTM (`GTM-MCGCTF27`) is installed for future marketing tags and data-layer consumers. Do not add a GA4 Configuration/Google tag or Meta Pixel tag in GTM while the direct integrations remain enabled; doing so duplicates page views and conversions. Remove the corresponding direct integration before migrating either platform into GTM.

Microsoft Clarity (`ykfeupmawo`) is also loaded directly by the application. Public tracking IDs belong in the documented `NEXT_PUBLIC_*` environment variables. Private Meta Conversions API tokens must never use a public variable or be committed.

## Marketing operations (KHAYAL brand memory)

Any session working for KHAYAL starts here. The brand's memory lives in this repo, not in a chat.

- **Read first:** `marketing/social-kit/voice.md` (brand facts, 11 scents and notes, rules, dates, what is unconfirmed), `competitors.md`, `backlinks.md`, `log.md`, `swipe.md`.
- **Skills:** `.claude/skills/kh-*`. Research (`kh-research`) runs before any content. Content: `kh-reel`, `kh-caption`, `kh-carousel`, `kh-story`, `kh-pin`, `kh-repurpose`. Scheduling: `kh-plan`. Quality gate: `kh-human` (runs `tools/brand.py`). Community: `kh-reply`, `kh-dm`, `kh-engage`. Growth: `kh-seo`, `kh-gbp`, `kh-profile`, `kh-trends`, `kh-audit`.
- **Connected tools:** Metricool (brand id 7348797; Instagram @khayalfragranceofficial, Facebook, Threads, TikTok, Pinterest, Google Business Profile; no LinkedIn), OpenSEO (project dbca6bfc-3320-4a0b-a654-920f19afd434; Search Console reads are free, research costs credits), Runway (video; state credit cost before generating), Gemini (site bot and journal autopilot), AdWhispr, MyChatBot, HyperFrames, Claude Docs.
- **Hard rules:** never publish, schedule, send or spend without the owner's explicit yes for that item; Metricool posts are created as drafts. Never name designer brands or use dupe/inspired/copy language in public. Never fabricate reviews, ratings, customer quotes, counts or AI "customers". Never buy links. Only the three real bottle colours exist; never let AI redraw a bottle.
- **Keep it current:** when prices, offers, dates or handles change, update `voice.md` in the same session; log every approved post in `log.md`.
