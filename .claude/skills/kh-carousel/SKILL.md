---
name: kh-carousel
description: >-
  Make a KHAYAL swipe post (Instagram and Facebook carousel, TikTok photo
  mode): the cover that earns the swipe, slide copy, and the rendered
  1080x1350 PNGs in the house style with real bottle photos. Use for
  "carousel", "swipe post", "slides about notes", "how to wear perfume post",
  "comparison of our scents", or any multi-image post.
---

# kh-carousel

Carousels are saved and shared, which is why they keep reaching people for
days. Each slide has one job: make the next swipe happen.

```bash
node marketing/social-kit/tools/slides.mjs deck.json     # renders the PNGs
```

(First time only: `cd marketing/social-kit && npm install`. Set `CHROMIUM_PATH`
if Chrome is not found.)

## Before writing

0. **Research first.** Run `kh-research` (or reuse its brief if one exists for this
   piece today). No brief, no draft.

Read `marketing/social-kit/voice.md` (notes per scent, rules, dates).

## The shape (5-8 slides)

1. **Cover**: the promise in 6-8 words over a real bottle or ingredient photo.
   This is the hook; score the line with `hookscore.py --hook "..."`.
2. **Slides 2 to n-1**: one idea each, a headline and at most 35 words. Number
   them if it is a list.
3. **Last slide**: the payoff and one ask (scent finder, WhatsApp, the Terrace).

Good KHAYAL carousels: "How each scent changes from 9 am to midnight", "Which
KHAYAL for which shaadi function", "5 ways to make perfume last in Karachi
heat", "Notes, explained: what saffron/oud/tuberose smell like", "Extrait vs
everything else: why 38% oil matters" (no other brands named).

## Steps

1. Write the slide copy as JSON (format in the header of `slides.mjs`): types
   `cover`, `text`, `notes`, `cta`; themes `gentleman` (navy), `silk`
   (rose-gold), `oud` (teal-amber), `ink`, `cream`. Match the theme to the scent.
2. Images: real photos only, from `public/images/hero/` or `public/social/`.
   Never AI-drawn bottles. Ingredient photos may be AI-generated (Gemini/Runway)
   if they look like real photography, and the post then gets the AI label.
3. Run `brand.py` on all slide text (no FAIL) and `humanize.py`.
4. Render to `marketing/social-kit/out/<name>/`, look at every slide (Read the
   PNGs or a contact sheet) and fix crowding, overflow or low contrast.
5. Write the caption with `kh-caption` (Instagram and Facebook versions).
6. Send the PNGs to the owner. On "yes", copy them to `public/social/<name>/`
   so they have public URLs, commit, and hand to `kh-plan` for a Metricool
   draft. Never publish without approval.
