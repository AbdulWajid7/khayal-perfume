import { describe, expect, it } from "vitest";
import { describeGeminiError } from "@/lib/gemini";

describe("describeGeminiError", () => {
  it("explains common Gemini errors in plain words", () => {
    expect(describeGeminiError(400, JSON.stringify({ error: { message: "API key not valid. Please pass a valid API key." } }))).toContain(
      "GEMINI_API_KEY in Vercel is not valid"
    );
    expect(describeGeminiError(429, JSON.stringify({ error: { message: "Quota exceeded" } }))).toContain("quota");
    expect(describeGeminiError(404, "not json")).toContain("model name is not available");
  });
});
