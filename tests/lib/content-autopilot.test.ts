import { describe, expect, it } from "vitest";
import {
  checkQuality,
  clamp,
  countWords,
  fallbackImage,
  sanitizePostHtml,
  slugify,
  type GeneratedPost,
} from "@/lib/content-autopilot-helpers";

const links = ["/scent-finder", "/shop/silk-royale"];

const sections = (n: number, words: number) =>
  Array.from({ length: n }, (_, i) => `<h2>Section ${i}</h2><p>${"word ".repeat(words)}</p>`).join("");

const post = (over: Partial<GeneratedPost> = {}): GeneratedPost => ({
  title: "How to make perfume last longer in Karachi heat",
  metaTitle: "How to make perfume last longer",
  metaDescription: "Practical tips to make perfume last longer in Pakistan's heat and humidity.",
  focusKeyword: "make perfume last longer",
  excerpt: "Practical tips.",
  tags: ["Guides"],
  contentHtml: sections(4, 200),
  imagePrompt: "rose petals on linen",
  imageAlt: "Rose petals on linen",
  ...over,
});

describe("journal autopilot helpers", () => {
  it("makes clean slugs", () => {
    expect(slugify("Extrait de Parfum vs EDP & Attar: A Guide!")).toBe("extrait-de-parfum-vs-edp-and-attar-a-guide");
  });

  it("clamps meta text on a word boundary", () => {
    const out = clamp("one two three four five six seven eight nine ten", 20);
    expect(out.length).toBeLessThanOrEqual(20);
    expect(out.endsWith("…")).toBe(true);
  });

  it("strips unsafe markup and unknown internal links", () => {
    const html = sanitizePostHtml(
      '<h1>Big</h1><p onclick="x()">Hi <a href="/shop/silk-royale">SILK ROYALE</a> <a href="/shop/made-up">fake</a> <a href="javascript:alert(1)">bad</a> <a href="https://example.com">src</a></p><script>alert(1)</script><img src="x">',
      links
    );
    expect(html).toContain('<h2>Big</h2>');
    expect(html).toContain('<a href="/shop/silk-royale">SILK ROYALE</a>');
    expect(html).not.toContain("made-up");
    expect(html).toContain("fake");
    expect(html).not.toContain("javascript");
    expect(html).not.toContain("<script");
    expect(html).not.toContain("<img");
    expect(html).not.toContain("onclick");
    expect(html).toContain('rel="nofollow noopener"');
  });

  it("counts words without markup", () => {
    expect(countWords("<p>one two</p><h2>three</h2>")).toBe(3);
  });

  it("publishes only posts that pass the quality check", () => {
    expect(checkQuality(post(), 600).ok).toBe(true);
    expect(checkQuality(post({ contentHtml: sections(4, 50) }), 600).problems[0]).toContain("words");
    expect(checkQuality(post({ contentHtml: sections(1, 900) }), 600).problems).toContain("fewer than 2 sections");
    expect(checkQuality(post({ excerpt: "Smells like Creed Aventus" }), 600).problems).toContain(
      "mentions another brand or copy language"
    );
  });

  it("picks a fitting site image when image generation is unavailable", () => {
    expect(fallbackImage("Best oud for Eid").url).toBe("/images/ingredient-oud.jpg");
    expect(fallbackImage("Office scents for men").url).toBe("/images/hero/the-gentleman.jpg");
    expect(fallbackImage("anything else").url).toBe("/images/hero/oud-musk.jpg");
  });
});
