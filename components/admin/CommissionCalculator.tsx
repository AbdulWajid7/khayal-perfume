"use client";

import { useActionState } from "react";
import { quoteSale, type CommissionRow, type QuoteState } from "@/lib/admin/commission";
import { formatPrice } from "@/lib/utils";

export default function CommissionCalculator({ rows, isOwner }: { rows: CommissionRow[]; isOwner: boolean }) {
  const [state, action, pending] = useActionState<QuoteState, FormData>(quoteSale, null);
  return (
    <form action={action} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
      <label className="text-sm text-stone md:col-span-2">
        Fragrance
        <select name="index" className="input-admin mt-1" defaultValue="">
          <option value="" disabled>Choose…</option>
          {rows.map((r) => (
            <option key={r.index} value={r.index}>
              {r.khayalName} · {formatPrice(r.sellingPrice)}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm text-stone">
        Bottles
        <input name="quantity" type="number" min={1} defaultValue={1} className="input-admin mt-1" />
      </label>
      <label className="text-sm text-stone">
        Discount %
        <input name="discount" type="number" min={0} max={100} defaultValue={0} className="input-admin mt-1" />
      </label>
      {isOwner ? (
        <label className="text-sm text-stone">
          Commission % of profit
          <input name="rate" type="number" min={0} max={100} step="0.5" placeholder="Sheet rate" className="input-admin mt-1" />
        </label>
      ) : (
        <span />
      )}
      <button type="submit" disabled={pending} className="bg-gold text-pure rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-gold-light disabled:opacity-50 md:col-span-1">
        {pending ? "Working out…" : "Calculate"}
      </button>
      {state && (
        <div className="md:col-span-5 rounded-xl bg-cream px-4 py-3 text-sm">
          {state.ok ? (
            <>
              Sale after discount <strong>{formatPrice(state.sales ?? 0)}</strong> · Commission{" "}
              <strong className="text-gold">{formatPrice(state.commission ?? 0)}</strong>
            </>
          ) : (
            <span className="text-sale">{state.message}</span>
          )}
        </div>
      )}
    </form>
  );
}
