---
name: kh-trends
description: >-
  Find what is working right now for perfume and lifestyle accounts in
  Pakistan on Instagram, TikTok and YouTube Shorts, rank it by outlier
  multiple, name the hook formula, and write the swipe file KHAYAL's reels are
  built from. Also checks trending audio, formats and seasonal moments
  (shaadi season, Eid, winter). Use for "what's trending", "find viral
  perfume videos", "what are competitors posting", "trend research".
---

# kh-trends

The research skill. Run it monthly and before big moments (wedding season,
Eid, launch). Formats last a season.

```bash
python3 marketing/social-kit/tools/swipe.py captured.tsv --out marketing/social-kit/swipe.md
```

## The idea

Rank by **views divided by that account's own median**. A 5k-follower Karachi
account getting 200k views found something copyable; a 2M account getting 400k
had a normal day. Collect accounts within about 10x of our size.

## Step 1: accounts (owner approves)

- 4 direct: Pakistani perfume and attar brands and perfume reviewers.
- 4 adjacent: Karachi bridal, menswear, cafes, lifestyle creators (same
  audience, different product; formats arrive here first).
- 2-4 big accounts for format only.

## Step 2: look, at human speed

- Use the browser the session has, with the owner logged in on their own
  device. Never ask for a password, never log in as them.
- Read, do not scrape: about 10 accounts x 12 videos. No crawlers, no scraping
  services, no background loops.
- YouTube Shorts has public view counts and is a fine second corpus.
- Capture per video: account, followers, median (middle of the last 12),
  views, hook (verbatim first line), on-screen text, length, ask. Save as TSV.

## Step 3: rank and write

Run `swipe.py`. It names the formula (34 in `hooks.json`, 8 fragrance-specific)
and writes `swipe.md`. Add a short "what to make" section: 5 video ideas for
KHAYAL, each with the formula, the scent, and the first line.

Also note, with the date: trending audio that business accounts may use (only
from the platform's commercial music library), seasonal hooks (wedding dates,
weather, Eid), and Google searches rising for perfume in Pakistan (web search).

## Rules

- Copy the shape, never the video, script or voice. Attribute every row.
- Never name other perfume brands in our public posts, even when we learn from
  them.
