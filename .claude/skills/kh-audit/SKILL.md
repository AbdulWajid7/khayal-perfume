---
name: kh-audit
description: >-
  Post-mortem on what KHAYAL already posted across Instagram, Facebook, TikTok,
  Threads and Google Business: pull the numbers from Metricool, rank posts by
  how far they beat the account's own median (not raw views), and say what to
  make more and less of. Use for "how are our posts doing", "weekly report",
  "what worked", "analytics", "audit our social".
---

# kh-audit

Raw views lie. A post that did 3x our usual is a lesson; a post that did our
usual is noise however big it looks.

## Data

- Metricool: `getAnalyticsAvailableMetrics` per network, then
  `getAnalyticsDataByMetrics` for the period (default: last 28 days) and
  `getScheduledPosts` for what was published. Save the raw numbers to a CSV in
  `marketing/social-kit/out/audit-YYYY-MM-DD/` and compute in Python. Never
  estimate numbers in prose.
- `marketing/social-kit/log.md` for each post's hook formula and format.
- Website side (optional): Search Console clicks via OpenSEO
  (`get_search_console_performance`, free) and orders in admin.

## What to rank by

- **Outlier multiple**: the metric divided by that network's median for the
  same format over the period. Over 2x is a signal, under 0.7x a miss.
- **Reels/TikTok**: shares and saves per reach, and average watch time if
  available. Views alone are last.
- **Carousels/photos**: saves and shares per reach.
- **Stories**: replies and link taps.
- **GBP**: searches, calls, website clicks.
- **The business**: WhatsApp chats and orders that week.

## Output

1. Top 3 and bottom 3 posts per network with their multiple and the likely
   reason (hook formula, scent, format, time).
2. Patterns: which formulas, scents, pillars and posting times win.
3. Three decisions for next week (feed them into `kh-plan`).
4. One line on anything broken (a network not posting, a draft never approved).

Keep the report short. If the sample is too small (under ~8 posts on a
network), say so instead of drawing conclusions.
