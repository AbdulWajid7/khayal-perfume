/**
 * Fragrance cost and profit maths, matching the owner's
 * "KHAYAL Fragrance Cost Profit Calculator" spreadsheet, except that commission is a
 * share of profit (selling price minus cost), not of the selling price.
 * Pure functions: used by the admin Cost & Profit page and its tests.
 */

export interface CostRow {
  realName: string;
  khayalName: string;
  /** Quantity bought from the maker, in mL. */
  makerQtyMl: number;
  /** Price paid to the maker for that quantity, PKR. */
  makerPrice: number;
  bottleMl: number;
  boxPrice: number;
  packagingPrice: number;
  otherCost: number;
  sellingPrice: number;
  /** 0.1 = 10%. */
  commissionRate: number;
}

export interface CostRowResult extends CostRow {
  unitCostPerMl: number;
  fragranceCostPerBottle: number;
  totalCostBeforeCommission: number;
  commissionAmount: number;
  profitAfterCommission: number;
  profitMargin: number;
}

export interface CostTotals {
  makerPrice: number;
  fragranceCostPerBottle: number;
  boxPrice: number;
  packagingPrice: number;
  otherCost: number;
  totalCostBeforeCommission: number;
  sellingPrice: number;
  commissionAmount: number;
  profitAfterCommission: number;
  profitMargin: number;
}

const num = (v: unknown) => {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? "").replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
};

/** Same as Excel IFERROR(a/b, 0). */
const safeDiv = (a: number, b: number) => (b ? a / b : 0);

export function computeRow(row: CostRow): CostRowResult {
  const unitCostPerMl = safeDiv(num(row.makerPrice), num(row.makerQtyMl)); // E = D / C
  const fragranceCostPerBottle = unitCostPerMl * num(row.bottleMl); // G = E * F
  const totalCostBeforeCommission =
    fragranceCostPerBottle + num(row.boxPrice) + num(row.packagingPrice) + num(row.otherCost); // K = G+H+I+J
  // Commission is a share of the profit, not of the selling price (owner's rule, 16 Oct 2026).
  const commissionAmount = Math.max(0, num(row.sellingPrice) - totalCostBeforeCommission) * num(row.commissionRate);
  const profitAfterCommission = num(row.sellingPrice) - totalCostBeforeCommission - commissionAmount; // O = L-K-N
  const profitMargin = safeDiv(profitAfterCommission, num(row.sellingPrice)); // P = IFERROR(O/L,0)
  return {
    ...row,
    unitCostPerMl,
    fragranceCostPerBottle,
    totalCostBeforeCommission,
    commissionAmount,
    profitAfterCommission,
    profitMargin,
  };
}

export function computeTotals(rows: CostRowResult[]): CostTotals {
  const sum = (k: keyof CostRowResult) => rows.reduce((s, r) => s + num(r[k]), 0);
  const profitAfterCommission = sum("profitAfterCommission");
  const sellingPrice = sum("sellingPrice");
  return {
    makerPrice: sum("makerPrice"),
    fragranceCostPerBottle: sum("fragranceCostPerBottle"),
    boxPrice: sum("boxPrice"),
    packagingPrice: sum("packagingPrice"),
    otherCost: sum("otherCost"),
    totalCostBeforeCommission: sum("totalCostBeforeCommission"),
    sellingPrice,
    commissionAmount: sum("commissionAmount"),
    profitAfterCommission,
    profitMargin: safeDiv(profitAfterCommission, sellingPrice),
  };
}

/** Supplier quote check: itemised total (sum of maker prices) against the supplier's stated total. */
export function supplierSummary(rows: CostRow[], statedTotal: number) {
  const itemized = rows.reduce((s, r) => s + num(r.makerPrice), 0);
  return { itemized, stated: num(statedTotal), difference: itemized - num(statedTotal) };
}

/**
 * Sheet names the owner replaced with the final launch names (16 Oct 2026), so the
 * cost sheet matches the website, Instagram and orders. Applied whenever a sheet is
 * read, so a sheet saved with the old names is corrected automatically.
 */
export const SHEET_RENAMES: Record<string, string> = {
  "LEGEND NOIR": "DASTAAN",
  "BLEU NOIR": "SAMANDAR",
  BLOOM: "BAHAAR",
  JUNOON: "JAZBA",
  NIGHTFALL: "DARK ICE",
};

export function websiteName(name: string): string {
  const key = name.trim().toUpperCase();
  return SHEET_RENAMES[key] ?? name.trim();
}

/** Cleans untrusted input (form JSON) into a valid row. */
export function sanitizeRow(input: Partial<Record<keyof CostRow, unknown>>): CostRow {
  const text = (v: unknown) => String(v ?? "").trim().slice(0, 80);
  const rate = num(input.commissionRate);
  return {
    realName: text(input.realName),
    khayalName: websiteName(text(input.khayalName)),
    makerQtyMl: Math.max(0, num(input.makerQtyMl)),
    makerPrice: Math.max(0, num(input.makerPrice)),
    bottleMl: Math.max(0, num(input.bottleMl)),
    boxPrice: Math.max(0, num(input.boxPrice)),
    packagingPrice: Math.max(0, num(input.packagingPrice)),
    otherCost: Math.max(0, num(input.otherCost)),
    sellingPrice: Math.max(0, num(input.sellingPrice)),
    // Accept 10 or 0.1 for 10%.
    commissionRate: Math.min(1, Math.max(0, rate > 1 ? rate / 100 : rate)),
  };
}

/**
 * Launch price list (13 Oct 2026), set against the Pakistan market: THE NOTE. extrait from
 * Rs 1,799, Sesky Rs 2,000-5,800 with a free tester, J. 50 ml EDP Rs 2,900-3,500.
 * Signature scents carry the photos, films and the highest oil cost.
 */
export const SIGNATURE_PRICE = 3999;
export const STANDARD_PRICE = 3499;
export const SIGNATURE_NAMES = ["THE GENTLEMAN", "SILK ROYALE", "OUD MUSK"];

export function launchPrice(khayalName: string): number {
  return SIGNATURE_NAMES.includes(khayalName.trim().toUpperCase()) ? SIGNATURE_PRICE : STANDARD_PRICE;
}

/** Per-bottle costs the owner gave on 13 Oct 2026 (same for every fragrance). */
export const DEFAULT_BOX_PRICE = 400;
export const DEFAULT_PACKAGING_PRICE = 150;
export const DEFAULT_OTHER_COST = 220;

/** The owner's spreadsheet as uploaded on 13 Oct 2026, with the costs and prices above and the final names. */
export const DEFAULT_SUPPLIER_TOTAL = 151500;

const r = (realName: string, khayalName: string, makerQtyMl: number, makerPrice: number): CostRow => ({
  realName,
  khayalName,
  makerQtyMl,
  makerPrice,
  bottleMl: 50,
  boxPrice: DEFAULT_BOX_PRICE,
  packagingPrice: DEFAULT_PACKAGING_PRICE,
  otherCost: DEFAULT_OTHER_COST,
  sellingPrice: launchPrice(khayalName),
  commissionRate: 0,
});

export const DEFAULT_COST_ROWS: CostRow[] = [
  r("Jack", "DASTAAN", 1000, 21500),
  r("Office for Men", "THE GENTLEMAN", 1000, 22500),
  r("Charlie", "CHERIE", 500, 8700),
  r("Gucci Flora", "BAHAAR", 500, 9300),
  r("Azzaro Wanted", "VICTOR", 1000, 17500),
  r("Dunhill Desire", "JAZBA", 1000, 15800),
  r("Hugo Boss Dark Blue", "DARK ICE", 500, 9200),
  r("White Oud", "OUD MUSK", 1000, 17000),
  r("Dior Sauvage", "SAUVAGE DIOR", 500, 10000),
  r("Bleu de Chanel", "SAMANDAR", 500, 10000),
  r("Versace Bright Crystal", "CRYSTAL NOOR", 500, 10000),
  // Original given 16 Oct 2026; maker quantity and price still to be entered by the owner.
  r("Queen of Silk", "SILK ROYALE", 0, 0),
];

/** Adds default rows for fragrances a saved sheet does not have yet (e.g. SILK ROYALE). */
export function withMissingDefaults(rows: CostRow[]): CostRow[] {
  const have = new Set(rows.map((r) => r.khayalName.trim().toUpperCase()));
  return [...rows, ...DEFAULT_COST_ROWS.filter((d) => !have.has(d.khayalName.toUpperCase()))];
}

/** A row only has a real cost once the maker quantity and price are filled in. */
export function hasCost(row: CostRow): boolean {
  return num(row.makerQtyMl) > 0 && num(row.makerPrice) > 0;
}
