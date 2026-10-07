import { describe, it, expect } from "vitest";
import { hashCode, normalizeEmail, generateWelcomeCode } from "@/lib/welcome-offers";
import { welcomeEmailResult } from "@/lib/welcome-email-result";

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

  it("only reports email success when the provider accepts the message", () => {
    expect(welcomeEmailResult({ ok: true, providerResponse: "email-id" }, "Code sent")).toEqual({ ok: true, message: "Code sent" });
    expect(welcomeEmailResult({ ok: false, error: "Sender domain is not verified" }, "Code sent")).toEqual({
      ok: false,
      message: "We created your welcome code but couldn't send the email. Please try Resend Email in a moment.",
    });
  });
});
