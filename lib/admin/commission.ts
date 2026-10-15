"use server";

import { requireSection } from "@/lib/admin/access";
import { loadCostRows } from "@/lib/cost-source";
import { computeRow } from "@/lib/cost-calc";
import { quoteCommission } from "@/lib/commission";

export interface CommissionRow {
  index: number;
  khayalName: string;
  sellingPrice: number;
  ratePercent: number;
  commissionPerBottle: number;
  /** Owner only. */
  cost?: number;
  profit?: number;
}

/**
 * Price and commission per fragrance. Sub-admins get the KHAYAL name, selling price
 * and commission only; the owner also sees cost and profit. Reference (real) names
 * are never returned.
 */
export async function getCommissionTable(): Promise<{ rows: CommissionRow[]; isOwner: boolean }> {
  const user = await requireSection("commission");
  if (!user) throw new Error("You do not have access to this section");
  const isOwner = user.role === "admin";
  const rows = (await loadCostRows()).map((row, index) => {
    const r = computeRow(row);
    const out: CommissionRow = {
      index,
      khayalName: r.khayalName,
      sellingPrice: r.sellingPrice,
      ratePercent: Math.round(r.commissionRate * 10000) / 100,
      commissionPerBottle: Math.round(r.commissionAmount * 100) / 100,
    };
    if (isOwner) {
      out.cost = Math.round(r.totalCostBeforeCommission * 100) / 100;
      out.profit = Math.round((r.sellingPrice - r.totalCostBeforeCommission) * 100) / 100;
    }
    return out;
  });
  return { rows, isOwner };
}

export type QuoteState = { ok: boolean; message: string; sales?: number; commission?: number } | null;

/** Commission for a sale: worked out on the server so the cost never reaches the browser. */
export async function quoteSale(_prev: QuoteState, formData: FormData): Promise<QuoteState> {
  const user = await requireSection("commission");
  if (!user) return { ok: false, message: "You do not have access to this section" };
  const rows = await loadCostRows();
  const row = rows[Number(formData.get("index"))];
  if (!row) return { ok: false, message: "Choose a fragrance" };
  const r = computeRow(row);
  // Sub-admins use the rate the owner set for that fragrance; only the owner can try other rates.
  const ratePercent = user.role === "admin" ? Number(formData.get("rate")) : NaN;
  const result = quoteCommission({
    sellingPrice: r.sellingPrice,
    costPerBottle: r.totalCostBeforeCommission,
    quantity: Number(formData.get("quantity")) || 1,
    discountPercent: Number(formData.get("discount")) || 0,
    rate: (Number.isFinite(ratePercent) ? ratePercent : r.commissionRate * 100) / 100,
  });
  return { ok: true, message: "", ...result };
}
