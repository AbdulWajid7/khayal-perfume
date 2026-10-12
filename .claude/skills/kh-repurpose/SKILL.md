---
name: kh-repurpose
description: >-
  Turn one KHAYAL asset (a Runway film, a Terrace video, a founder voice note,
  a journal article, a photo shoot) into a week of native posts across
  Instagram, Facebook, TikTok, Threads, Google Business and WhatsApp status,
  each one standing alone. Use for "repurpose this", "get more out of this
  video", "turn this article into posts", "we did a shoot, what now".
---

# kh-repurpose

One good asset should feed a week. Each cut must work for someone who never
saw the original.

## Research first

Run `kh-research` before making anything; no brief, no draft.

## Input

The asset (video file, link, article, photos) and what is true about it
(scent, place, people with consent).

## Map it out

From one 30-60 s film or shoot:
- 2-3 vertical cuts (6-15 s), each built around one moment and its own hook
  (`kh-reel` to score hooks and time them). Different first frames.
- 1 carousel: stills plus notes or tips (`kh-carousel`).
- 3-5 stills for single posts, stories and the Google Business profile.
- 2-3 Threads posts: what it took to make it, an opinion it raises, a question.
- 1 Google Business update with a still (`kh-gbp`).
- WhatsApp status: the best 10 s and one line.

From one journal article (the daily autopilot writes these):
- A carousel of its tips, a Threads post with its strongest opinion, a reel
  script answering its main question, a GBP update linking to it.

## Video cuts (ffmpeg)

Cut, crop to 9:16 (blurred background if the source is 16:9 so the bottle is
never cropped), burn captions, add the end card. Keep a copy of every render in
`marketing/social-kit/out/`. Committed media goes to `public/social/<name>/` so
Metricool can fetch it.

## Rules

- Do not post the same file and caption everywhere. Re-hook each piece.
- Real bottles only; AI shots get the AI label.
- Check every caption with `kh-caption` and `brand.py`.
- Output: a table of pieces (platform, format, hook, file, day), then hand the
  approved set to `kh-plan`.
