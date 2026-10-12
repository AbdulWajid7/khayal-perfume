---
name: kh-profile
description: >-
  Score KHAYAL's profiles out of 100 on Instagram, TikTok, Facebook, Threads
  and Google Business Profile against a fixed rubric, then rewrite what lost
  points in fix-first order (name field, bio, links, highlights, pinned posts).
  Use for "check our profile", "improve our bio", "profile audit", "why aren't
  people following", or after any name or handle change.
---

# kh-profile

People decide to follow or order from the profile, in about three seconds.

## Input

Screenshots of each profile (or the owner's browser, with them present). Score
only what is actually there, never from memory.

## Score

Use `marketing/social-kit/tools/profile_rubric.json`: each platform's items add
up to 100. Give each item full, half or zero points with one line of evidence.

## Output, per platform

```
INSTAGRAM  62/100
  -10  Name field: "KHAYAL" only -> "KHAYAL | Perfume Karachi" (searchable)
  -8   Highlights: none -> Scents · Order · Testers · Terrace · FAQ
  -5   Link: homepage -> scent finder (closer to an order)
  ...
REWRITES
  Name:  KHAYAL | Perfume Karachi
  Bio:   Extrait de parfum, made in Karachi. 38% perfume oil.
         Free tester with every order. Cash on delivery.
         Find your scent below.
```

Then the highlight cover list and the 3 posts to pin.

## Known fixes (as of 12 Oct 2026)

- TikTok handle "khayalfregnance" and Threads "khayalfragnance" are misspelt.
  Suggest one consistent handle; changing it is the owner's decision.
- Google Business: never add keywords to the business name (suspension risk).

## Rules

Bios pass `brand.py`. The owner makes the changes in each app; nothing is
changed by Claude in the accounts.
