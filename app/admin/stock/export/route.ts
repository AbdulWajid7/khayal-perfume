import { getAdminUser } from "@/lib/admin/access";
import { getPurchaseReport } from "@/lib/admin/stock";

export const dynamic = "force-dynamic";

const cell = (v: unknown) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** Owner only: one month of stock purchases as CSV for the accountant. */
export async function GET(request: Request) {
  const user = await getAdminUser();
  if (!user || user.role !== "admin") return new Response("Not allowed", { status: 403 });
  const month = new URL(request.url).searchParams.get("month") || "";
  const report = await getPurchaseReport(month);
  const lines = [
    ["Date", "Item", "Category", "Quantity", "Unit", "Unit price (PKR)", "Total (PKR)", "Supplier", "Note", "Recorded by"].join(","),
    ...report.rows.map((r) =>
      [
        new Date(r.date).toISOString().slice(0, 10),
        r.itemName,
        r.category,
        r.quantity,
        r.unit,
        r.unitCost ?? "",
        r.totalCost ?? "",
        r.supplier ?? "",
        r.note ?? r.reason ?? "",
        r.by ?? "",
      ]
        .map(cell)
        .join(",")
    ),
    ["", "TOTAL", "", "", "", "", report.total].map(cell).join(","),
  ];
  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="khayal-stock-purchases-${report.month}.csv"`,
    },
  });
}
