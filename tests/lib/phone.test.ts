import { describe, it, expect } from "vitest";
import { isValidPakistaniMobile, normalizePhone } from "@/lib/phone";

describe("phone", () => {
  it("accepts standard Pakistani mobile formats", () => {
    expect(isValidPakistaniMobile("03201234567")).toBe(true);
    expect(isValidPakistaniMobile("+923201234567")).toBe(true);
    expect(isValidPakistaniMobile("923201234567")).toBe(true);
  });

  it("accepts formatted numbers with spaces and dashes", () => {
    expect(isValidPakistaniMobile("0320 1234567")).toBe(true);
    expect(isValidPakistaniMobile("+92-320-1234567")).toBe(true);
  });

  it("rejects invalid numbers", () => {
    expect(isValidPakistaniMobile("1234567890")).toBe(false);
    expect(isValidPakistaniMobile("+1 555 123 4567")).toBe(false);
    expect(isValidPakistaniMobile("")).toBe(false);
  });

  it("normalises to local and E.164 formats", () => {
    const result = normalizePhone("03201234567");
    expect(result.isValid).toBe(true);
    expect(result.local).toBe("03201234567");
    expect(result.e164).toBe("+923201234567");
  });

  it("normalises +92 prefix to local format", () => {
    const result = normalizePhone("+923201234567");
    expect(result.local).toBe("03201234567");
    expect(result.e164).toBe("+923201234567");
  });

  it("normalises 92 prefix to local format", () => {
    const result = normalizePhone("923201234567");
    expect(result.local).toBe("03201234567");
    expect(result.e164).toBe("+923201234567");
  });

  it("returns invalid result for bad input without throwing", () => {
    const result = normalizePhone("not-a-number");
    expect(result.isValid).toBe(false);
  });
});
