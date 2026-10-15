import { describe, expect, it } from "vitest";
import { isLow, orderUsage, purchasePrice, standardSupplies, weightedAverage } from "@/lib/stock";

describe("stock maths", () => {
  it("averages the price paid across purchases", () => {
    expect(weightedAverage(100, 20, 100, 30)).toBe(25);
    expect(weightedAverage(0, 0, 50, 12)).toBe(12);
    expect(weightedAverage(-5, 10, 10, 40)).toBe(40); // negative stock does not skew the average
  });

  it("reads a unit price or a total", () => {
    expect(purchasePrice(10, 150)).toEqual({ unitCost: 150, totalCost: 1500 });
    expect(purchasePrice(1000, undefined, 22500)).toEqual({ unitCost: 22.5, totalCost: 22500 });
    expect(() => purchasePrice(0, 10)).toThrow();
  });

  it("uses per-order items once and per-bottle items for each bottle", () => {
    const usage = orderUsage(
      [
        { id: "box", usageBasis: "per_bottle", usageQty: 1 },
        { id: "bag", usageBasis: "per_order", usageQty: 1 },
        { id: "wrap", usageBasis: "per_order", usageQty: 0.5 },
        { id: "tape", usageBasis: "none", usageQty: 1 },
      ],
      3
    );
    expect(usage).toEqual([
      { id: "box", quantity: 3 },
      { id: "bag", quantity: 1 },
      { id: "wrap", quantity: 0.5 },
    ]);
  });

  it("flags low stock only when an alert level is set", () => {
    expect(isLow(5, 10)).toBe(true);
    expect(isLow(10, 10)).toBe(true);
    expect(isLow(11, 10)).toBe(false);
    expect(isLow(0, 0)).toBe(false);
  });

  it("has an oil line for all eleven fragrances plus boxes, testers and packing", () => {
    const list = standardSupplies();
    expect(list.filter((s) => s.category === "oil")).toHaveLength(11);
    const names = list.map((s) => s.name);
    expect(names).toEqual(expect.arrayContaining(["Perfume box (50 ml)", "Free tester (filled)", "Carry bag", "Shipping mailer box"]));
    expect(list.find((s) => s.name === "Perfume box (50 ml)")).toMatchObject({ usageBasis: "per_bottle", usageQty: 1 });
  });
});
