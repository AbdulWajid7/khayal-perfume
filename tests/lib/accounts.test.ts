import { describe, expect, it } from "vitest";
import { accountBalances, cashTotals, cleanAccount, groupTotals, lastMonths, monthKey, periodMonths, profitAndLoss, runningBalance, type CashTxn } from "@/lib/accounts";

const now = new Date("2026-10-16T10:00:00+05:00");

describe("accounts maths", () => {
  it("uses Karachi time for months", () => {
    expect(monthKey("2026-09-30T20:00:00Z")).toBe("2026-10"); // 1 am on 1 Oct in Karachi
    expect(lastMonths(3, now)).toEqual(["2026-08", "2026-09", "2026-10"]);
  });

  it("knows the months of each period", () => {
    expect(periodMonths("month", now)).toEqual(["2026-10"]);
    expect(periodMonths("last_month", now)).toEqual(["2026-09"]);
    expect(periodMonths("year", now)).toHaveLength(10);
    expect(periodMonths("all", now)).toBeNull();
  });

  it("builds profit and loss", () => {
    const p = profitAndLoss({ revenue: 100000, costOfGoods: 40000, operatingExpenses: 30000, commission: 5000 });
    expect(p).toMatchObject({ grossProfit: 60000, netProfit: 25000 });
    expect(p.grossMargin).toBeCloseTo(0.6);
    expect(p.netMargin).toBeCloseTo(0.25);
    expect(profitAndLoss({ revenue: 0, costOfGoods: 0, operatingExpenses: 500, commission: 0 }).netMargin).toBe(0);
  });

  it("totals cash and balances per account", () => {
    const t: CashTxn[] = [
      { date: "2026-09-01T00:00:00Z", direction: "in", kind: "investment", amount: 300000, account: "bank", label: "", category: "" },
      { date: "2026-09-05T00:00:00Z", direction: "out", kind: "stock", amount: 151500, account: "bank", label: "", category: "" },
      { date: "2026-10-10T00:00:00Z", direction: "in", kind: "sale", amount: 3999, account: "cash", label: "", category: "" },
      { date: "2026-10-11T00:00:00Z", direction: "out", kind: "expense", amount: 5000, account: "cash", label: "", category: "" },
    ];
    expect(cashTotals(t)).toEqual({ inflow: 303999, outflow: 156500, net: 147499 });
    expect(accountBalances(t)).toEqual([
      { account: "cash", label: "Cash", balance: -1001 },
      { account: "bank", label: "Bank account", balance: 148500 },
    ]);
    expect(runningBalance(t, ["2026-08", "2026-09", "2026-10"])).toEqual([0, 148500, 147499]);
  });

  it("groups and cleans input", () => {
    expect(groupTotals([{ c: "A", v: 1 }, { c: "B", v: 5 }, { c: "A", v: 2 }], (r) => r.c, (r) => r.v)).toEqual([
      { label: "B", total: 5 },
      { label: "A", total: 3 },
    ]);
    expect(cleanAccount("jazzcash")).toBe("jazzcash");
    expect(cleanAccount("hacker")).toBe("cash");
  });
});
