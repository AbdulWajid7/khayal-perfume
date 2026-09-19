import { describe, it, expect } from "vitest";
import { sanitizeAttribution } from "@/lib/attribution-shared";

describe("attribution", () => {
  it("trims and caps long attribution strings", () => {
    expect(sanitizeAttribution("  facebook  ")).toBe("facebook");
    expect(sanitizeAttribution("a".repeat(300))).toHaveLength(200);
  });

  it("returns undefined for empty values", () => {
    expect(sanitizeAttribution("")).toBeUndefined();
    expect(sanitizeAttribution(undefined)).toBeUndefined();
    expect(sanitizeAttribution("   ")).toBeUndefined();
  });
});
