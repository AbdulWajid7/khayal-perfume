import { describe, it, expect } from "vitest";
import {
  calculateShipping,
  qualifiesForFreeShipping,
  isKarachi,
  normalizeCity,
  getDeliveryMethod,
  getExpectedDeliveryText,
  STANDARD_SHIPPING,
} from "@/lib/shipping";

describe("shipping", () => {
  it("charges PKR 250 for subtotal below 5000", () => {
    expect(calculateShipping(4999)).toBe(STANDARD_SHIPPING);
    expect(calculateShipping(1000)).toBe(STANDARD_SHIPPING);
  });

  it("charges no shipping for subtotal of exactly 5000", () => {
    expect(calculateShipping(5000)).toBe(0);
  });

  it("charges no shipping for subtotal above 5000", () => {
    expect(calculateShipping(5001)).toBe(0);
    expect(calculateShipping(15000)).toBe(0);
  });

  it("ignores manipulated client shipping values when server recalculates", () => {
    // The server always recalculates from subtotal using the default standard rate.
    expect(calculateShipping(4999)).toBe(STANDARD_SHIPPING);
    expect(calculateShipping(15000, 500)).toBe(0);
  });

  it("identifies Karachi with normalised casing and punctuation", () => {
    expect(isKarachi("Karachi")).toBe(true);
    expect(isKarachi("karachi")).toBe(true);
    expect(isKarachi("KARACHI")).toBe(true);
    expect(isKarachi("  Karachi  ")).toBe(true);
    expect(isKarachi("Clifton, Karachi")).toBe(true);
    expect(isKarachi("Lahore")).toBe(false);
  });

  it("returns self delivery for Karachi", () => {
    expect(getDeliveryMethod("Karachi")).toBe("self_delivery");
  });

  it("returns nationwide courier for other cities", () => {
    expect(getDeliveryMethod("Lahore")).toBe("nationwide_courier");
    expect(getDeliveryMethod("Islamabad")).toBe("nationwide_courier");
  });

  it("returns expected delivery text by city", () => {
    expect(getExpectedDeliveryText("Karachi")).toContain("24 hours");
    expect(getExpectedDeliveryText("Lahore")).toContain("3–4 working days");
  });

  it("normalises city strings", () => {
    expect(normalizeCity("Karachi")).toBe("karachi");
    expect(normalizeCity("KARACHI-CLIFTON")).toBe("karachi clifton");
  });
});
