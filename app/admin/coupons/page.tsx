import type { Metadata } from "next";
import { requireAuth } from "@/lib/auth";
import { listCoupons, toggleCoupon } from "@/lib/admin/coupons";
import CouponForm, { type CouponDefaults } from "@/components/admin/CouponForm";

export const metadata: Metadata = { title: "Discount Codes | Khayal Admin" };
export const dynamic = "force-dynamic";

const card = "bg-pure border border-border rounded-2xl p-6 shadow-sm";

/** The launch code agreed on 13 Oct 2026: 15% off, Terrace weekend to a week after launch. */
const LAUNCH_CODE: CouponDefaults = {
  code: "TERRACE15",
  description: "Launch: Terrace Cafe visitors and first buyers, 15% off",
  discountType: "percentage",
  value: 15,
  minimumOrderAmount: "",
  maxUses: "300",
  startsAt: "2026-10-17T00:00",
  expiresAt: "2026-10-27T23:59",
};

function pktLocal(iso: string | null) {
  if (!iso) return "";
  // Shift to Karachi (UTC+5) and format for datetime-local.
  return new Date(new Date(iso).getTime() + 5 * 3600 * 1000).toISOString().slice(0, 16);
}

function when(iso: string | null) {
  return iso
    ? new Date(iso).toLocaleString("en-PK", { timeZone: "Asia/Karachi", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })
    : "—";
}

export default async function CouponsPage() {
  const session = await requireAuth(["admin"]);
  if (!session) {
    return <p className="text-stone">Only the owner account can manage discount codes.</p>;
  }
  const coupons = await listCoupons();
  const hasLaunch = coupons.some((c) => c.code === LAUNCH_CODE.code);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif-display text-3xl text-ink">Discount Codes</h1>
        <p className="text-stone mt-1 max-w-3xl">
          Customers type the code at checkout. Use codes for real offers instead of crossed-out &ldquo;was&rdquo; prices.
        </p>
      </div>

      {!hasLaunch && (
        <div className={`${card} border-gold/40`}>
          <h2 className="font-serif-display text-xl text-ink mb-1">Launch code, ready to create</h2>
          <p className="text-sm text-stone mb-4">
            TERRACE15: 15% off from Sat 17 Oct to Tue 27 Oct, up to 300 orders. Check the details, then press Create.
          </p>
          <CouponForm defaults={LAUNCH_CODE} submitLabel="Create TERRACE15" />
        </div>
      )}

      <div className={card}>
        <h2 className="font-serif-display text-xl text-ink mb-4">Your codes</h2>
        {coupons.length === 0 ? (
          <p className="text-sm text-stone">No codes yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-stone border-b border-border">
                <tr>
                  <th className="py-2 pr-4">Code</th>
                  <th className="py-2 pr-4">Discount</th>
                  <th className="py-2 pr-4">Valid</th>
                  <th className="py-2 pr-4">Used</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {coupons.map((c) => (
                  <tr key={c._id}>
                    <td className="py-3 pr-4 font-medium text-ink">
                      {c.code}
                      {c.description && <div className="text-xs text-stone font-normal">{c.description}</div>}
                    </td>
                    <td className="py-3 pr-4">
                      {c.discountType === "percentage" ? `${c.value}% off` : `Rs ${c.value.toLocaleString("en-PK")} off`}
                      {c.minimumOrderAmount ? <div className="text-xs text-stone">min Rs {c.minimumOrderAmount.toLocaleString("en-PK")}</div> : null}
                    </td>
                    <td className="py-3 pr-4 text-xs">{when(c.startsAt)} → {when(c.expiresAt)}</td>
                    <td className="py-3 pr-4">{c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ""}</td>
                    <td className="py-3 pr-4">
                      <span className={c.enabled ? "text-emerald-700" : "text-stone"}>{c.enabled ? "On" : "Off"}</span>
                    </td>
                    <td className="py-3">
                      <form action={toggleCoupon}>
                        <input type="hidden" name="id" value={c._id} />
                        <input type="hidden" name="enabled" value={c.enabled ? "false" : "true"} />
                        <button className="text-xs border border-border rounded-lg px-3 py-1.5 hover:bg-cream">
                          {c.enabled ? "Switch off" : "Switch on"}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className={card}>
        <h2 className="font-serif-display text-xl text-ink mb-4">Create or update a code</h2>
        <p className="text-sm text-stone mb-4">Saving an existing code updates it and keeps its usage count.</p>
        <CouponForm
          defaults={{
            code: "",
            description: "",
            discountType: "percentage",
            value: 10,
            minimumOrderAmount: "",
            maxUses: "",
            startsAt: pktLocal(null),
            expiresAt: "",
          }}
          submitLabel="Save code"
        />
      </div>
    </div>
  );
}
