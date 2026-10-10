import { afterEach, describe, expect, it } from "vitest";
import { getGoogleReviewUrl, reviewRequestText } from "@/lib/review-request";

describe("review request", () => {
  afterEach(() => {
    delete process.env.GOOGLE_REVIEW_URL;
    delete process.env.GOOGLE_PLACE_ID;
  });

  it("prefers an explicit review link, then the place id", () => {
    expect(getGoogleReviewUrl()).toBeNull();
    process.env.GOOGLE_PLACE_ID = "abc123";
    expect(getGoogleReviewUrl()).toBe("https://search.google.com/local/writereview?placeid=abc123");
    process.env.GOOGLE_REVIEW_URL = "https://g.page/r/khayal/review";
    expect(getGoogleReviewUrl()).toBe("https://g.page/r/khayal/review");
  });

  it("greets the customer by first name and includes the link", () => {
    const text = reviewRequestText("Ayesha", "https://g.page/r/khayal/review");
    expect(text).toContain("Assalamualaikum Ayesha");
    expect(text).toContain("https://g.page/r/khayal/review");
  });
});
