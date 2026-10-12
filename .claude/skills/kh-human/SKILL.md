---
name: kh-human
description: >-
  Clean any KHAYAL draft before it ships: strip machine tells (em dashes,
  invisible characters, stock perfume-ad words like "symphony" or "olfactory
  journey"), score how human it reads, and run the KHAYAL brand check (other
  brands, dupe words, EDP, oil %, dates, health claims, prices). Use on every
  caption, script, reply or email draft, or when the owner says "make it sound
  human", "this sounds like AI", "check this post".
---

# kh-human

The last step before anything public. Every other kh-* skill calls it.

```bash
python3 marketing/social-kit/tools/humanize.py draft.txt --report -o clean.txt
python3 marketing/social-kit/tools/detect.py draft.txt clean.txt     # before/after score
python3 marketing/social-kit/tools/brand.py clean.txt                # KHAYAL rules
```

## Steps

1. Save the draft to a file and run `humanize.py --report`. It fixes invisible
   characters, typography and the word list (`slop.json`, including a
   fragrance-copy block) automatically.
2. Read the cleaned text. Word swaps are mechanical, so fix grammar they break
   ("a interesting" -> "an interesting", or better, rewrite the sentence).
3. Rewrite every structural tell it reports ("isn't just X, it's Y", triads,
   preambles, emoji bullets) by hand. Say the one thing you mean.
4. Run `detect.py before after`. Aim for PASS. The weakest signal is usually
   SPECIFICITY: add a real smell, a real place, a real time, a number the owner
   gave you.
5. Run `brand.py`. Any FAIL must be fixed. Each WARN must be checked as true
   (price matches admin, longevity was tested, quote is real and consented).
6. Show the final text with: humanizer artefacts removed, human score, brand
   verdict.

## What the scores are and are not

They are local heuristics on the text. They are not GPTZero or any detector
service and promise nothing about one. The point is copy that sounds like a
person from Karachi who loves perfume, not to beat a detector.

## Never

- Invent specifics to raise the score. Ask for the real detail or leave
  `{{like this}}`.
- Remove a required fact (date, address) to shorten a line.
