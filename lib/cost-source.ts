/**
 * Reads the owner's cost sheet for server-side maths (commission). Not a server
 * action: never import this from client code, and never return its rows to a
 * sub-admin or promoter (they hold supplier prices and reference names).
 */
import { dbConnect } from "@/lib/mongoose";
import { CostSheet } from "@/models/CostSheet";
import { DEFAULT_COST_ROWS, sanitizeRow, withMissingDefaults, type CostRow } from "@/lib/cost-calc";

export async function loadCostRows(): Promise<CostRow[]> {
  await dbConnect();
  const doc = await CostSheet.findOne().lean();
  return doc ? withMissingDefaults(doc.rows.map((r) => sanitizeRow(r))) : DEFAULT_COST_ROWS;
}
