"use client";

import { useActionState, useMemo, useState } from "react";
import { saveCostSheet } from "@/lib/admin/costs";
import {
  computeRow,
  computeTotals,
  DEFAULT_BOX_PRICE,
  DEFAULT_OTHER_COST,
  DEFAULT_PACKAGING_PRICE,
  launchPrice,
  SIGNATURE_PRICE,
  STANDARD_PRICE,
  supplierSummary,
  type CostRow,
} from "@/lib/cost-calc";

const pkr = (n: number) =>
  `${n < 0 ? "-" : ""}Rs ${Math.abs(n).toLocaleString("en-PK", { maximumFractionDigits: 2 })}`;
const pct = (n: number) => `${(n * 100).toLocaleString("en-PK", { maximumFractionDigits: 1 })}%`;

const blankRow = (): CostRow => ({
  realName: "",
  khayalName: "",
  makerQtyMl: 0,
  makerPrice: 0,
  bottleMl: 50,
  boxPrice: 0,
  packagingPrice: 0,
  otherCost: 0,
  sellingPrice: 0,
  commissionRate: 0,
});

type NumField = Exclude<keyof CostRow, "realName" | "khayalName">;

const NUM_COLS: { key: NumField; label: string; percent?: boolean }[] = [
  { key: "makerQtyMl", label: "Qty from maker (mL)" },
  { key: "makerPrice", label: "Maker price (PKR)" },
];
const NUM_COLS_2: { key: NumField; label: string; percent?: boolean }[] = [
  { key: "bottleMl", label: "Bottle size (mL)" },
];
const NUM_COLS_3: { key: NumField; label: string; percent?: boolean }[] = [
  { key: "boxPrice", label: "Box price (PKR)" },
  { key: "packagingPrice", label: "Packaging price (PKR)" },
  { key: "otherCost", label: "Other cost (PKR)" },
];
const NUM_COLS_4: { key: NumField; label: string; percent?: boolean }[] = [
  { key: "sellingPrice", label: "Selling price (PKR)" },
  { key: "commissionRate", label: "Commission (% of profit)", percent: true },
];

const inputCls =
  "w-full min-w-[84px] rounded-md border border-amber-300 bg-amber-50 px-2 py-1.5 text-sm text-ink text-right tabular-nums focus:outline-none focus:ring-2 focus:ring-gold";
const textCls = inputCls.replace("text-right tabular-nums", "text-left min-w-[150px]");
const th = "px-3 py-3 text-left text-[11px] font-medium uppercase tracking-wider text-stone whitespace-normal align-bottom";
const td = "px-3 py-2 align-middle whitespace-nowrap";
const calc = `${td} text-right tabular-nums text-ink`;

export default function CostCalculator({
  initialRows,
  initialStatedTotal,
  updatedAt,
}: {
  initialRows: CostRow[];
  initialStatedTotal: number;
  updatedAt: string | null;
}) {
  const [rows, setRows] = useState<CostRow[]>(initialRows);
  const [stated, setStated] = useState<number>(initialStatedTotal);
  const [dirty, setDirty] = useState(false);
  const [bulk, setBulk] = useState({
    boxPrice: DEFAULT_BOX_PRICE,
    packagingPrice: DEFAULT_PACKAGING_PRICE,
    otherCost: DEFAULT_OTHER_COST,
  });
  const [state, formAction, saving] = useActionState(saveCostSheet, null);

  const results = useMemo(() => rows.map(computeRow), [rows]);
  const totals = useMemo(() => computeTotals(results), [results]);
  const supplier = useMemo(() => supplierSummary(rows, stated), [rows, stated]);

  const update = (i: number, key: keyof CostRow, value: string) => {
    setDirty(true);
    setRows((prev) =>
      prev.map((r, idx) => {
        if (idx !== i) return r;
        if (key === "realName" || key === "khayalName") return { ...r, [key]: value };
        const n = value === "" ? 0 : Number(value);
        if (!Number.isFinite(n)) return r;
        return { ...r, [key]: key === "commissionRate" ? n / 100 : n };
      })
    );
  };

  const numInput = (i: number, row: CostRow, col: { key: NumField; percent?: boolean }) => (
    <td className={td} key={col.key}>
      <input
        type="number"
        inputMode="decimal"
        min={0}
        step="any"
        className={inputCls}
        value={col.percent ? Number((row[col.key] * 100).toFixed(4)) : row[col.key]}
        onChange={(e) => update(i, col.key, e.target.value)}
        aria-label={`${row.khayalName || "Row " + (i + 1)} ${col.key}`}
      />
    </td>
  );

  const downloadCsv = () => {
    const head = [
      "Real name", "KHAYAL name", "Qty from maker (mL)", "Maker price (PKR)", "Unit cost per mL (PKR)",
      "Bottle size (mL)", "Fragrance cost per bottle (PKR)", "Box price (PKR)", "Packaging price (PKR)",
      "Other cost (PKR)", "Total cost before commission (PKR)", "Selling price (PKR)", "Commission rate",
      "Commission amount (PKR)", "Profit after commission (PKR)", "Profit margin",
    ];
    const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const lines = results.map((r) =>
      [
        r.realName, r.khayalName, r.makerQtyMl, r.makerPrice, r.unitCostPerMl.toFixed(2), r.bottleMl,
        r.fragranceCostPerBottle.toFixed(2), r.boxPrice, r.packagingPrice, r.otherCost,
        r.totalCostBeforeCommission.toFixed(2), r.sellingPrice, r.commissionRate,
        r.commissionAmount.toFixed(2), r.profitAfterCommission.toFixed(2), r.profitMargin.toFixed(4),
      ].map(esc).join(",")
    );
    const blob = new Blob([[head.map(esc).join(","), ...lines].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `khayal-cost-profit-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <form
      action={(fd) => {
        setDirty(false);
        formAction(fd);
      }}
      className="space-y-6"
    >
      <input type="hidden" name="rows" value={JSON.stringify(rows)} />

      {/* Supplier quote summary */}
      <div className="bg-pure border border-border rounded-2xl p-6 shadow-sm">
        <h2 className="font-serif-display text-xl text-ink mb-4">Supplier quote summary</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-stone mb-1">Itemized total (sum of maker prices)</p>
            <p className="text-lg text-ink tabular-nums">{pkr(supplier.itemized)}</p>
          </div>
          <div>
            <label className="block text-xs text-stone mb-1" htmlFor="supplierStatedTotal">
              Supplier stated total
            </label>
            <input
              id="supplierStatedTotal"
              name="supplierStatedTotal"
              type="number"
              min={0}
              step="any"
              className={`${inputCls} max-w-[200px] text-left`}
              value={stated}
              onChange={(e) => {
                setDirty(true);
                setStated(Number(e.target.value) || 0);
              }}
            />
          </div>
          <div>
            <p className="text-xs text-stone mb-1">Difference (itemized less stated)</p>
            <p className={`text-lg tabular-nums ${supplier.difference === 0 ? "text-emerald-700" : "text-red-700"}`}>
              {pkr(supplier.difference)}
              {supplier.difference === 0 ? " · matches" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Fill every row at once */}
      <div className="bg-pure border border-border rounded-2xl p-6 shadow-sm">
        <h2 className="font-serif-display text-xl text-ink mb-1">Fill all fragrances at once</h2>
        <p className="text-sm text-stone mb-4">
          Same box, packaging and other cost for every bottle, or the launch price list
          (Signature Rs {SIGNATURE_PRICE.toLocaleString("en-PK")}, Classic Rs {STANDARD_PRICE.toLocaleString("en-PK")}).
          Then press Save.
        </p>
        <div className="flex flex-wrap items-end gap-3">
          {([
            ["boxPrice", "Box (PKR)"],
            ["packagingPrice", "Packaging (PKR)"],
            ["otherCost", "Other (PKR)"],
          ] as const).map(([key, label]) => (
            <label key={key} className="text-xs text-stone">
              {label}
              <input
                type="number"
                min={0}
                step="any"
                className={`${inputCls} mt-1 max-w-[130px]`}
                value={bulk[key]}
                onChange={(e) => setBulk((b) => ({ ...b, [key]: Number(e.target.value) || 0 }))}
              />
            </label>
          ))}
          <button
            type="button"
            onClick={() => {
              setDirty(true);
              setRows((p) => p.map((r) => ({ ...r, ...bulk })));
            }}
            className="border border-border text-ink rounded-lg px-4 py-2 text-sm hover:bg-cream transition-colors"
          >
            Apply costs to all
          </button>
          <button
            type="button"
            onClick={() => {
              setDirty(true);
              setRows((p) => p.map((r) => ({ ...r, sellingPrice: launchPrice(r.khayalName) })));
            }}
            className="border border-border text-ink rounded-lg px-4 py-2 text-sm hover:bg-cream transition-colors"
          >
            Apply launch prices
          </button>
        </div>
      </div>

      {/* The table */}
      <div className="bg-pure border border-border rounded-2xl shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 p-6 pb-3">
          <div>
            <h2 className="font-serif-display text-xl text-ink">Fragrance pricing</h2>
            <p className="text-sm text-stone">
              Yellow cells are inputs. Everything else calculates as you type. Save to keep changes.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setDirty(true);
                setRows((p) => [...p, blankRow()]);
              }}
              className="border border-border text-ink rounded-lg px-4 py-2 text-sm hover:bg-cream transition-colors"
            >
              + Add fragrance
            </button>
            <button
              type="button"
              onClick={downloadCsv}
              className="border border-border text-ink rounded-lg px-4 py-2 text-sm hover:bg-cream transition-colors"
            >
              Download CSV
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-gold text-pure rounded-lg px-5 py-2 text-sm font-medium hover:bg-gold-light transition-colors disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
        <div className="px-6 pb-2 text-sm min-h-[1.5rem]">
          {dirty ? (
            <span className="text-amber-700">Unsaved changes</span>
          ) : state ? (
            <span className={state.ok ? "text-emerald-700" : "text-red-700"}>{state.message}</span>
          ) : updatedAt ? (
            <span className="text-stone">Last saved {new Date(updatedAt).toLocaleString("en-PK", { timeZone: "Asia/Karachi" })}</span>
          ) : (
            <span className="text-stone">Loaded from your spreadsheet. Press Save once to store it.</span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-cream/60 border-y border-border">
              <tr>
                <th className={th}>Real name</th>
                <th className={th}>KHAYAL name</th>
                {NUM_COLS.map((c) => <th key={c.key} className={th}>{c.label}</th>)}
                <th className={th}>Unit cost per mL</th>
                {NUM_COLS_2.map((c) => <th key={c.key} className={th}>{c.label}</th>)}
                <th className={th}>Fragrance cost per bottle</th>
                {NUM_COLS_3.map((c) => <th key={c.key} className={th}>{c.label}</th>)}
                <th className={th}>Total cost before commission</th>
                {NUM_COLS_4.map((c) => <th key={c.key} className={th}>{c.label}</th>)}
                <th className={th}>Commission (on profit)</th>
                <th className={th}>Profit after commission</th>
                <th className={th}>Profit margin</th>
                <th className={th}><span className="sr-only">Remove</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {results.map((r, i) => (
                <tr key={i} className="hover:bg-cream/30">
                  <td className={td}>
                    <input className={textCls} value={r.realName} onChange={(e) => update(i, "realName", e.target.value)} aria-label="Real name" />
                  </td>
                  <td className={td}>
                    <input className={textCls} value={r.khayalName} onChange={(e) => update(i, "khayalName", e.target.value)} aria-label="KHAYAL name" />
                  </td>
                  {NUM_COLS.map((c) => numInput(i, r, c))}
                  <td className={calc}>{pkr(r.unitCostPerMl)}</td>
                  {NUM_COLS_2.map((c) => numInput(i, r, c))}
                  <td className={calc}>{pkr(r.fragranceCostPerBottle)}</td>
                  {NUM_COLS_3.map((c) => numInput(i, r, c))}
                  <td className={`${calc} font-medium`}>{pkr(r.totalCostBeforeCommission)}</td>
                  {NUM_COLS_4.map((c) => numInput(i, r, c))}
                  <td className={calc}>{pkr(r.commissionAmount)}</td>
                  <td className={`${calc} font-medium ${r.profitAfterCommission < 0 ? "text-red-700" : "text-emerald-700"}`}>
                    {pkr(r.profitAfterCommission)}
                  </td>
                  <td className={calc}>{pct(r.profitMargin)}</td>
                  <td className={td}>
                    <button
                      type="button"
                      onClick={() => {
                        setDirty(true);
                        setRows((p) => p.filter((_, idx) => idx !== i));
                      }}
                      className="text-xs text-stone hover:text-red-700"
                      aria-label={`Remove ${r.khayalName || "row"}`}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-border bg-cream/60 font-medium">
              <tr>
                <td className={td} colSpan={3}>Totals / portfolio average</td>
                <td className={calc}>{pkr(totals.makerPrice)}</td>
                <td className={td} />
                <td className={td} />
                <td className={calc}>{pkr(totals.fragranceCostPerBottle)}</td>
                <td className={calc}>{pkr(totals.boxPrice)}</td>
                <td className={calc}>{pkr(totals.packagingPrice)}</td>
                <td className={calc}>{pkr(totals.otherCost)}</td>
                <td className={calc}>{pkr(totals.totalCostBeforeCommission)}</td>
                <td className={calc}>{pkr(totals.sellingPrice)}</td>
                <td className={td} />
                <td className={calc}>{pkr(totals.commissionAmount)}</td>
                <td className={`${calc} ${totals.profitAfterCommission < 0 ? "text-red-700" : "text-emerald-700"}`}>
                  {pkr(totals.profitAfterCommission)}
                </td>
                <td className={calc}>{pct(totals.profitMargin)}</td>
                <td className={td} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-pure border border-border rounded-2xl p-6 shadow-sm text-sm">
        <h2 className="font-serif-display text-xl text-ink mb-3">How calculations work</h2>
        <dl className="grid gap-2 sm:grid-cols-[220px_1fr]">
          <dt className="text-stone">Unit cost per mL</dt><dd>Maker price ÷ maker quantity</dd>
          <dt className="text-stone">Fragrance cost per bottle</dt><dd>Unit cost per mL × bottle size</dd>
          <dt className="text-stone">Total cost before commission</dt><dd>Fragrance cost + box + packaging + other cost</dd>
          <dt className="text-stone">Commission amount</dt><dd>Selling price × commission rate</dd>
          <dt className="text-stone">Profit after commission</dt><dd>Selling price − fragrance, box, packaging and other costs − commission</dd>
          <dt className="text-stone">Profit margin</dt><dd>Profit after commission ÷ selling price (0 when no price is set)</dd>
          <dt className="text-stone">Commission charged on</dt><dd>The selling price.</dd>
        </dl>
      </div>
    </form>
  );
}
