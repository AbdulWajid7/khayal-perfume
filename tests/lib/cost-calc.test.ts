import { describe, expect, it } from "vitest";
import {
  computeRow,
  computeTotals,
  DEFAULT_COST_ROWS,
  DEFAULT_SUPPLIER_TOTAL,
  sanitizeRow,
  supplierSummary,
  withMissingDefaults,
  hasCost,
} from "@/lib/cost-calc";
import { costIndex } from "@/lib/commission";

describe("cost and profit calculator", () => {
  it("matches the owner's spreadsheet values", () => {
    const rows = DEFAULT_COST_ROWS.map(computeRow);
    expect(rows).toHaveLength(12); // 11 launch scents + the old 12th sheet row
    expect(rows[0]).toMatchObject({ khayalName: "DASTAAN", unitCostPerMl: 21.5, fragranceCostPerBottle: 1075 });
    expect(rows[2].fragranceCostPerBottle).toBeCloseTo(870);
    const totals = computeTotals(rows);
    expect(totals.makerPrice).toBe(151500);
    expect(totals.fragranceCostPerBottle).toBeCloseTo(10435);
    expect(totals.totalCostBeforeCommission).toBeCloseTo(10435 + 12 * 770);
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
    // 10% of the profit (4000 - 1350 = 2650), not of the price.
    expect(r.commissionAmount).toBeCloseTo(265);
    expect(r.profitAfterCommission).toBeCloseTo(2385);
    expect(r.profitMargin).toBeCloseTo(0.59625);
  });

  it("pays no commission when a bottle sells at or below cost", () => {
    const r = computeRow({ ...DEFAULT_COST_ROWS[1], sellingPrice: 1500, commissionRate: 0.2 });
    expect(r.commissionAmount).toBe(0);
  });

  it("treats a zero maker quantity like Excel IFERROR, not Infinity", () => {
    expect(computeRow({ ...DEFAULT_COST_ROWS[0], makerQtyMl: 0 }).unitCostPerMl).toBe(0);
  });

  it("adds SILK ROYALE to an older saved sheet and treats it as cost unknown until priced", () => {
    const old = DEFAULT_COST_ROWS.filter((r) => r.khayalName !== "SILK ROYALE");
    const rows = withMissingDefaults(old);
    const silk = rows.find((r) => r.khayalName === "SILK ROYALE")!;
    expect(silk.realName).toBe("Queen of Silk");
    expect(hasCost(silk)).toBe(false);
    expect(costIndex(rows).has("SILKROYALE")).toBe(false);
    expect(costIndex(rows).has("THEGENTLEMAN")).toBe(true);
  });

  it("uses the website names, also for sheets saved with the old names", () => {
    expect(sanitizeRow({ khayalName: "legend noir" }).khayalName).toBe("DASTAAN");
    expect(sanitizeRow({ khayalName: "NIGHTFALL" }).khayalName).toBe("DARK ICE");
    expect(sanitizeRow({ khayalName: "THE GENTLEMAN" }).khayalName).toBe("THE GENTLEMAN");
    const names = DEFAULT_COST_ROWS.map((r) => r.khayalName);
    for (const n of ["DASTAAN", "SAMANDAR", "BAHAAR", "JAZBA", "DARK ICE", "THE GENTLEMAN", "CHERIE", "VICTOR", "OUD MUSK", "CRYSTAL NOOR"]) {
      expect(names).toContain(n);
    }
  });

  it("cleans untrusted rows from the form", () => {
    const r = sanitizeRow({ realName: "  A ", khayalName: "B", makerPrice: "1,500", commissionRate: 10, bottleMl: -5 });
    expect(r).toMatchObject({ realName: "A", makerPrice: 1500, commissionRate: 0.1, bottleMl: 0 });
  });
});
