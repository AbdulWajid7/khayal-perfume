---
name: kh-gbp
description: >-
  Run KHAYAL's Google Business Profile for local search in Karachi: weekly
  updates, event and offer posts, product entries for the 11 scents, photo
  plans, review requests and review replies. Use for "Google Business",
  "Google Maps", "GBP post", "local SEO", "get more Google reviews", "add the
  Terrace event to Google".
---

# kh-gbp

When someone in Karachi searches "perfume near me" or "perfume shop North
Nazimabad", the Business Profile is what they see first. It runs on fresh
updates, real photos and reviews.

## Weekly

- **One update** (Metricool has GBP connected): 150-300 words is plenty,
  local and plain, one real photo, a button (Order online -> khayalparfum.com,
  or Learn more). Lint with
  `python3 marketing/social-kit/tools/caption.py post.txt --platform gbp`:
  no phone numbers (posts get rejected), no hashtags.
- **Event posts** for real events: The Terrace Cafe, B-72, Street 12, Block L,
  North Nazimabad, Sat 17 and Sun 18 Oct, 5 pm to 12 am.
- **3-5 new photos**: real bottles, packaging, the testers, the event. No
  AI-generated images on the profile.

## Once

- **Products**: all live scents with a real photo, 1-2 lines from voice.md, and
  the product page link. Price only when confirmed.
- **Description** (750 characters): extraits de parfum, 38% perfume oil, made
  in Karachi, free tester, cash on delivery across Pakistan. No phone, no links.
- **Categories and service area**: Karachi and Pakistan; hours that are real.

## Reviews

- Ask every customer after delivery: the WhatsApp review template
  (`review_request`) with GOOGLE_REVIEW_URL, sent automatically by the site once
  approved by Meta, and the QR on the tester card.
- Reply to every review within 48 hours (`kh-reply` has the playbook).
- Never offer discounts or gifts for reviews, never write reviews ourselves or
  ask staff and family to. Google removes them and can suspend the profile.

## Measure

Monthly with `kh-audit`: searches, map views, website clicks, calls,
direction requests, review count and average.
