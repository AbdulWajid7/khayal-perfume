/**
 * Stock maths and KHAYAL's standard supply list. Pure: used by the stock actions,
 * the stock page and tests.
 */
import catalog from "@/lib/catalog/khayal-products.json";
import type { StockCategory, UsageBasis } from "@/models/StockItem";

export const CATEGORY_LABELS: Record<StockCategory, string> = {
  oil: "Fragrance oil",
  bottle: "Bottles",
  box: "Perfume boxes",
  tester: "Testers",
  packaging: "Packaging",
  shipping: "Shipping",
  other: "Other",
};

export const CATEGORY_ORDER: StockCategory[] = ["oil", "bottle", "box", "tester", "packaging", "shipping", "other"];

export const USAGE_LABELS: Record<UsageBasis, string> = {
  none: "Not used automatically",
  per_order: "Used per order",
  per_bottle: "Used per bottle sold",
};

const round = (n: number, dp = 2) => Math.round(n * 10 ** dp) / 10 ** dp;

/** New average cost after buying more at a given price (stock never below zero for the maths). */
export function weightedAverage(oldQty: number, oldAvg: number, addQty: number, unitCost: number): number {
  const q0 = Math.max(0, oldQty);
  const total = q0 + addQty;
  if (total <= 0) return round(unitCost);
  return round((q0 * oldAvg + addQty * unitCost) / total);
}

/** Purchase price: the form may give a unit price or a total; returns both. */
export function purchasePrice(quantity: number, unitPrice?: number, totalPrice?: number) {
  if (quantity <= 0) throw new Error("Quantity must be more than zero");
  if (totalPrice && totalPrice > 0) return { unitCost: round(totalPrice / quantity, 4), totalCost: round(totalPrice) };
  const unit = unitPrice && unitPrice > 0 ? unitPrice : 0;
  return { unitCost: round(unit, 4), totalCost: round(unit * quantity) };
}

export interface UsageItem {
  id: string;
  usageBasis: UsageBasis;
  usageQty: number;
}

/** Supplies an order uses when packed: per-order items once, per-bottle items for each bottle. */
export function orderUsage(items: UsageItem[], bottles: number): { id: string; quantity: number }[] {
  return items
    .map((i) => ({
      id: i.id,
      quantity:
        i.usageBasis === "per_order" ? i.usageQty : i.usageBasis === "per_bottle" ? i.usageQty * Math.max(0, bottles) : 0,
    }))
    .filter((u) => u.quantity > 0);
}

export function isLow(quantity: number, lowStockAt: number): boolean {
  return lowStockAt > 0 && quantity <= lowStockAt;
}

export interface StandardSupply {
  name: string;
  category: StockCategory;
  unit: string;
  lowStockAt: number;
  usageBasis: UsageBasis;
  usageQty: number;
  notes?: string;
}

const FRAGRANCES: string[] = (catalog as { products: { title: string }[] }).products.map((p) => p.title);

/** Everything a KHAYAL order needs, ready to fill in with quantities and prices. */
export function standardSupplies(): StandardSupply[] {
  return [
    ...FRAGRANCES.map((f) => ({
      name: `${f} oil`,
      category: "oil" as const,
      unit: "ml",
      lowStockAt: 500,
      usageBasis: "none" as const,
      usageQty: 0,
      notes: "Used when you fill bottles (50 ml each)",
    })),
    { name: "50 ml bottle, navy (THE GENTLEMAN)", category: "bottle", unit: "pcs", lowStockAt: 20, usageBasis: "none", usageQty: 0 },
    { name: "50 ml bottle, teal to rose (SILK ROYALE)", category: "bottle", unit: "pcs", lowStockAt: 20, usageBasis: "none", usageQty: 0 },
    { name: "50 ml bottle, teal to amber (OUD MUSK)", category: "bottle", unit: "pcs", lowStockAt: 20, usageBasis: "none", usageQty: 0 },
    { name: "50 ml bottle (other scents)", category: "bottle", unit: "pcs", lowStockAt: 40, usageBasis: "none", usageQty: 0 },
    { name: "Perfume box (50 ml)", category: "box", unit: "pcs", lowStockAt: 30, usageBasis: "per_bottle", usageQty: 1 },
    { name: "Tester vial 5 ml (empty)", category: "tester", unit: "pcs", lowStockAt: 50, usageBasis: "none", usageQty: 0 },
    { name: "Free tester (filled)", category: "tester", unit: "pcs", lowStockAt: 30, usageBasis: "per_order", usageQty: 1, notes: "One free tester goes in every order" },
    { name: "Tester card", category: "tester", unit: "pcs", lowStockAt: 50, usageBasis: "per_order", usageQty: 1 },
    { name: "Carry bag", category: "packaging", unit: "pcs", lowStockAt: 30, usageBasis: "per_order", usageQty: 1 },
    { name: "Tissue paper", category: "packaging", unit: "sheets", lowStockAt: 50, usageBasis: "per_order", usageQty: 1 },
    { name: "Thank-you card", category: "packaging", unit: "pcs", lowStockAt: 50, usageBasis: "per_order", usageQty: 1 },
    { name: "Seal sticker", category: "packaging", unit: "pcs", lowStockAt: 50, usageBasis: "per_order", usageQty: 1 },
    { name: "Shipping mailer box", category: "shipping", unit: "pcs", lowStockAt: 30, usageBasis: "per_order", usageQty: 1 },
    { name: "Bubble wrap", category: "shipping", unit: "m", lowStockAt: 10, usageBasis: "per_order", usageQty: 0.5 },
    { name: "Packing tape", category: "shipping", unit: "rolls", lowStockAt: 2, usageBasis: "none", usageQty: 0 },
  ];
}
