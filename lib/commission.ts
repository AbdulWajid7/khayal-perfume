/**
 * Commission on orders: always a share of PROFIT (what the customer paid for the
 * bottles, after any discount, minus what the bottles cost us), never of the selling
 * price. Shipping is not part of profit. Pure functions, used by the admin
 * commission page, the promoter dashboards and their tests.
 */
import { computeRow, type CostRow } from "@/lib/cost-calc";

/** Fragrance names are compared without case, spaces or punctuation. */
export function nameKey(name: string): string {
  return name.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

/** KHAYAL name -> total cost per bottle, from the owner's cost sheet. */
export function costIndex(rows: CostRow[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const row of rows) {
    const key = nameKey(row.khayalName);
    if (key) map.set(key, computeRow(row).totalCostBeforeCommission);
  }
  return map;
}

export type CommissionState = "earned" | "pending" | "void";

/** Delivered orders earn; orders still on their way are pending; cancelled or returned earn nothing. */
export function commissionState(orderStatus: string): CommissionState {
  if (orderStatus === "delivered") return "earned";
  if (["cancelled", "returned", "return_requested", "draft"].includes(orderStatus)) return "void";
  return "pending";
}

export interface CommissionOrderInput {
  items: { name: string; quantity: number; lineTotal: number }[];
  subtotal: number;
  discount?: number;
  postDiscountSubtotal?: number;
}

export interface OrderCommission {
  /** Bottle sales after discount (no shipping). */
  sales: number;
  cost: number;
  profit: number;
  /** Null when a fragrance in the order has no cost in the cost sheet yet. */
  commission: number | null;
  missingCost: string[];
  bottles: number;
}

const round = (n: number) => Math.round(n * 100) / 100;

export function orderCommission(order: CommissionOrderInput, costs: Map<string, number>, rate: number): OrderCommission {
  const itemsTotal = order.items.reduce((s, i) => s + (Number(i.lineTotal) || 0), 0);
  const sales =
    typeof order.postDiscountSubtotal === "number" && order.postDiscountSubtotal > 0
      ? order.postDiscountSubtotal
      : Math.max(0, itemsTotal - (Number(order.discount) || 0));
  let cost = 0;
  let bottles = 0;
  const missingCost: string[] = [];
  for (const item of order.items) {
    const qty = Number(item.quantity) || 0;
    bottles += qty;
    const unit = costs.get(nameKey(item.name));
    if (unit === undefined) missingCost.push(item.name);
    else cost += unit * qty;
  }
  const profit = sales - cost;
  const safeRate = Math.min(1, Math.max(0, rate));
  return {
    sales: round(sales),
    cost: round(cost),
    profit: round(profit),
    commission: missingCost.length ? null : round(Math.max(0, profit) * safeRate),
    missingCost,
    bottles,
  };
}

/** One-off calculation for the commission calculator. */
export function quoteCommission(input: {
  sellingPrice: number;
  costPerBottle: number;
  quantity: number;
  discountPercent: number;
  rate: number;
}) {
  const qty = Math.max(1, Math.floor(input.quantity) || 1);
  const discount = Math.min(100, Math.max(0, input.discountPercent)) / 100;
  const sales = input.sellingPrice * qty * (1 - discount);
  const profit = sales - input.costPerBottle * qty;
  const rate = Math.min(1, Math.max(0, input.rate));
  return { sales: round(sales), commission: round(Math.max(0, profit) * rate) };
}

export interface CommissionSummary {
  orders: number;
  bottles: number;
  sales: number;
  earned: number;
  pending: number;
  /** Orders whose commission waits for a cost to be entered. */
  awaitingCost: number;
}

export function summarize(
  rows: { state: CommissionState; result: OrderCommission }[]
): CommissionSummary {
  const s: CommissionSummary = { orders: 0, bottles: 0, sales: 0, earned: 0, pending: 0, awaitingCost: 0 };
  for (const { state, result } of rows) {
    if (state === "void") continue;
    s.orders += 1;
    s.bottles += result.bottles;
    s.sales += result.sales;
    if (result.commission === null) s.awaitingCost += 1;
    else if (state === "earned") s.earned += result.commission;
    else s.pending += result.commission;
  }
  s.sales = round(s.sales);
  s.earned = round(s.earned);
  s.pending = round(s.pending);
  return s;
}
