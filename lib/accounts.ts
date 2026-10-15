/**
 * Accounts maths: money accounts, expense categories, periods, profit and loss,
 * cash flow. Pure functions used by the Accounts pages and their tests.
 */

export const MONEY_ACCOUNTS = [
  { key: "cash", label: "Cash" },
  { key: "bank", label: "Bank account" },
  { key: "jazzcash", label: "JazzCash" },
  { key: "easypaisa", label: "Easypaisa" },
  { key: "courier", label: "With courier (COD)" },
  { key: "owner", label: "Owner's pocket" },
] as const;

export type MoneyAccount = (typeof MONEY_ACCOUNTS)[number]["key"];

export function accountLabel(key?: string): string {
  return MONEY_ACCOUNTS.find((a) => a.key === key)?.label || "Cash";
}

export function cleanAccount(key: unknown): MoneyAccount {
  const k = String(key || "");
  return (MONEY_ACCOUNTS.some((a) => a.key === k) ? k : "cash") as MoneyAccount;
}

export const EXPENSE_CATEGORIES = [
  "Marketing & ads",
  "Events & promotions",
  "Printing & signage",
  "Courier & delivery",
  "Salaries & wages",
  "Rent",
  "Utilities & internet",
  "Software & subscriptions",
  "Photography & content",
  "Travel & fuel",
  "Bank & payment fees",
  "Legal & registration",
  "Equipment",
  "Other",
] as const;

export function cleanCategory(c: unknown): string {
  const s = String(c || "");
  return (EXPENSE_CATEGORIES as readonly string[]).includes(s) ? s : "Other";
}

const PKT_OFFSET_MS = 5 * 60 * 60 * 1000;

/** "2026-10" for a date, in Karachi time. */
export function monthKey(date: Date | string): string {
  return new Date(new Date(date).getTime() + PKT_OFFSET_MS).toISOString().slice(0, 7);
}

/** The last n month keys, oldest first, ending with the month of `now`. */
export function lastMonths(n: number, now = new Date()): string[] {
  const [y, m] = monthKey(now).split("-").map(Number);
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(y, m - 1 - i, 1));
    out.push(d.toISOString().slice(0, 7));
  }
  return out;
}

export function monthLabel(key: string, long = false): string {
  const [y, m] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-GB", {
    month: long ? "long" : "short",
    year: long ? "numeric" : "2-digit",
    timeZone: "UTC",
  });
}

export type PeriodKey = "month" | "last_month" | "quarter" | "year" | "all";

export const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: "month", label: "This month" },
  { key: "last_month", label: "Last month" },
  { key: "quarter", label: "Last 3 months" },
  { key: "year", label: "This year" },
  { key: "all", label: "All time" },
];

/** Month keys a period covers (null = all time). */
export function periodMonths(period: PeriodKey, now = new Date()): string[] | null {
  const current = monthKey(now);
  if (period === "all") return null;
  if (period === "month") return [current];
  if (period === "last_month") return [lastMonths(2, now)[0]];
  if (period === "quarter") return lastMonths(3, now);
  const year = current.slice(0, 4);
  return lastMonths(Number(current.slice(5, 7)), now).filter((k) => k.startsWith(year));
}

export function inPeriod(date: Date | string, months: string[] | null): boolean {
  return months === null || months.includes(monthKey(date));
}

export interface ProfitAndLoss {
  revenue: number;
  costOfGoods: number;
  grossProfit: number;
  grossMargin: number;
  operatingExpenses: number;
  commission: number;
  netProfit: number;
  netMargin: number;
}

const r0 = (n: number) => Math.round(n);

export function profitAndLoss(input: { revenue: number; costOfGoods: number; operatingExpenses: number; commission: number }): ProfitAndLoss {
  const grossProfit = input.revenue - input.costOfGoods;
  const netProfit = grossProfit - input.operatingExpenses - input.commission;
  return {
    revenue: r0(input.revenue),
    costOfGoods: r0(input.costOfGoods),
    grossProfit: r0(grossProfit),
    grossMargin: input.revenue ? grossProfit / input.revenue : 0,
    operatingExpenses: r0(input.operatingExpenses),
    commission: r0(input.commission),
    netProfit: r0(netProfit),
    netMargin: input.revenue ? netProfit / input.revenue : 0,
  };
}

/** One movement of money, in or out of an account. */
export interface CashTxn {
  date: string;
  direction: "in" | "out";
  kind: "sale" | "expense" | "stock" | "commission" | "investment" | "withdrawal";
  amount: number;
  account: string;
  label: string;
  category: string;
  ref?: string;
}

export const KIND_LABELS: Record<CashTxn["kind"], string> = {
  sale: "Sale received",
  expense: "Expense",
  stock: "Stock purchase",
  commission: "Promoter commission",
  investment: "Investment in",
  withdrawal: "Owner withdrawal",
};

export function cashTotals(txns: CashTxn[]) {
  let inflow = 0;
  let outflow = 0;
  for (const t of txns) {
    if (t.direction === "in") inflow += t.amount;
    else outflow += t.amount;
  }
  return { inflow: r0(inflow), outflow: r0(outflow), net: r0(inflow - outflow) };
}

/** Balance of each money account from every transaction to date. */
export function accountBalances(txns: CashTxn[]): { account: string; label: string; balance: number }[] {
  const map = new Map<string, number>();
  for (const t of txns) map.set(t.account, (map.get(t.account) || 0) + (t.direction === "in" ? t.amount : -t.amount));
  return MONEY_ACCOUNTS.filter((a) => map.has(a.key)).map((a) => ({ account: a.key, label: a.label, balance: r0(map.get(a.key) || 0) }));
}

/** Running cash position at the end of each month (all accounts together). */
export function runningBalance(txns: CashTxn[], months: string[]): number[] {
  const sorted = [...txns].sort((a, b) => a.date.localeCompare(b.date));
  return months.map((m) =>
    r0(sorted.filter((t) => monthKey(t.date) <= m).reduce((s, t) => s + (t.direction === "in" ? t.amount : -t.amount), 0))
  );
}

/** Sums values per key, biggest first. */
export function groupTotals<T>(rows: T[], key: (r: T) => string, value: (r: T) => number) {
  const map = new Map<string, number>();
  for (const r of rows) map.set(key(r), (map.get(key(r)) || 0) + value(r));
  return [...map.entries()].map(([label, total]) => ({ label, total: r0(total) })).sort((a, b) => b.total - a.total);
}
