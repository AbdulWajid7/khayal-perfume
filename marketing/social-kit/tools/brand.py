#!/usr/bin/env python3
"""
brand.py - the KHAYAL rules every public word has to pass.

Checks a draft for the mistakes that cost a perfume brand in Pakistan the most:
naming designer houses or "copy" language (trademark complaints, Meta ad
rejections), the wrong concentration, prices that are not confirmed, claims
nobody can stand behind, product names written the wrong way, and old event
dates. The same banned list protects the website's WhatsApp bot and journal
(lib/bot-knowledge.ts), so public copy and the bot never disagree.

FAIL = must fix before posting. WARN = check it is true, then it can stay.

Usage
  python3 brand.py draft.txt
  pbpaste | python3 brand.py -
  python3 brand.py draft.txt --json
"""

import argparse
import json
import re
import sys

PRODUCTS = ["THE GENTLEMAN", "SILK ROYALE", "OUD MUSK", "DASTAAN", "SAMANDAR", "BAHAAR", "JAZBA",
            "VICTOR", "DARK ICE", "CHERIE", "CRYSTAL NOOR"]

DESIGNERS = re.compile(
    r"\b(creed|dior|chanel|tom ford|ysl|yves saint laurent|armani|versace|montale|mancera|lattafa|"
    r"amouage|kilian|gucci|prada|herm[eè]s|bvlgari|bulgari|paco rabanne|rabanne|jo malone|le labo|"
    r"kurkdjian|baccarat|aventus|sauvage|bleu de|j'adore|good girl|one million|1 million|"
    r"fragrance one|office for men|queen of silk|white aoud|white oud)\b", re.I)
COPY_WORDS = re.compile(r"\b(dupe|replica|first copy|copy of|inspired by|impression of|clone|"
                        r"smells? (?:exactly )?like (?:the )?(?:original|designer)|same as the original)\b", re.I)
EDP = re.compile(r"\beau de parfum\b|\bEDP\b|\beau de toilette\b|\bEDT\b", re.I)
OIL = re.compile(r"\b(\d{1,2})\s?(?:%|percent)\s+(?:perfume |fragrance )?oil", re.I)
PRICE = re.compile(r"\b(?:rs\.?|pkr)\s?\d[\d,]*|\b\d[\d,]{2,}\s?(?:rs|pkr|rupees)\b", re.I)
OLD_DATES = re.compile(r"\b18\s*(?:&|and)\s*(?:sun(?:day)?\s*)?19\b|\bsat(?:urday)?\s*18\b|\bsun(?:day)?\s*19\b|"
                       r"\b19(?:th)? oct", re.I)
HEALTH = re.compile(r"\b(cures?|heals?|therapy|therapeutic|anxiety|depression|insomnia|aphrodisiac|"
                    r"pheromones?|hormones?|detox|clinically|dermatologist[- ]tested|hypoallergenic|"
                    r"100% (?:natural|organic)|chemical[- ]free)\b", re.I)
LONGEVITY = re.compile(r"\b(?:lasts?|stays?|longevity)\b[^.!?\n]{0,25}?\b(1[3-9]|[2-9]\d)\+?\s*(?:hours|hrs|h)\b"
                       r"|\b(?:all day and night|forever|24\s*hours?)\b", re.I)
SUPERLATIVE = re.compile(r"\b(?:best|no\.?\s?1|number one|#1|cheapest|strongest)\b[^.!?\n]{0,30}"
                         r"\b(?:in pakistan|in karachi|in the world|ever|perfume)\b", re.I)
SOCIAL_PROOF = re.compile(r"\b(?:customers? (?:say|love|said)|reviews?|testimonials?|rated|\d+\s?(?:\+\s)?"
                          r"(?:happy )?customers|sold out|bestsell(?:er|ing))\b", re.I)
FREE_DELIVERY = re.compile(r"\bfree (?:delivery|shipping)\b", re.I)
EM_DASH = re.compile("—")


def check(text):
    issues = []

    def add(rule, level, detail):
        issues.append({"rule": rule, "level": level, "detail": detail})

    m = DESIGNERS.search(text)
    if m:
        add("OTHER BRANDS", "FAIL", f'names "{m.group(0)}". Never name designer houses or their perfumes in public')
    m = COPY_WORDS.search(text)
    if m:
        add("COPY LANGUAGE", "FAIL", f'"{m.group(0)}". KHAYAL scents are its own; no dupe/inspired/copy words')
    m = EDP.search(text)
    if m:
        add("CONCENTRATION", "FAIL", f'"{m.group(0)}". Every KHAYAL scent is an Extrait de Parfum')
    for pct in OIL.findall(text):
        if pct != "38":
            add("OIL PERCENT", "FAIL", f"says {pct}% oil. KHAYAL extraits are 38% perfume oil")
    m = OLD_DATES.search(text)
    if m:
        add("EVENT DATE", "FAIL", f'"{m.group(0)}". The Terrace Cafe weekend is Sat 17 and Sun 18 Oct')
    m = HEALTH.search(text)
    if m:
        add("HEALTH CLAIM", "FAIL", f'"{m.group(0)}". No medical, mood or skin-safety claims')
    m = LONGEVITY.search(text)
    if m:
        add("LONGEVITY CLAIM", "WARN", f'"{m.group(0)}". Say what was actually tested; the site says 10-12 hours for SILK ROYALE')
    m = SUPERLATIVE.search(text)
    if m:
        add("SUPERLATIVE", "WARN", f'"{m.group(0)}". Unprovable; show a reason instead')
    m = PRICE.search(text)
    if m:
        add("PRICE", "WARN", f'"{m.group(0)}". Confirm it matches the live price in admin before posting')
    m = SOCIAL_PROOF.search(text)
    if m:
        add("SOCIAL PROOF", "WARN", f'"{m.group(0)}". Only real, consented customer words or real counts')
    m = FREE_DELIVERY.search(text)
    if m:
        add("DELIVERY OFFER", "WARN", f'"{m.group(0)}". Confirm the current delivery policy first')
    if EM_DASH.search(text):
        add("EM DASH", "WARN", "em dash in short copy reads as machine-written; use a comma or full stop")
    for name in PRODUCTS:
        for hit in re.finditer(re.escape(name), text, re.I):
            if hit.group(0) != name:
                add("PRODUCT NAME", "WARN", f'"{hit.group(0)}" should be written {name}')
                break
    return issues


def main():
    ap = argparse.ArgumentParser(description="Check a draft against the KHAYAL brand rules.")
    ap.add_argument("input", nargs="?", default="-", help="file, or - for stdin")
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()
    text = sys.stdin.read() if args.input == "-" else open(args.input, encoding="utf-8").read()
    issues = check(text)
    if args.json:
        print(json.dumps(issues, indent=2, ensure_ascii=False))
    else:
        print("\nKHAYAL BRAND CHECK")
        print("=" * 62)
        for i in issues:
            print(f"  {i['level']:<5} {i['rule']:<16} {i['detail']}")
        if not issues:
            print("  PASS  nothing to fix")
        fails = sum(i["level"] == "FAIL" for i in issues)
        print("-" * 62)
        print(f"  VERDICT  {'FIX' if fails else ('REVIEW' if issues else 'READY')}\n")
    sys.exit(1 if any(i["level"] == "FAIL" for i in issues) else 0)


if __name__ == "__main__":
    main()
