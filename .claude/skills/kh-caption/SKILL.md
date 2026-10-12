---
name: kh-caption
description: >-
  Write and lint KHAYAL captions for every platform at once (Instagram,
  Facebook, TikTok, Threads, Google Business Profile, WhatsApp status, YouTube
  Shorts), each fitted to that platform's limits and showing exactly what the
  feed shows before "more". Use for "write a caption", "caption for this
  post/reel", "post copy for all platforms", or before anything goes into
  Metricool.
---

# kh-caption

One message, written natively for each platform, and linted before anyone sees
it. Most captions fail in the first line, the only part a scrolling stranger
reads.

```bash
python3 marketing/social-kit/tools/caption.py cap.txt --platform instagram --keywords "perfume Karachi"
python3 marketing/social-kit/tools/caption.py cap.txt --platform all   # one draft, every platform
```

Platforms: `instagram facebook tiktok threads gbp whatsapp_status youtube_shorts`.
Limits live in `marketing/social-kit/tools/platforms.json`; if an app now
behaves differently, update that file.

## Before writing

0. **Research first.** Run `kh-research` (or reuse its brief if one exists for this
   piece today). No brief, no draft.

Read `marketing/social-kit/voice.md`. Know the scent, the occasion, the one ask
and which facts are still unconfirmed (prices, tester size, offers).

## How each platform differs

| Platform | Write it as |
|---|---|
| Instagram | Hook in the first 125 characters. Story or tip, then one ask. 3-5 specific tags at the end. No links (dead). |
| Facebook | Same message, warmer and a little longer; a link is fine; 0-3 tags. Many readers are older and on WhatsApp: "WhatsApp us" works. |
| TikTok | Under 150 characters. The words people search ("long lasting perfume for men Pakistan"). 3-5 tags. |
| Threads | A sentence a person would say: an opinion or a question, not an ad. Under 500 characters, one topic tag. |
| Google Business | Local and plain: Karachi, North Nazimabad, extrait de parfum, delivery across Pakistan. No hashtags, no phone number (use the Call button). Pick a button: Order online / Learn more. |
| WhatsApp status | One or two lines, personal, one link or "reply to this status". |
| YouTube Shorts | Title under 60 characters with the keyword first. |

Hashtags: specific beats big. Rotate from: #khayalparfum #perfumekarachi
#perfumepakistan #extraitdeparfum #weddingperfume #oudperfume #karachi
#giftsforhim #giftsforher. Never #fyp #viral #explore.

## Steps

1. Write the Instagram version first, then adapt (do not paste the same text
   everywhere).
2. Run `caption.py --platform` for each one. Fix every FAIL, and every WARN
   unless it is deliberate (say why).
3. `brand.py` runs inside the linter. Any BRAND FAIL blocks the caption.
4. Run `humanize.py --report` on the final text.
5. Print every version in its own fenced block with its verdict line, then:
   `Reply "yes" to put these into Metricool as drafts (kh-plan), or tell me what to change.`

## Rules

- One ask per caption. Two asks is no ask.
- Product names in capitals: SILK ROYALE, not Silk Royale.
- Collaborations: tag partners only when they agreed (for example
  @theterracecafe.pk for the Terrace weekend).
- AI label: if the visual is AI-generated, turn on the platform's AI label
  ("Made with AI" on Instagram/Facebook, AI-generated content toggle on TikTok).
  Real product photos need no label.
- Never invent prices, offers, reviews or counts. `{{price}}` and flag it.
- Never post. Drafts only, approval first.
