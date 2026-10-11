import { describe, expect, it } from "vitest";
import {
  buildKnowledge,
  buttonTitle,
  FAQ_KEYWORDS,
  isPriceQuestion,
  matchLibrary,
  priceListAnswer,
  productLine,
  redactPersonal,
  violatesBrandRules,
  type KnowledgeProduct,
} from "@/lib/bot-knowledge";
import { faqItems } from "@/lib/content/faq";

const product = (over: Partial<KnowledgeProduct> = {}): KnowledgeProduct => ({
  id: "1",
  handle: "the-gentleman",
  title: "THE GENTLEMAN",
  category: "Men",
  price: 3500,
  inStock: true,
  orderable: true,
  sizeMl: 50,
  top: ["Bergamot"],
  heart: ["Lavender"],
  base: ["White musk"],
  ...over,
});

const library = faqItems.map((f) => ({ question: f.question, answer: f.answer, keywords: FAQ_KEYWORDS[f.question] || [] }));

describe("bot knowledge", () => {
  it("never quotes a price that is not set", () => {
    expect(productLine(product({ price: null }))).toContain("price not announced yet");
    expect(productLine(product())).toContain("PKR 3,500");
    expect(productLine(product({ orderable: false }))).toContain("launching soon");
  });

  it("builds knowledge with delivery facts and team answers", () => {
    const text = buildKnowledge([product()], faqItems, [{ question: "Event?", answer: "Terrace Cafe" }], {
      siteUrl: "https://x",
      phone: "1",
      email: "e",
      instagram: "i",
      shippingFee: 250,
      freeShippingThreshold: 5000,
      bankTransferAvailable: false,
      testerLine: "tester",
    });
    expect(text).toContain("PKR 250");
    expect(text).toContain("TEAM ANSWERS");
    expect(text).not.toContain("bank transfer");
  });

  it("matches common questions in English and Roman Urdu", () => {
    expect(matchLibrary("how long does it last?", library)?.question).toBe("How long do Khayal fragrances last?");
    expect(matchLibrary("lahore me delivery kitne din me hogi", library)?.question).toBe("Do you ship across Pakistan?");
    expect(matchLibrary("cod available hai?", library)?.question).toBe("Do you offer cash on delivery?");
    expect(matchLibrary("ok thanks", library)).toBeNull();
  });

  it("detects price questions and lists only real prices", () => {
    expect(isPriceQuestion("silk royale ki qeemat?")).toBe(true);
    expect(isPriceQuestion("how much for 2 bottles")).toBe(true);
    expect(isPriceQuestion("does it last")).toBe(false);
    const answer = priceListAnswer([product(), product({ title: "OUD MUSK", price: null })]);
    expect(answer).toContain("THE GENTLEMAN: PKR 3,500");
    expect(answer).toContain("OUD MUSK: price coming soon");
  });

  it("blocks replies that name other brands or use copy language", () => {
    expect(violatesBrandRules("It smells like Creed Aventus")).toBe(true);
    expect(violatesBrandRules("This is a dupe of a classic")).toBe(true);
    expect(violatesBrandRules("THE GENTLEMAN opens with bergamot.")).toBe(false);
  });

  it("redacts phone numbers and emails", () => {
    expect(redactPersonal("call me on 0300 1234567 or a@b.com")).toBe("call me on [number] or [email]");
  });

  it("keeps WhatsApp button titles within 20 characters", () => {
    expect(buttonTitle("THE GENTLEMAN")).toBe("THE GENTLEMAN");
    expect(buttonTitle("A very long fragrance name here").length).toBeLessThanOrEqual(20);
  });
});
