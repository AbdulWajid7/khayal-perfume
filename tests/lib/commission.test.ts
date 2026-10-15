import { describe, expect, it } from "vitest";
import { commissionState, costIndex, nameKey, orderCommission, quoteCommission, summarize } from "@/lib/commission";
import { DEFAULT_COST_ROWS } from "@/lib/cost-calc";

const costs = costIndex(DEFAULT_COST_ROWS); // THE GENTLEMAN costs 1895 per bottle

describe("commission on profit", () => {
  it("matches names without case or spacing", () => {
    expect(nameKey("The Gentleman")).toBe(nameKey("THE  GENTLEMAN"));
    expect(costs.get(nameKey("the gentleman"))).toBe(1895);
  });

  it("pays a share of profit after discount, not of the selling price", () => {
    const r = orderCommission(
      { items: [{ name: "THE GENTLEMAN", quantity: 2, lineTotal: 7998 }], subtotal: 7998, discount: 1200, postDiscountSubtotal: 6798 },
      costs,
      0.2
    );
    expect(r.sales).toBe(6798);
    expect(r.cost).toBe(3790);
    expect(r.profit).toBe(3008);
    expect(r.commission).toBeCloseTo(601.6);
  });

  it("falls back to subtotal minus discount and never pays on a loss", () => {
    const r = orderCommission({ items: [{ name: "THE GENTLEMAN", quantity: 1, lineTotal: 2000 }], subtotal: 2000, discount: 500 }, costs, 0.5);
    expect(r.sales).toBe(1500);
    expect(r.commission).toBe(0);
  });

  it("holds the commission when a fragrance has no cost yet", () => {
    const r = orderCommission({ items: [{ name: "SILK ROYALE", quantity: 1, lineTotal: 3999 }], subtotal: 3999 }, costs, 0.2);
    expect(r.commission).toBeNull();
    expect(r.missingCost).toEqual(["SILK ROYALE"]);
  });

  it("counts delivered as earned, open orders as pending, cancelled as nothing", () => {
    expect(commissionState("delivered")).toBe("earned");
    expect(commissionState("dispatched")).toBe("pending");
    expect(commissionState("cancelled")).toBe("void");
    expect(commissionState("returned")).toBe("void");
    const base = { sales: 1000, cost: 0, profit: 0, missingCost: [], bottles: 1 };
    const s = summarize([
      { state: "earned", result: { ...base, commission: 100 } },
      { state: "pending", result: { ...base, commission: 50 } },
      { state: "void", result: { ...base, commission: 999 } },
      { state: "pending", result: { ...base, commission: null } },
    ]);
    expect(s).toMatchObject({ orders: 3, bottles: 3, sales: 3000, earned: 100, pending: 50, awaitingCost: 1 });
  });

  it("quotes a sale for the calculator", () => {
    expect(quoteCommission({ sellingPrice: 3999, costPerBottle: 1895, quantity: 2, discountPercent: 15, rate: 0.1 })).toEqual({
      sales: 6798.3,
      commission: Math.round((6798.3 - 3790) * 0.1 * 100) / 100,
    });
  });
});
