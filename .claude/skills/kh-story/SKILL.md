---
name: kh-story
description: >-
  Plan and make KHAYAL story sequences for Instagram, Facebook and WhatsApp
  status: the frames, which sticker does which job, the rendered 1080x1920
  frames, and the reply/DM path that turns a story view into an order. Use for
  "story", "stories for today", "WhatsApp status", "countdown", "poll",
  "event day stories", "behind the scenes".
---

# kh-story

Stories are for people who already follow. Their job is conversation: a reply,
a poll tap, a DM, which is what turns a follower into an order.

```bash
node marketing/social-kit/tools/slides.mjs story.json   # with "format": "story"
```

## Before writing

Read `marketing/social-kit/voice.md` (dates, offers, the ask).

## A daily sequence (3-6 frames)

1. **Open**: something real today: the bottles being packed, a delivery leaving,
   the Terrace setup, a hand spraying a blotter. Real photo or video, not a
   graphic.
2. **Engage**: one sticker with one job:
   - Poll: "Office or shaadi: which scent first?" (cheap, gets taps)
   - Quiz: "Which note is in SILK ROYALE?" (teaches the notes)
   - Question box: "Ask us anything about longevity" (feeds `kh-reply`/`kh-reel`)
   - Slider: "How strong do you like it?"
   - Countdown: launch (Tue 20 Oct) or the Terrace (Sat 17 Oct, 5 pm); followers
     get a reminder.
3. **Value**: one tip or one scent's notes (a `notes` frame).
4. **Ask**: link sticker to khayalparfum.com or the scent finder, or "Reply
   TESTER and we'll help you pick". One ask.

WhatsApp status gets the same frames, with "reply to this status" as the ask
(it opens a chat with us, which the bot answers).

## Rules

- Safe zone: no text above y=260 or below y=1620 on 1080x1920.
- Real people on camera only with their consent (the Terrace kit has the
  consent line). No AI people as customers.
- Event stories: Fri 16 Oct "tomorrow", Sat 17 and Sun 18 Oct live from the
  Terrace (5 pm to 12 am), with @theterracecafe.pk tagged.
- `brand.py` on every frame's text. No FAIL.
- Render, look at every frame, send to the owner. Stories are posted by the
  owner from the phone, or as Metricool drafts via `kh-plan`, after a yes.
