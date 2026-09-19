import { describe, it, expect } from "vitest";
import { hashCode, normalizeEmail, generateWelcomeCode } from "@/lib/welcome-offers";

describe("welcome offer utilities", () => {
  it("normalises emails consistently", () => {
    expect(normalizeEmail("  Test.User@Example.COM  ")).toBe("test.user@example.com");
    expect(normalizeEmail("LOWER@email.com")).toBe("lower@email.com");
  });

  it("generates codes in the expected format", () => {
    const code = generateWelcomeCode();
    expect(code).toMatch(/^KHAYAL-[A-Z0-9]{4}-[A-Z0-9]{4}$/);
  });

  it("generates different codes across calls", () => {
    const codes = new Set(Array.from({ length: 20 }, generateWelcomeCode));
    expect(codes.size).toBe(20);
  });

  it("hashes codes deterministically", () => {
    const code = generateWelcomeCode();
    expect(hashCode(code)).toBe(hashCode(code));
    expect(hashCode("KHAYAL-AAAA-AAAA")).not.toBe(hashCode("KHAYAL-BBBB-BBBB"));
  });

  it("hashes are case-insensitive for normalised codes", () => {
    const code = generateWelcomeCode();
    expect(hashCode(code)).toBe(hashCode(code.toLowerCase()));
  });
});
