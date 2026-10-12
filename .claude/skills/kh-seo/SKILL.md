---
name: kh-seo
description: >-
  Push khayalparfum.com up Google for Pakistan perfume searches the safe way:
  weekly Search Console check, on-page fixes, the backlink tracker
  (profiles, directories, list-post outreach, press, partners), and drafts for
  every outreach email. Use for "backlinks", "rank on Google", "SEO", "why are
  we not on page one", "get us featured", "press release".
---

# kh-seo

Ranking a new shop in Pakistan comes from four things, in this order: a clean,
fast site with real product pages; content that answers what people search;
links from real Pakistani sites; and reviews plus a strong Google Business
Profile. No shortcuts: bought links and fake reviews get sites penalised.

## Weekly (Mondays, 20 minutes)

1. OpenSEO (free reads): `get_search_console_performance` for the last 7 and 28
   days by query and by page. Find queries in positions 5-20 with impressions:
   those pages get improved first (title, first paragraph, FAQ, internal links).
2. Check the journal autopilot published its posts (admin Journal Posts). Thin
   or failed posts are fixed or unpublished.
3. Move 3-5 rows in `marketing/social-kit/backlinks.md` forward. Draft every
   outreach message (`kh-dm` style: short, specific, no payment for links).
4. Report: what moved, what is next, in five lines.

Paid OpenSEO actions (keyword volumes, rank tracking, backlink reports, audits
with Lighthouse) cost credits: tell the owner the cost first.

## On-page rules (the codebase)

- Titles 50-60 characters, keyword first; descriptions 140-155.
- Every product page: unique copy, notes, FAQ, Product schema with a price once
  prices are set.
- Internal links: every journal post links to 2-4 product pages and the scent
  finder (the autopilot does this).
- After structural changes: run `npx tsc --noEmit`, `npm run lint`,
  `npm run test`, push to main, then request indexing in Search Console.

## Outreach targets

See `backlinks.md`: profiles, directories, third-party "best perfume brands in
Pakistan" lists, press (ProPakistani, Brandsynario, Dawn Images, Aurora,
Tribune Life & Style), partners (The Terrace Cafe, wedding vendors).

## Never

Buy links or link packages, use private blog networks, spin articles, write
fake reviews or ask anyone to, stuff keywords into the Google Business name,
or name designer brands on the site.
