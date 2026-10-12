---
name: kh-reel
description: >-
  Write a KHAYAL short video for Instagram Reels, TikTok, Facebook Reels and
  YouTube Shorts from one idea: three scored hooks, the spoken script or
  voiceover, on-screen text, a shot list built from real bottles and the
  scent's own ingredients, and a timed beat sheet. Use for "make a reel",
  "TikTok idea", "video for SILK ROYALE", "script for the Terrace", "what
  should I film", or any short-form video request.
---

# kh-reel

One idea in, one video somebody finishes out. Fragrance cannot be smelled
through a screen, so every KHAYAL video borrows a smell the viewer already
knows (rain, chai, motia, a mehndi night) and shows the real bottle.

Tools (run them, never eyeball):

```bash
python3 marketing/social-kit/tools/hookscore.py hooks.txt          # rank hook options
python3 marketing/social-kit/tools/beats.py script.txt --target 20  # timed beat sheet
python3 marketing/social-kit/tools/brand.py script.txt              # KHAYAL rules
python3 marketing/social-kit/tools/humanize.py script.txt --report  # strip machine tells
```

## Before writing

0. **Research first.** Run `kh-research` (or reuse its brief if one exists for this
   piece today). No brief, no draft.

1. Read `marketing/social-kit/voice.md`: the scents and their notes, words we
   never use, dates, what is still unconfirmed.
2. Read `marketing/social-kit/tools/hooks.json`. Formulas 27-34 were written
   for fragrance (Smell It Through The Screen, The Hours Test, Blind Spray,
   Occasion Rescue, Notes Countdown, Price Honest, Gift Panic, Compliment
   Count). The other 26 are general.
3. Read `marketing/social-kit/swipe.md` if `kh-trends` has filled it: real
   evidence of what is working beats any default here.
4. One scent per video. If the idea needs two, it is two videos. If the idea is
   thin, ask one batched question (which scent, which moment, what is real).

## The shape

```
0:00-0:02  HOOK      spoken line + on-screen line (6 words max), motion in frame 1
0:02-0:06  THE STAKE why the viewer cares: the wedding, the office, the heat
0:06-...   THE BODY  one note or one moment per beat; the frame changes every beat
LAST 3s    PAYOFF    the bottle, the name, ONE ask
LAST LINE  LOOP      echo a word from the hook
```

Length: 12-25 s for product reels, up to 45 s for a founder talking. TikTok
tolerates longer; Instagram rewards the replay.

## Steps

1. **Three hooks** from three different formulas, each with the spoken line and
   the on-screen line. Score them with `hookscore.py`. Under 50 means no hook
   yet. Show the ranking.
2. **Script** on the winner, in the voice from voice.md. Voiceover by default
   (the founder's or a hired voice), to-camera only if the owner will film it.
3. **Shot list**, one line per beat. Rules:
   - Only real KHAYAL bottles from real photos/footage. Only three bottle
     colours exist (THE GENTLEMAN navy, SILK ROYALE teal-rose, OUD MUSK
     teal-amber). Never ask an AI tool to draw or redraw a bottle.
   - Ingredient shots come from that scent's notes in voice.md (saffron threads,
     tuberose, oud chips, citrus peel). Endings use the scent's own ingredients,
     never generic rocks or smoke.
   - If AI video is used (Runway), it is for ingredient and mood shots only, the
     bottle is composited from the real photo, and the cost in credits is told to
     the owner before generating.
   - No AI people presented as customers. Real people only, with consent.
4. **Time it** with `beats.py --target {seconds}` and fix every flag.
5. **Check it**: `brand.py` (must be no FAIL) and `humanize.py`.
6. **Per-platform notes**: Instagram cover frame and 3-5 tags via `kh-caption`;
   TikTok searchable words said out loud and in the caption; Facebook cross-post;
   Shorts title with the keyword in the first 40 characters.
7. **Print the block**:

```
REEL READY  ·  SILK ROYALE
hook:      #29 The Hours Test, 81 STRONG
length:    19.6 s, 7 beats
shots:     5 ingredient, 2 bottle (real photo)
brand:     READY   humanizer: 3 artefacts removed
next:      kh-caption for each platform

Reply "yes" to log it, or tell me what to change.
```

## Safe zones (9:16, 1080x1920)

Keep text between y=250 and y=1440 and out of the right 230 px (Instagram) or
the right 180 px and bottom 480 px (TikTok). Hook card visible at frame 1.
Burn in captions; most people watch muted.

## The gate

This skill writes. The owner films and posts, or approves a Metricool draft
(`kh-plan`). Never publish or schedule without a clear yes. On yes, append one
line to `marketing/social-kit/log.md`: date · platforms · reel · formula · first line.
Never invent a number, a customer, a compliment or a longevity result: write
`{{like this}}` and flag it.
