---
name: kh-reply
description: >-
  Reply to comments under KHAYAL's own posts on Instagram, Facebook, TikTok and
  Threads, and to Google reviews: triage first, then draft replies in the
  right order, including critics, price complaints, "is this a copy?"
  questions and bad reviews. Use when the owner pastes comments or reviews,
  says "reply to these", "someone said X", or "answer this review".
---

# kh-reply

Replies in the first hour push a post further; a good public answer sells to
everyone reading. Sort first, then write.

## Input

Pasted comments or screenshots, with handles. Do not scrape threads with a
browser tool. Google reviews: pasted text or screenshots.

## Triage

| Bucket | Example | Gets |
|---|---|---|
| ORDER | "price?", "how to order", "Lahore delivery?" | A full public answer (price only if confirmed in admin), then "WhatsApp us at the link in bio". |
| QUESTION | "how long does it last?", "difference between OUD MUSK and DASTAAN?" | A real answer; flag it for a reply-Reel (`kh-reel`) if many people ask. |
| COPY QUESTION | "is this a copy of X?", "which brand is this like?" | Never name or confirm a reference. "Every KHAYAL scent is our own extrait, made in Karachi. Come smell it free / your order has a tester so you can judge it yourself." |
| PRAISE | "smells amazing" | Thanks in a few words, their name, maybe ask which scent. Ask permission before reusing it as a review. |
| CRITIC | "too expensive", "didn't last" | Concede the true part, give the fact (38% oil, tester, how to apply), offer help in DM. Once. Never argue twice. |
| COMPLAINT | broken bottle, late delivery | Apologise plainly, move to WhatsApp to fix it, alert the owner. Never promise refunds or compensation the owner has not approved. |
| SPAM / ABUSE | bots, insults | Nothing. Hide or delete abuse. |

Write in this order; stop when the value stops.

## Google reviews

- Reply to every review within 48 hours, by name, mentioning the scent if they
  did (helps local search).
- Bad review: thank, own the problem without excuses, give the fix and the
  WhatsApp contact; no personal details of the order in public.
- Never offer anything in exchange for reviews or for changing one.

## Rules

- Short: match their length. Roman Urdu if they wrote in Roman Urdu.
- Facts only from voice.md and the live site. Unknown answer: say we'll check
  and ask the owner.
- Never share a customer's order details, phone or address in public.
- Run `brand.py` on the batch. Print replies grouped by bucket, with the
  comment above each. The owner posts them (or approves sending).
