---
name: kh-plan
description: >-
  Plan KHAYAL's week across Instagram, Facebook, TikTok, Threads, Pinterest,
  Google Business Profile and WhatsApp status: what to post, which format, when, and
  which accounts to engage with, then load the approved posts into Metricool
  as drafts. Use for "plan the week", "content calendar", "what should we post",
  "schedule these", "put this in Metricool", or on Mondays.
---

# kh-plan

The week, decided once, so each day is just making the thing.

## Read first

0. Run `kh-research` for the week: competitors (`competitors.md`), trends
   (`swipe.md`), search demand and seasonal moments. Every slot in the plan
   names the evidence it is based on.
1. `marketing/social-kit/voice.md`: dates (Terrace Sat 17-Sun 18 Oct, launch
   Tue 20 Oct), offers, what is unconfirmed.
2. `marketing/social-kit/log.md` and `swipe.md`: what ran, what is working.
3. Metricool: `getScheduledPosts` for the next 14 days (never double-book),
   `getBestTimeToPostByNetwork` per network, `getBrandSettings` for the
   connected networks and the brand id.

## The weekly mix (adjust to what the owner can make)

| Format | Per week | Platforms |
|---|---|---|
| Reels / short video (`kh-reel`) | 3-4 | Instagram + Facebook + TikTok + Shorts |
| Carousel (`kh-carousel`) | 1-2 | Instagram + Facebook (TikTok photo mode) |
| Single photo with a strong caption | 1 | Instagram + Facebook |
| Threads posts (opinions, questions, behind the scenes) | 4-5 | Threads |
| Google Business update (`kh-gbp`) | 1 | GBP |
| Pins (`kh-pin`) | 5-10 | Pinterest |
| Stories / WhatsApp status (`kh-story`) | daily | IG, FB, WhatsApp |
| Engagement block (`kh-engage`) | 20 min daily | IG, TikTok, Threads |

Rotate the pillars: scent stories (one scent at a time), how-to-wear tips,
occasions (shaadi, office, Eid, gifting), behind the scenes (making, packing,
the founder), proof (real reviews only, with permission), and the event/launch.

## Output

A table: day · time (PKT, from best-time data) · platforms · format · scent ·
hook or idea · status (idea / needs filming / ready). Then the list of what the
owner has to film or photograph this week, grouped so it can be shot in one
session.

## Loading Metricool (only after "yes")

- Create each post with `createScheduledPost` **as a draft**, one network per
  post or the networks the owner approved. Media must be public URLs
  (commit images to `public/social/...` first; the live site serves them).
- Captions come from `kh-caption`, already linted, one version per network.
- Dates must be in the future (Metricool rejects past dates). Times in
  Asia/Karachi.
- Free plan limit: about 20 scheduled posts a month. Tell the owner when the
  plan goes over.
- `updateScheduledPost` needs the full post object and returns a new id; keep
  the uuid.
- Drafts never publish on their own. Tell the owner exactly which drafts to
  switch to Scheduled, or switch them only when the owner says so for those
  specific posts.
- Log each approved post in `marketing/social-kit/log.md` with its Metricool id.

## Rules

- No LinkedIn.
- Never publish or schedule without a clear yes for those posts.
- Never move or edit a post that is already live without asking.
