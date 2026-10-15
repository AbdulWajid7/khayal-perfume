import { getAdminUser } from "@/lib/admin/access";
import { buildAccounts } from "@/lib/accounts-data";
import { accountLabel, KIND_LABELS, PERIODS, type PeriodKey } from "@/lib/accounts";

export const dynamic = "force-dynamic";

const cell = (v: unknown) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** Owner only: every money movement in a period, for the accountant. */
export async function GET(request: Request) {
  const user = await getAdminUser();
  if (!user || user.role !== "admin") return new Response("Not allowed", { status: 403 });
  const raw = new URL(request.url).searchParams.get("period") || "month";
  const period = (PERIODS.some((p) => p.key === raw) ? raw : "month") as PeriodKey;
  const a = await buildAccounts(period);
  const lines = [
    ["Date", "Type", "Details", "Category", "Account", "In (PKR)", "Out (PKR)"].join(","),
    ...a.periodTxns.map((t) =>
      [t.date.slice(0, 10), KIND_LABELS[t.kind], t.label, t.category, accountLabel(t.account), t.direction === "in" ? t.amount : "", t.direction === "out" ? t.amount : ""]
        .map(cell)
        .join(",")
    ),
    ["", "", "TOTAL", "", "", a.cash.inflow, a.cash.outflow].map(cell).join(","),
  ];
  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="khayal-accounts-${period}.csv"`,
    },
  });
}
