"use client";

import { useActionState } from "react";
import { saveCoupon } from "@/lib/admin/coupons";

export interface CouponDefaults {
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  value: number;
  minimumOrderAmount: string;
  maxUses: string;
  startsAt: string;
  expiresAt: string;
}

export default function CouponForm({ defaults, submitLabel }: { defaults: CouponDefaults; submitLabel: string }) {
  const [state, action, saving] = useActionState(saveCoupon, null);
  const label = "block text-xs text-stone mb-1";
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <label className={label}>Code</label>
        <input name="code" defaultValue={defaults.code} required className="input-admin uppercase" />
      </div>
      <div>
        <label className={label}>Type</label>
        <select name="discountType" defaultValue={defaults.discountType} className="input-admin">
          <option value="percentage">Percentage off</option>
          <option value="fixed">Fixed amount off (PKR)</option>
        </select>
      </div>
      <div>
        <label className={label}>Amount (% or PKR)</label>
        <input name="value" type="number" min={1} step="any" defaultValue={defaults.value} required className="input-admin" />
      </div>
      <div>
        <label className={label}>Minimum order (PKR, optional)</label>
        <input name="minimumOrderAmount" type="number" min={0} defaultValue={defaults.minimumOrderAmount} className="input-admin" />
      </div>
      <div>
        <label className={label}>Starts (Karachi time)</label>
        <input name="startsAt" type="datetime-local" defaultValue={defaults.startsAt} className="input-admin" />
      </div>
      <div>
        <label className={label}>Ends (Karachi time)</label>
        <input name="expiresAt" type="datetime-local" defaultValue={defaults.expiresAt} className="input-admin" />
      </div>
      <div>
        <label className={label}>Total uses allowed (optional)</label>
        <input name="maxUses" type="number" min={1} defaultValue={defaults.maxUses} className="input-admin" />
      </div>
      <div>
        <label className={label}>Note (only you see this)</label>
        <input name="description" defaultValue={defaults.description} className="input-admin" />
      </div>
      <div className="sm:col-span-2 lg:col-span-4 flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="bg-gold text-pure rounded-lg px-5 py-2 text-sm font-medium hover:bg-gold-light transition-colors disabled:opacity-60"
        >
          {saving ? "Saving…" : submitLabel}
        </button>
        {state && <span className={`text-sm ${state.ok ? "text-emerald-700" : "text-red-700"}`}>{state.message}</span>}
      </div>
    </form>
  );
}
