# KHAYAL social kit

The tools and shared files behind the `kh-*` skills in `.claude/skills/`. Ask Claude for a
skill by name (for example `/kh-reel`) while working in this repo.

| File | What it is |
|---|---|
| `voice.md` | The brand voice, the 11 scents, rules, dates. Every skill reads it first. Keep it current. |
| `log.md` | What was approved and posted. `kh-audit` reads it. |
| `swipe.md` | What is working in the niche, written by `kh-trends`. |
| `tools/brand.py` | KHAYAL rules check: other brands, copy words, EDP, oil %, dates, health claims, prices. |
| `tools/caption.py` | Caption linter for Instagram, Facebook, TikTok, Threads, Google Business, WhatsApp status, Shorts. |
| `tools/hookscore.py`, `tools/hooks.json` | Hook scorer and 34 hook formulas (8 written for fragrance). |
| `tools/beats.py` | Script to timed beat sheet. |
| `tools/humanize.py`, `tools/detect.py`, `tools/slop.json` | Humanizer and five-check score, with a fragrance-copy word list. |
| `tools/swipe.py` | Ranks collected reels by outlier multiple. |
| `tools/slides.mjs` | Renders carousels, stories and square posts in the house style. |
| `tools/platforms.json` | Character limits, hashtag caps and rules per platform. |
| `tools/profile_rubric.json` | Profile score out of 100, per platform. |

Python 3 only, no packages. For slides: `cd marketing/social-kit && npm install` once
(set `CHROMIUM_PATH` if Chrome is not found).

Nothing here posts anything. Drafts go to Metricool as drafts; the owner approves.

The hook scorer, beat sheet, humanizer, detector, swipe ranker and the base caption linter
are adapted from Jake Schincariol's
[instagram-agent-skill](https://github.com/Jakeschincariol/instagram-agent-skill), MIT
licence (see `LICENSE-instagram-agent-skill.txt`).
