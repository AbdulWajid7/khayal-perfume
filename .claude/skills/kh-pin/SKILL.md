---
name: kh-pin
description: >-
  Make KHAYAL Pinterest pins and boards: 2:3 pin images from real product
  photos, keyword-first titles and descriptions, the right board and link,
  loaded into Metricool as drafts. Pinterest is a search engine whose pins send
  traffic to the website for months. Use for "Pinterest", "make pins", "pin
  this", "Pinterest boards", "gift ideas pins".
---

# kh-pin

People use Pinterest to plan: weddings, gifts, outfits, Eid. A good pin is a
search result that keeps sending visitors to khayalparfum.com.

```bash
node marketing/social-kit/tools/slides.mjs pins.json      # "format": "pin" -> 1000x1500
python3 marketing/social-kit/tools/caption.py pin.txt --platform pinterest
```

## Boards (create once, owner approves names)

Wedding Perfume Ideas · Perfume Gifts for Him · Perfume Gifts for Her · Oud and
Saffron · Fresh Office Scents · How to Wear Perfume · KHAYAL Collection ·
Karachi Moments. Board names and descriptions use search words.

## Each pin

- **Image**: 1000x1500, a real bottle or ingredient photo, 3-6 words of text
  ("Wedding perfume that lasts"), the gold mark small. Never AI-drawn bottles.
- **Title** (100 characters max): the search phrase first. "Long lasting
  perfume for women in Pakistan: SILK ROYALE extrait".
- **Description** (500 max): 2-3 plain sentences with the keywords people type,
  no hashtags. Lint with `caption.py --platform pinterest`.
- **Link**: the exact product or journal page, never just the homepage.
- **Board**: the most specific one.

## Rhythm

5-10 fresh pins a week: every new journal article gets 2 pins, every scent gets
pins for its occasions, every carousel gets one pin per strong slide.

## Publishing

Research first (`kh-research` for keywords). Images go to `public/social/pins/`
so they have public URLs. Load into Metricool with `createScheduledPost` as
drafts, provider `pinterest`, `pinterestData.boardId` (board name works if
unambiguous), `pinTitle` and `pinLink`. The owner approves before anything
publishes. Log each pin in `marketing/social-kit/log.md`.
