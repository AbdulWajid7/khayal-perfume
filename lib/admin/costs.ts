"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";
import { dbConnect } from "@/lib/mongoose";
import { CostSheet } from "@/models/CostSheet";
import {
  DEFAULT_COST_ROWS,
  DEFAULT_SUPPLIER_TOTAL,
  sanitizeRow,
  type CostRow,
} from "@/lib/cost-calc";

/** Costs are the owner's numbers: full admins only, not sub-admins/editors. */
async function guard() {
  const session = await requireAuth(["admin"]);
  if (!session) throw new Error("Only the owner account can see costs");
  return session;
}

export interface CostSheetData {
  supplierStatedTotal: number;
  rows: CostRow[];
  updatedAt: string | null;
}

export async function getCostSheet(): Promise<CostSheetData> {
  await guard();
  await dbConnect();
  const doc = await CostSheet.findOne().lean();
  if (!doc) {
    return { supplierStatedTotal: DEFAULT_SUPPLIER_TOTAL, rows: DEFAULT_COST_ROWS, updatedAt: null };
  }
  return {
    supplierStatedTotal: doc.supplierStatedTotal,
    rows: doc.rows.map((r) => sanitizeRow(r)),
    updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : null,
  };
}

export async function saveCostSheet(
  _prev: { ok: boolean; message: string } | null,
  formData: FormData
): Promise<{ ok: boolean; message: string }> {
  try {
    const session = await guard();
    let parsed: unknown;
    try {
      parsed = JSON.parse(formData.get("rows")?.toString() || "[]");
    } catch {
      return { ok: false, message: "Could not read the table. Refresh and try again." };
    }
    if (!Array.isArray(parsed) || parsed.length > 200) {
      return { ok: false, message: "The table is not valid." };
    }
    const rows = parsed.map((r) => sanitizeRow(r as Record<string, unknown>));
    const supplierStatedTotal = Math.max(0, Number(formData.get("supplierStatedTotal")) || 0);
    await dbConnect();
    await CostSheet.updateOne(
      {},
      { $set: { rows, supplierStatedTotal, updatedBy: session.email } },
      { upsert: true }
    );
    revalidatePath("/admin/costs");
    return { ok: true, message: `Saved ${rows.length} fragrances.` };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Could not save" };
  }
}
