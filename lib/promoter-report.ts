/**
 * Builds a promoter's commission report from live orders and the cost sheet.
 * Server-only module (not a server action). Callers decide what each viewer may see:
 * the partner portal gets `portalOrders` (no customer names, phones or addresses).
 */
import { dbConnect } from "@/lib/mongoose";
import { Order } from "@/models/Order";
import type { IPromoter } from "@/models/Promoter";
import { loadCostRows } from "@/lib/cost-source";
import {
  commissionState,
  costIndex,
  orderCommission,
  summarize,
  type CommissionState,
  type CommissionSummary,
} from "@/lib/commission";

export interface ReportOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  state: CommissionState;
  code: string | null;
  how: "code" | "tagged" | "link";
  city: string;
  customerName: string;
  items: { name: string; quantity: number }[];
  sales: number;
  total: number;
  commission: number | null;
  missingCost: string[];
}

export interface PromoterReport {
  summary: CommissionSummary;
  paid: number;
  /** Earned on delivered orders minus what has been paid out. */
  balance: number;
  orders: ReportOrder[];
}

const upper = (s: string) => s.toUpperCase().trim();

export async function promoterReport(promoter: Pick<IPromoter, "codes" | "taggedOrders" | "commissionRate" | "payouts">): Promise<PromoterReport> {
  await dbConnect();
  const codes = (promoter.codes || []).map(upper).filter(Boolean);
  const tagged = (promoter.taggedOrders || []).map(upper).filter(Boolean);
  const or: Record<string, unknown>[] = [];
  if (codes.length) {
    or.push({ discountCode: { $in: codes } });
    or.push({ "attribution.partnerCode": { $in: [...codes, ...codes.map((c) => c.toLowerCase())] } });
  }
  if (tagged.length) or.push({ orderNumber: { $in: tagged } });

  const [docs, costRows] = await Promise.all([
    or.length
      ? Order.find({ $or: or })
          .select("orderNumber createdAt orderStatus discountCode attribution customer items subtotal discount postDiscountSubtotal total")
          .sort({ createdAt: -1 })
          .limit(2000)
          .lean()
      : Promise.resolve([]),
    loadCostRows(),
  ]);
  const costs = costIndex(costRows);

  const orders: ReportOrder[] = docs.map((o) => {
    const result = orderCommission(
      { items: o.items, subtotal: o.subtotal, discount: o.discount, postDiscountSubtotal: o.postDiscountSubtotal },
      costs,
      promoter.commissionRate
    );
    const code = o.discountCode && codes.includes(upper(o.discountCode)) ? upper(o.discountCode) : null;
    const how: ReportOrder["how"] = code ? "code" : tagged.includes(upper(o.orderNumber)) ? "tagged" : "link";
    return {
      id: String(o._id),
      orderNumber: o.orderNumber,
      createdAt: new Date(o.createdAt).toISOString(),
      status: o.orderStatus,
      state: commissionState(o.orderStatus),
      code,
      how,
      city: o.customer?.address?.city || "",
      customerName: o.customer?.name || "",
      items: o.items.map((i) => ({ name: i.name, quantity: i.quantity })),
      sales: result.sales,
      total: o.total,
      commission: result.commission,
      missingCost: result.missingCost,
    };
  });

  const summary = summarize(
    orders.map((o) => ({
      state: o.state,
      result: { sales: o.sales, cost: 0, profit: 0, commission: o.commission, missingCost: o.missingCost, bottles: o.items.reduce((s, i) => s + i.quantity, 0) },
    }))
  );
  const paid = Math.round((promoter.payouts || []).reduce((s, p) => s + (Number(p.amount) || 0), 0) * 100) / 100;
  return { summary, paid, balance: Math.round((summary.earned - paid) * 100) / 100, orders };
}

/** What a partner may see about an order: no customer name, phone or address beyond the city. */
export function portalOrders(orders: ReportOrder[]) {
  return orders.map(({ orderNumber, createdAt, status, state, code, city, items, sales, commission, missingCost }) => ({
    orderNumber,
    createdAt,
    status,
    state,
    code,
    city,
    items,
    sales,
    commission,
    awaitingCost: missingCost.length > 0,
  }));
}
