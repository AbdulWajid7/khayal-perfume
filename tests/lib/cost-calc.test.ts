import { describe, expect, it } from "vitest";
import {
  computeRow,
  computeTotals,
  DEFAULT_COST_ROWS,
  DEFAULT_SUPPLIER_TOTAL,
  sanitizeRow,
  supplierSummary,
} from "@/lib/cost-calc";

describe("cost and profit calculator", () => {
  it("matches the owner's spreadsheet values", () => {
    const rows = DEFAULT_COST_ROWS.map(computeRow);
    expect(rows).toHaveLength(11);
    expect(rows[0]).toMatchObject({ khayalName: "LEGEND NOIR", unitCostPerMl: 21.5, fragranceCostPerBottle: 1075 });
    expect(rows[2].fragranceCostPerBottle).toBeCloseTo(870);
    const totals = computeTotals(rows);
    expect(totals.makerPrice).toBe(151500);
    expect(totals.fragranceCostPerBottle).toBeCloseTo(10435);
    expect(totals.totalCostBeforeCommission).toBeCloseTo(10435 + 11 * 770);
    expect(supplierSummary(DEFAULT_COST_ROWS, DEFAULT_SUPPLIER_TOTAL)).toEqual({ itemized: 151500, stated: 151500, difference: 0 });
  });

  it("prices signatures at Rs 3,999 and the rest at Rs 3,499, all profitable", () => {
    const rows = DEFAULT_COST_ROWS.map(computeRow);
    const gentleman = rows.find((r) => r.khayalName === "THE GENTLEMAN")!;
    expect(gentleman.sellingPrice).toBe(3999);
    expect(gentleman.totalCostBeforeCommission).toBe(1895);
    expect(gentleman.profitAfterCommission).toBe(2104);
    expect(rows.find((r) => r.khayalName === "VICTOR")!.profitAfterCommission).toBe(3499 - 1645);
    for (const r of rows) expect(r.profitMargin).toBeGreaterThan(0.45);
  });

  it("works out profit with a price, packaging and commission", () => {
    const r = computeRow({ ...DEFAULT_COST_ROWS[1], boxPrice: 150, packagingPrice: 50, otherCost: 25, sellingPrice: 4000, commissionRate: 0.1 });
    expect(r.totalCostBeforeCommission).toBe(1350); // 1125 + 150 + 50 + 25
    expect(r.commissionAmount).toBe(400);
    expect(r.profitAfterCommission).toBe(2250);
    expect(r.profitMargin).toBeCloseTo(0.5625);
  });

  it("treats a zero maker quantity like Excel IFERROR, not Infinity", () => {
    expect(computeRow({ ...DEFAULT_COST_ROWS[0], makerQtyMl: 0 }).unitCostPerMl).toBe(0);
  });

  it("cleans untrusted rows from the form", () => {
    const r = sanitizeRow({ realName: "  A ", khayalName: "B", makerPrice: "1,500", commissionRate: 10, bottleMl: -5 });
    expect(r).toMatchObject({ realName: "A", makerPrice: 1500, commissionRate: 0.1, bottleMl: 0 });
  });
});
