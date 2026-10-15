/**
 * Pulls every money movement together for the Accounts pages: sales, expenses, stock
 * purchases, promoter payouts and owner investment. Server-only module (not a
 * server action); the owner-only guard lives in lib/admin/accounts.ts.
 */
import { dbConnect } from "@/lib/mongoose";
import { Order } from "@/models/Order";
import { Expense } from "@/models/Expense";
import { CapitalEntry } from "@/models/CapitalEntry";
import { StockMovement } from "@/models/StockMovement";
import { Promoter } from "@/models/Promoter";
import { loadCostRows } from "@/lib/cost-source";
import { costIndex, nameKey } from "@/lib/commission";
import {
  accountBalances,
  cashTotals,
  groupTotals,
  inPeriod,
  lastMonths,
  monthKey,
  periodMonths,
  profitAndLoss,
  runningBalance,
  type CashTxn,
  type PeriodKey,
} from "@/lib/accounts";

const OPEN_STATUSES = ["pending_confirmation", "payment_review", "confirmed", "processing", "packed", "dispatched"];
const iso = (d: Date | string | undefined | null) => (d ? new Date(d).toISOString() : new Date().toISOString());

export interface Receivable {
  id: string;
  orderNumber: string;
  customer: string;
  city: string;
  total: number;
  method: string;
  status: string;
  date: string;
  stage: "delivered_unpaid" | "in_transit" | "transfer_to_verify";
}

export async function buildAccounts(period: PeriodKey, now = new Date()) {
  await dbConnect();
  const [orders, expenses, capital, purchases, promoters, costRows] = await Promise.all([
    Order.find({ orderStatus: { $ne: "draft" } })
      .select("orderNumber orderStatus paymentStatus paymentMethod paymentReceivedAt paymentAccount paymentVerification deliveryTime dispatchTime createdAt updatedAt total items customer discount shipping")
      .lean(),
    Expense.find().sort({ date: -1 }).lean(),
    CapitalEntry.find().sort({ date: -1 }).lean(),
    StockMovement.find({ type: "purchase" }).select("date itemName category totalCost paidFrom supplier").lean(),
    Promoter.find().select("name payouts").lean(),
    loadCostRows(),
  ]);
  const months = periodMonths(period, now);
  const chartMonths = lastMonths(12, now);
  const costs = costIndex(costRows);

  // ---- Revenue and cost of goods: delivered orders, by delivery month ----
  const delivered = orders.filter((o) => o.orderStatus === "delivered");
  const saleRows = delivered.map((o) => {
    let cogs = 0;
    let missing = 0;
    for (const i of o.items) {
      const c = costs.get(nameKey(i.name));
      if (c === undefined) missing += i.quantity;
      else cogs += c * i.quantity;
    }
    return { o, date: iso(o.deliveryTime || o.updatedAt), revenue: o.total, cogs, missing };
  });

  // ---- Cash transactions ----
  const txns: CashTxn[] = [];
  for (const o of orders) {
    const received = o.paymentReceivedAt || (o.paymentStatus === "paid" ? o.paymentVerification?.verifiedAt || o.deliveryTime || o.updatedAt : null);
    if (!received || ["cancelled", "returned"].includes(o.orderStatus)) continue;
    txns.push({
      date: iso(received),
      direction: "in",
      kind: "sale",
      amount: o.total,
      account: o.paymentAccount || (o.paymentMethod === "bank_transfer" ? "bank" : "cash"),
      label: `Order ${o.orderNumber}`,
      category: "Sales",
      ref: o.orderNumber,
    });
  }
  for (const e of expenses) {
    if (e.status !== "paid") continue;
    txns.push({ date: iso(e.paidAt || e.date), direction: "out", kind: "expense", amount: e.amount, account: e.account || "cash", label: e.description, category: e.category });
  }
  for (const p of purchases) {
    if (!p.totalCost) continue;
    txns.push({ date: iso(p.date), direction: "out", kind: "stock", amount: p.totalCost, account: p.paidFrom || "cash", label: `${p.itemName}${p.supplier ? ` · ${p.supplier}` : ""}`, category: "Stock & supplies" });
  }
  for (const pr of promoters) {
    for (const pay of pr.payouts || []) {
      txns.push({ date: iso(pay.paidAt), direction: "out", kind: "commission", amount: pay.amount, account: pay.account || "cash", label: `${pr.name} commission`, category: "Promoter commission" });
    }
  }
  for (const c of capital) {
    txns.push({
      date: iso(c.date),
      direction: c.type === "investment" ? "in" : "out",
      kind: c.type,
      amount: c.amount,
      account: c.account || "bank",
      label: `${c.type === "investment" ? "Investment" : "Withdrawal"} · ${c.person}`,
      category: c.type === "investment" ? "Investment" : "Withdrawal",
    });
  }
  txns.sort((a, b) => b.date.localeCompare(a.date));

  // ---- Period figures ----
  const periodSales = saleRows.filter((s) => inPeriod(s.date, months));
  const periodExpenses = expenses.filter((e) => inPeriod(e.date, months));
  const periodTxns = txns.filter((t) => inPeriod(t.date, months));
  const periodCommission = periodTxns.filter((t) => t.kind === "commission").reduce((s, t) => s + t.amount, 0);
  const pnl = profitAndLoss({
    revenue: periodSales.reduce((s, r) => s + r.revenue, 0),
    costOfGoods: periodSales.reduce((s, r) => s + r.cogs, 0),
    operatingExpenses: periodExpenses.reduce((s, e) => s + e.amount, 0),
    commission: periodCommission,
  });
  const bottlesMissingCost = periodSales.reduce((s, r) => s + r.missing, 0);

  // ---- Monthly series for charts (last 12 months) ----
  const sumBy = <T>(rows: T[], date: (r: T) => string, value: (r: T) => number) =>
    chartMonths.map((m) => Math.round(rows.filter((r) => monthKey(date(r)) === m).reduce((s, r) => s + value(r), 0)));
  const revenueSeries = sumBy(saleRows, (r) => r.date, (r) => r.revenue);
  const cogsSeries = sumBy(saleRows, (r) => r.date, (r) => r.cogs);
  const opexSeries = sumBy(expenses, (e) => iso(e.date), (e) => e.amount);
  const commissionSeries = sumBy(txns.filter((t) => t.kind === "commission"), (t) => t.date, (t) => t.amount);
  const costSeries = chartMonths.map((_, i) => cogsSeries[i] + opexSeries[i] + commissionSeries[i]);
  const netSeries = chartMonths.map((_, i) => revenueSeries[i] - costSeries[i]);
  const balanceSeries = runningBalance(txns, chartMonths);

  // ---- Breakdowns ----
  const expenseByCategory = groupTotals(periodExpenses, (e) => e.category, (e) => e.amount);
  const outflowByKind = groupTotals(periodTxns.filter((t) => t.direction === "out"), (t) => t.category, (t) => t.amount);
  const salesByFragrance = groupTotals(
    periodSales.flatMap((s) => s.o.items.map((i) => ({ name: i.name, value: i.lineTotal }))),
    (r) => r.name,
    (r) => r.value
  );

  // ---- Receivables and payables ----
  const receivables: Receivable[] = [];
  for (const o of orders) {
    const paid = o.paymentStatus === "paid" || o.paymentReceivedAt;
    if (paid || ["cancelled", "returned", "return_requested"].includes(o.orderStatus)) continue;
    const base = { id: String(o._id), orderNumber: o.orderNumber, customer: o.customer?.name || "", city: o.customer?.address?.city || "", total: o.total, method: o.paymentMethod, status: o.orderStatus };
    if (o.paymentMethod === "bank_transfer" && o.paymentStatus === "pending_verification") {
      receivables.push({ ...base, date: iso(o.createdAt), stage: "transfer_to_verify" });
    } else if (o.orderStatus === "delivered") {
      receivables.push({ ...base, date: iso(o.deliveryTime || o.updatedAt), stage: "delivered_unpaid" });
    } else if (OPEN_STATUSES.includes(o.orderStatus) && o.paymentMethod === "cod") {
      receivables.push({ ...base, date: iso(o.dispatchTime || o.createdAt), stage: "in_transit" });
    }
  }
  const billsDue = expenses.filter((e) => e.status === "due");

  const invested = capital.filter((c) => c.type === "investment").reduce((s, c) => s + c.amount, 0);
  const withdrawn = capital.filter((c) => c.type === "withdrawal").reduce((s, c) => s + c.amount, 0);
  const lifetime = profitAndLoss({
    revenue: saleRows.reduce((s, r) => s + r.revenue, 0),
    costOfGoods: saleRows.reduce((s, r) => s + r.cogs, 0),
    operatingExpenses: expenses.reduce((s, e) => s + e.amount, 0),
    commission: txns.filter((t) => t.kind === "commission").reduce((s, t) => s + t.amount, 0),
  });

  return {
    period,
    pnl,
    bottlesMissingCost,
    cash: cashTotals(periodTxns),
    balances: accountBalances(txns),
    cashOnHand: Math.round(txns.reduce((s, t) => s + (t.direction === "in" ? t.amount : -t.amount), 0)),
    chart: { months: chartMonths, revenue: revenueSeries, costs: costSeries, net: netSeries, balance: balanceSeries },
    expenseByCategory,
    outflowByKind,
    salesByFragrance,
    receivables,
    receivableTotals: {
      deliveredUnpaid: receivables.filter((r) => r.stage === "delivered_unpaid").reduce((s, r) => s + r.total, 0),
      inTransit: receivables.filter((r) => r.stage === "in_transit").reduce((s, r) => s + r.total, 0),
      toVerify: receivables.filter((r) => r.stage === "transfer_to_verify").reduce((s, r) => s + r.total, 0),
    },
    billsDue: billsDue.map((e) => ({ id: String(e._id), description: e.description, category: e.category, amount: e.amount, dueDate: e.dueDate ? iso(e.dueDate) : null, vendor: e.vendor || "" })),
    billsDueTotal: billsDue.reduce((s, e) => s + e.amount, 0),
    investment: { invested, withdrawn, net: invested - withdrawn, lifetimeNetProfit: lifetime.netProfit },
    expenses: expenses.slice(0, 300).map((e) => ({ id: String(e._id), date: iso(e.date), category: e.category, description: e.description, amount: e.amount, account: e.account, vendor: e.vendor || "", status: e.status, dueDate: e.dueDate ? iso(e.dueDate) : null })),
    capital: capital.map((c) => ({ id: String(c._id), date: iso(c.date), type: c.type, person: c.person, amount: c.amount, account: c.account, note: c.note || "" })),
    txns: txns.slice(0, 1000),
    periodTxns,
  };
}

export type AccountsData = Awaited<ReturnType<typeof buildAccounts>>;
