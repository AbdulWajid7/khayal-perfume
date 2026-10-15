import type { Metadata } from "next";
import Link from "next/link";
import {
  addCapital,
  addExpense,
  deleteCapital,
  deleteExpense,
  getAccounts,
  markAllDeliveredReceived,
  markExpensePaid,
  markPaymentReceived,
} from "@/lib/admin/accounts";
import { accountLabel, EXPENSE_CATEGORIES, KIND_LABELS, MONEY_ACCOUNTS, monthLabel, PERIODS } from "@/lib/accounts";
import { BalanceChart, BreakdownBars, NetProfitChart, RevenueCostChart } from "@/components/admin/AccountsCharts";

export const metadata: Metadata = { title: "Accounts | Khayal Admin" };
export const dynamic = "force-dynamic";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "payments", label: "Payments to collect" },
  { key: "expenses", label: "Expenses & bills" },
  { key: "investment", label: "Investment" },
  { key: "ledger", label: "All transactions" },
] as const;

const card = "bg-pure border border-border rounded-2xl p-6 shadow-sm";
const btn = "bg-gold text-pure rounded-lg px-4 py-2 text-sm font-medium hover:bg-gold-light";
const btn2 = "border border-border rounded-lg px-3 py-1.5 text-xs hover:bg-cream";
const rs = (n: number) => `${n < 0 ? "−" : ""}Rs ${Math.abs(Math.round(n)).toLocaleString("en-PK")}`;
const pct = (n: number) => `${Math.round(n * 1000) / 10}%`;
const day = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-PK", { timeZone: "Asia/Karachi", day: "numeric", month: "short", year: "numeric" }) : "—";
const today = () => new Date(Date.now() + 5 * 3600e3).toISOString().slice(0, 10);

function AccountSelect({ name = "account", def = "cash", noCourier = false }: { name?: string; def?: string; noCourier?: boolean }) {
  return (
    <select name={name} defaultValue={def} className="input-admin">
      {MONEY_ACCOUNTS.filter((a) => !noCourier || a.key !== "courier").map((a) => (
        <option key={a.key} value={a.key}>{a.label}</option>
      ))}
    </select>
  );
}

function Tile({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "good" | "bad" }) {
  return (
    <div className={card}>
      <p className="text-[11px] uppercase tracking-wider text-stone">{label}</p>
      <p className={`font-serif-display text-2xl mt-2 ${tone === "bad" ? "text-sale" : "text-ink"}`}>{value}</p>
      {sub && <p className="text-xs text-stone mt-1">{sub}</p>}
    </div>
  );
}

export default async function AccountsPage({ searchParams }: { searchParams: Promise<{ tab?: string; period?: string }> }) {
  const { tab = "overview", period = "month" } = await searchParams;
  const a = await getAccounts(period);
  const q = (t: string, p = a.period) => `/admin/accounts?tab=${t}&period=${p}`;
  const months = a.chart.months.map((m) => monthLabel(m));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif-display text-3xl text-ink">Accounts</h1>
          <p className="text-stone mt-1 max-w-3xl">
            Money in and out of KHAYAL: sales, costs, expenses, stock, promoter commission and your investment. Only you
            can open this page.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {PERIODS.map((p) => (
            <Link key={p.key} href={q(tab, p.key)} className={`${btn2} ${a.period === p.key ? "bg-gold/10 border-gold/50 text-ink" : "text-stone"}`}>
              {p.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-border">
        {TABS.map((t) => (
          <Link key={t.key} href={q(t.key)} className={`px-4 py-2 text-sm -mb-px border-b-2 ${tab === t.key ? "border-gold text-ink font-medium" : "border-transparent text-stone hover:text-ink"}`}>
            {t.label}
            {t.key === "payments" && a.receivables.length > 0 && <span className="ml-1.5 text-xs text-gold">{a.receivables.length}</span>}
            {t.key === "expenses" && a.billsDue.length > 0 && <span className="ml-1.5 text-xs text-sale">{a.billsDue.length} due</span>}
          </Link>
        ))}
      </div>

      {tab === "overview" && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Tile label="Revenue" value={rs(a.pnl.revenue)} sub="delivered orders, incl. delivery charge" />
            <Tile label="Gross profit" value={rs(a.pnl.grossProfit)} sub={`${pct(a.pnl.grossMargin)} after cost of bottles`} />
            <Tile label="Net profit" value={rs(a.pnl.netProfit)} sub={`${pct(a.pnl.netMargin)} after all costs`} tone={a.pnl.netProfit < 0 ? "bad" : "good"} />
            <Tile label="Cash position" value={rs(a.cashOnHand)} sub="all money accounts today" tone={a.cashOnHand < 0 ? "bad" : undefined} />
            <Tile label="Money in (period)" value={rs(a.cash.inflow)} sub="payments received + investment" />
            <Tile label="Money out (period)" value={rs(a.cash.outflow)} sub="expenses, stock, commission, withdrawals" />
            <Tile label="To collect" value={rs(a.receivableTotals.deliveredUnpaid + a.receivableTotals.inTransit + a.receivableTotals.toVerify)} sub={`${rs(a.receivableTotals.deliveredUnpaid)} delivered, not yet received`} />
            <Tile label="Bills due" value={rs(a.billsDueTotal)} sub={`${a.billsDue.length} unpaid`} tone={a.billsDueTotal > 0 ? "bad" : undefined} />
          </div>

          {a.bottlesMissingCost > 0 && (
            <div className="rounded-xl border border-gold/50 bg-gold/10 px-4 py-3 text-sm text-ink">
              {a.bottlesMissingCost} bottle(s) sold this period have no cost in Cost &amp; Profit, so gross profit is shown
              higher than it is. Make the KHAYAL names there match the product names.
            </div>
          )}

          <div className={card}>
            <h2 className="font-serif-display text-xl text-ink">Revenue against costs</h2>
            <p className="text-xs text-stone mb-4">Last 12 months. Hover a month for the figures.</p>
            <RevenueCostChart months={months} revenue={a.chart.revenue} costs={a.chart.costs} net={a.chart.net} />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className={card}>
              <h2 className="font-serif-display text-xl text-ink">Net profit by month</h2>
              <p className="text-xs text-stone mb-4">Above the line is profit, below is a loss.</p>
              <NetProfitChart months={months} net={a.chart.net} />
            </div>
            <div className={card}>
              <h2 className="font-serif-display text-xl text-ink">Cash position</h2>
              <p className="text-xs text-stone mb-4">Money in all accounts at the end of each month.</p>
              <BalanceChart months={months} balance={a.chart.balance} />
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className={card}>
              <h2 className="font-serif-display text-xl text-ink mb-4">Where the money went</h2>
              <BreakdownBars rows={a.outflowByKind} empty="Nothing paid out in this period." />
            </div>
            <div className={card}>
              <h2 className="font-serif-display text-xl text-ink mb-4">Expenses by category</h2>
              <BreakdownBars rows={a.expenseByCategory} empty="No expenses in this period." />
            </div>
            <div className={card}>
              <h2 className="font-serif-display text-xl text-ink mb-4">Sales by fragrance</h2>
              <BreakdownBars rows={a.salesByFragrance} empty="No delivered orders in this period." />
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className={card}>
              <h2 className="font-serif-display text-xl text-ink mb-4">Profit &amp; loss</h2>
              <table className="w-full text-sm">
                <tbody className="divide-y divide-border">
                  {[
                    ["Revenue", a.pnl.revenue, false],
                    ["Cost of bottles sold", -a.pnl.costOfGoods, false],
                    ["Gross profit", a.pnl.grossProfit, true],
                    ["Operating expenses", -a.pnl.operatingExpenses, false],
                    ["Promoter commission paid", -a.pnl.commission, false],
                    ["Net profit", a.pnl.netProfit, true],
                  ].map(([label, value, bold]) => (
                    <tr key={label as string} className={bold ? "font-medium" : ""}>
                      <td className="py-2.5 text-ink">{label}</td>
                      <td className={`py-2.5 text-right ${(value as number) < 0 ? "text-sale" : "text-ink"}`}>{rs(value as number)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-stone mt-3">Cost of bottles uses Cost &amp; Profit (oil, bottle, box, packaging per bottle). Stock purchases show in cash flow, not here, so they are not counted twice.</p>
            </div>
            <div className={card}>
              <h2 className="font-serif-display text-xl text-ink mb-4">Money accounts</h2>
              {a.balances.length === 0 ? (
                <p className="text-sm text-stone">No money recorded yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-border">
                    {a.balances.map((b) => (
                      <tr key={b.account}>
                        <td className="py-2.5 text-ink">{b.label}</td>
                        <td className={`py-2.5 text-right font-medium ${b.balance < 0 ? "text-sale" : "text-ink"}`}>{rs(b.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <p className="text-xs text-stone mt-3">A negative account means more was recorded as paid from it than went in. Record your investment and opening cash in the Investment tab.</p>
            </div>
          </div>

          <div className={card}>
            <h2 className="font-serif-display text-xl text-ink mb-4">Month by month</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wider text-stone border-b border-border">
                  <tr><th className="py-2 pr-4">Month</th><th className="py-2 pr-4 text-right">Revenue</th><th className="py-2 pr-4 text-right">Costs</th><th className="py-2 pr-4 text-right">Net profit</th><th className="py-2 text-right">Cash at month end</th></tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {a.chart.months.map((m, i) => ({ m, i })).reverse().map(({ m, i }) => (
                    <tr key={m}>
                      <td className="py-2 pr-4">{monthLabel(m, true)}</td>
                      <td className="py-2 pr-4 text-right">{rs(a.chart.revenue[i])}</td>
                      <td className="py-2 pr-4 text-right">{rs(a.chart.costs[i])}</td>
                      <td className={`py-2 pr-4 text-right font-medium ${a.chart.net[i] < 0 ? "text-sale" : ""}`}>{rs(a.chart.net[i])}</td>
                      <td className="py-2 text-right">{rs(a.chart.balance[i])}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === "payments" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Tile label="Delivered, money not received" value={rs(a.receivableTotals.deliveredUnpaid)} sub="COD the courier or rider still owes" />
            <Tile label="On the way (COD)" value={rs(a.receivableTotals.inTransit)} sub="collected on delivery" />
            <Tile label="Bank transfers to check" value={rs(a.receivableTotals.toVerify)} sub="verify in Orders" />
          </div>
          {a.receivableTotals.deliveredUnpaid > 0 && (
            <form action={markAllDeliveredReceived} className={`${card} flex flex-wrap items-end gap-3`}>
              <div className="flex-1 min-w-60">
                <p className="font-medium text-ink">Courier settlement received?</p>
                <p className="text-xs text-stone">Marks every delivered COD order below as paid into the account you choose.</p>
              </div>
              <AccountSelect def="bank" />
              <input name="date" type="date" defaultValue={today()} className="input-admin max-w-44" />
              <button className={btn}>Mark all delivered as received</button>
            </form>
          )}
          <div className={card}>
            {a.receivables.length === 0 ? (
              <p className="text-sm text-stone">Nothing to collect. Every order is paid.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="text-left text-xs uppercase tracking-wider text-stone border-b border-border">
                    <tr><th className="py-2 pr-4">Order</th><th className="py-2 pr-4">Customer</th><th className="py-2 pr-4">Stage</th><th className="py-2 pr-4">Since</th><th className="py-2 pr-4 text-right">Amount</th><th className="py-2">Received</th></tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {a.receivables.map((r) => (
                      <tr key={r.id}>
                        <td className="py-2.5 pr-4"><Link href={`/admin/orders/${r.id}`} className="text-gold hover:underline">{r.orderNumber}</Link></td>
                        <td className="py-2.5 pr-4">{r.customer}<div className="text-xs text-stone">{r.city}</div></td>
                        <td className="py-2.5 pr-4 text-xs">{r.stage === "delivered_unpaid" ? "Delivered, unpaid" : r.stage === "in_transit" ? `On the way (${r.status.replace(/_/g, " ")})` : "Transfer to verify"}</td>
                        <td className="py-2.5 pr-4 whitespace-nowrap">{day(r.date)}</td>
                        <td className="py-2.5 pr-4 text-right font-medium">{rs(r.total)}</td>
                        <td className="py-2.5">
                          {r.stage === "delivered_unpaid" ? (
                            <form action={markPaymentReceived.bind(null, r.id)} className="flex gap-2">
                              <AccountSelect />
                              <button className={btn2}>Received</button>
                            </form>
                          ) : r.stage === "transfer_to_verify" ? (
                            <Link href={`/admin/orders/${r.id}`} className={btn2}>Verify</Link>
                          ) : (
                            <span className="text-xs text-stone">after delivery</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {tab === "expenses" && (
        <>
          <form action={addExpense} className={`${card} space-y-3`}>
            <h2 className="font-serif-display text-xl text-ink">Add an expense or bill</h2>
            <div className="grid md:grid-cols-4 gap-3">
              <input name="description" required placeholder="What for, e.g. Instagram ads" className="input-admin md:col-span-2" />
              <input name="amount" type="number" min="1" step="any" required placeholder="Amount (Rs)" className="input-admin" />
              <input name="date" type="date" defaultValue={today()} className="input-admin" />
              <select name="category" defaultValue="Marketing & ads" className="input-admin">
                {EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <input name="vendor" placeholder="Paid to (optional)" className="input-admin" />
              <AccountSelect noCourier />
              <select name="status" defaultValue="paid" className="input-admin">
                <option value="paid">Already paid</option>
                <option value="due">Bill to pay later</option>
              </select>
              <input name="dueDate" type="date" className="input-admin" title="Due date (bills only)" />
              <input name="note" placeholder="Note (optional)" className="input-admin md:col-span-3" />
            </div>
            <button className={btn}>Save expense</button>
          </form>

          {a.billsDue.length > 0 && (
            <div className={`${card} border-sale/40`}>
              <h2 className="font-serif-display text-xl text-ink mb-3">Bills to pay · {rs(a.billsDueTotal)}</h2>
              <ul className="divide-y divide-border text-sm">
                {a.billsDue.map((b) => (
                  <li key={b.id} className="py-2.5 flex flex-wrap items-center justify-between gap-3">
                    <span>
                      <strong>{b.description}</strong> · {b.category}{b.vendor ? ` · ${b.vendor}` : ""} · due {day(b.dueDate)}
                    </span>
                    <form action={markExpensePaid.bind(null, b.id)} className="flex items-center gap-2">
                      <strong>{rs(b.amount)}</strong>
                      <AccountSelect noCourier />
                      <input type="hidden" name="date" value={today()} />
                      <button className={btn2}>Mark paid</button>
                    </form>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className={card}>
            <h2 className="font-serif-display text-xl text-ink mb-4">All expenses</h2>
            {a.expenses.length === 0 ? (
              <p className="text-sm text-stone">No expenses recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="text-left text-xs uppercase tracking-wider text-stone border-b border-border">
                    <tr><th className="py-2 pr-4">Date</th><th className="py-2 pr-4">Expense</th><th className="py-2 pr-4">Category</th><th className="py-2 pr-4">From</th><th className="py-2 pr-4">Status</th><th className="py-2 pr-4 text-right">Amount</th><th className="py-2" /></tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {a.expenses.map((e) => (
                      <tr key={e.id}>
                        <td className="py-2.5 pr-4 whitespace-nowrap">{day(e.date)}</td>
                        <td className="py-2.5 pr-4">{e.description}{e.vendor && <div className="text-xs text-stone">{e.vendor}</div>}</td>
                        <td className="py-2.5 pr-4 text-xs">{e.category}</td>
                        <td className="py-2.5 pr-4 text-xs">{accountLabel(e.account)}</td>
                        <td className={`py-2.5 pr-4 text-xs ${e.status === "due" ? "text-sale" : "text-stone"}`}>{e.status === "due" ? "Due" : "Paid"}</td>
                        <td className="py-2.5 pr-4 text-right font-medium">{rs(e.amount)}</td>
                        <td className="py-2.5"><form action={deleteExpense.bind(null, e.id)}><button className="text-xs text-sale">Delete</button></form></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="text-xs text-stone mt-3">Stock you buy is recorded in Stock &amp; Supplies and shows in All transactions. Promoter payouts come from the Promoters page.</p>
          </div>
        </>
      )}

      {tab === "investment" && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Tile label="Total invested" value={rs(a.investment.invested)} />
            <Tile label="Taken out" value={rs(a.investment.withdrawn)} />
            <Tile label="Net investment" value={rs(a.investment.net)} />
            <Tile
              label="Earned back so far"
              value={a.investment.net > 0 ? pct(Math.max(0, a.investment.lifetimeNetProfit) / a.investment.net) : "—"}
              sub={`${rs(a.investment.lifetimeNetProfit)} net profit to date`}
              tone={a.investment.lifetimeNetProfit < 0 ? "bad" : undefined}
            />
          </div>
          <form action={addCapital} className={`${card} space-y-3`}>
            <h2 className="font-serif-display text-xl text-ink">Record money in or out</h2>
            <div className="grid md:grid-cols-3 gap-3">
              <select name="type" defaultValue="investment" className="input-admin">
                <option value="investment">Investment into KHAYAL</option>
                <option value="withdrawal">Owner withdrawal</option>
              </select>
              <input name="person" required defaultValue="Abdul Wajid" placeholder="Whose money" className="input-admin" />
              <input name="amount" type="number" min="1" step="any" required placeholder="Amount (Rs)" className="input-admin" />
              <input name="date" type="date" defaultValue={today()} className="input-admin" />
              <AccountSelect def="bank" noCourier />
              <input name="note" placeholder="Note, e.g. launch stock, opening cash" className="input-admin" />
            </div>
            <button className={btn}>Save</button>
          </form>
          <div className={card}>
            <h2 className="font-serif-display text-xl text-ink mb-4">History</h2>
            {a.capital.length === 0 ? (
              <p className="text-sm text-stone">Nothing yet. Start by recording what you have put into KHAYAL so far.</p>
            ) : (
              <ul className="divide-y divide-border text-sm">
                {a.capital.map((c) => (
                  <li key={c.id} className="py-2.5 flex flex-wrap justify-between gap-3">
                    <span>{day(c.date)} · {c.type === "investment" ? "Invested" : "Withdrew"} by {c.person} · {accountLabel(c.account)}{c.note ? ` · ${c.note}` : ""}</span>
                    <span className="flex items-center gap-3">
                      <strong className={c.type === "withdrawal" ? "text-sale" : ""}>{c.type === "withdrawal" ? "−" : "+"}{rs(c.amount)}</strong>
                      <form action={deleteCapital.bind(null, c.id)}><button className="text-xs text-sale">Delete</button></form>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      {tab === "ledger" && (
        <div className={card}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h2 className="font-serif-display text-xl text-ink">All transactions · {PERIODS.find((p) => p.key === a.period)?.label}</h2>
            <a href={`/admin/accounts/export?period=${a.period}`} className={btn2}>Download CSV</a>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-5 text-sm">
            <div>In <strong className="block text-lg text-ink">{rs(a.cash.inflow)}</strong></div>
            <div>Out <strong className="block text-lg text-ink">{rs(a.cash.outflow)}</strong></div>
            <div>Net <strong className={`block text-lg ${a.cash.net < 0 ? "text-sale" : "text-ink"}`}>{rs(a.cash.net)}</strong></div>
          </div>
          {a.periodTxns.length === 0 ? (
            <p className="text-sm text-stone">No money movements in this period.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wider text-stone border-b border-border">
                  <tr><th className="py-2 pr-4">Date</th><th className="py-2 pr-4">Type</th><th className="py-2 pr-4">Details</th><th className="py-2 pr-4">Category</th><th className="py-2 pr-4">Account</th><th className="py-2 text-right">Amount</th></tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {a.periodTxns.map((t, i) => (
                    <tr key={i}>
                      <td className="py-2 pr-4 whitespace-nowrap">{day(t.date)}</td>
                      <td className="py-2 pr-4 text-xs">{KIND_LABELS[t.kind]}</td>
                      <td className="py-2 pr-4">{t.label}</td>
                      <td className="py-2 pr-4 text-xs text-stone">{t.category}</td>
                      <td className="py-2 pr-4 text-xs">{accountLabel(t.account)}</td>
                      <td className={`py-2 text-right font-medium ${t.direction === "out" ? "text-sale" : "text-emerald-700"}`}>
                        {t.direction === "out" ? "−" : "+"}{rs(t.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
