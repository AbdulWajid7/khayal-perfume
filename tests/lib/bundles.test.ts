import { describe, expect, it } from "vitest";
import { bestDiscount, bottleCount, duoSaving, DUOS, DUO_SAVING } from "@/lib/bundles";
import catalog from "@/lib/catalog/khayal-products.json";
import { DEFAULT_COST_ROWS, computeRow, launchPrice, regularPrice } from "@/lib/cost-calc";

describe("duo offer", () => {
  it("saves Rs 500 for every complete pair", () => {
    expect(duoSaving(0)).toBe(0);
    expect(duoSaving(1)).toBe(0);
    expect(duoSaving(2)).toBe(DUO_SAVING);
    expect(duoSaving(3)).toBe(DUO_SAVING);
    expect(duoSaving(4)).toBe(2 * DUO_SAVING);
  });

  it("counts bottles across lines", () => {
    expect(bottleCount([{ quantity: 1 }, { quantity: 2 }])).toBe(3);
  });

  it("never stacks a code with the duo saving", () => {
    expect(bestDiscount(900, 2)).toEqual({ amount: 900, source: "code" });
    expect(bestDiscount(150, 2)).toEqual({ amount: 500, source: "duo" });
    expect(bestDiscount(150, 1)).toEqual({ amount: 150, source: "code" });
    expect(bestDiscount(0, 1)).toEqual({ amount: 0, source: "none" });
  });

  it("only pairs fragrances that exist in the catalog", () => {
    const handles = new Set((catalog as { products: { handle: string }[] }).products.map((p) => p.handle));
    for (const d of DUOS) for (const h of d.handles) expect(handles.has(h)).toBe(true);
  });
});

describe("price list keeps every sale profitable", () => {
  const COURIER_AND_RETURNS = 160; // per bottle: COD fee, returned orders
  const ADS = 0.15; // share of the price spent on ads, worst case

  it("matches the catalog", () => {
    for (const p of (catalog as { products: { title: string; price: number; compareAtPrice: number }[] }).products) {
      expect(p.price).toBe(launchPrice(p.title));
      expect(p.compareAtPrice).toBe(regularPrice(p.title));
    }
  });

  it("leaves profit on one bottle from an ad", () => {
    for (const row of DEFAULT_COST_ROWS.filter((r) => r.makerPrice > 0)) {
      const cost = computeRow(row).totalCostBeforeCommission;
      const price = launchPrice(row.khayalName);
      expect(price - cost - COURIER_AND_RETURNS - price * ADS).toBeGreaterThan(400);
    }
  });

  it("leaves profit on the most expensive Classic duo from an ad, courier paid by us", () => {
    const classic = DEFAULT_COST_ROWS.filter((r) => r.makerPrice > 0 && launchPrice(r.khayalName) === 2999);
    const worst = Math.max(...classic.map((r) => computeRow(r).totalCostBeforeCommission));
    const sale = 2 * 2999 - DUO_SAVING;
    expect(sale - 2 * worst - 250 - 120 - sale * ADS).toBeGreaterThan(600);
  });
});
