import { updateWelcomeConfig, getWelcomeMetrics } from "@/lib/admin/marketing";
import { getWelcomeDiscountConfig } from "@/lib/welcome-offers";

export default async function MarketingConfigPage() {
  const [config, metrics] = await Promise.all([getWelcomeDiscountConfig(), getWelcomeMetrics()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif-display text-ink text-3xl font-medium">Welcome Offer Config</h1>
        <p className="mt-1 text-stone text-sm">Manage the first-order welcome discount campaign.</p>
      </div>

      <form action={updateWelcomeConfig} className="bg-pure border border-border rounded-2xl p-6 shadow-sm space-y-4 max-w-2xl">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            name="enabled"
            value="true"
            defaultChecked={config?.enabled ?? false}
            id="enabled"
            className="h-4 w-4"
          />
          <label htmlFor="enabled" className="text-ink text-sm font-medium">Offer enabled</label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-stone mb-1">Discount percentage</label>
            <input name="percentage" type="number" defaultValue={config?.percentage ?? 5} min={0} max={100} className="input-admin" />
          </div>
          <div>
            <label className="block text-xs text-stone mb-1">Max discount (PKR)</label>
            <input name="maxDiscount" type="number" defaultValue={config?.maxDiscount ?? 500} min={0} className="input-admin" />
          </div>
          <div>
            <label className="block text-xs text-stone mb-1">Validity days</label>
            <input name="validityDays" type="number" defaultValue={config?.validityDays ?? 7} min={1} className="input-admin" />
          </div>
          <div>
            <label className="block text-xs text-stone mb-1">Popup delay seconds</label>
            <input name="popupDelaySeconds" type="number" defaultValue={config?.popupDelaySeconds ?? 10} min={0} className="input-admin" />
          </div>
          <div>
            <label className="block text-xs text-stone mb-1">Dismissal suppression days</label>
            <input name="dismissalSuppressionDays" type="number" defaultValue={config?.dismissalSuppressionDays ?? 7} min={0} className="input-admin" />
          </div>
        </div>

        <div>
          <label className="block text-xs text-stone mb-1">Email subject</label>
          <input name="emailSubject" type="text" defaultValue={config?.emailSubject} className="input-admin" />
        </div>
        <div>
          <label className="block text-xs text-stone mb-1">Email preview text</label>
          <input name="emailPreviewText" type="text" defaultValue={config?.emailPreviewText} className="input-admin" />
        </div>

        <button type="submit" className="bg-gold text-pure rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-gold-light transition-colors">
          Save Config
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-pure border border-border rounded-2xl p-5 shadow-sm">
          <p className="text-stone text-xs uppercase tracking-wider">Subscribers</p>
          <p className="text-ink text-2xl font-medium mt-1">{metrics.totalSubscribers}</p>
        </div>
        <div className="bg-pure border border-border rounded-2xl p-5 shadow-sm">
          <p className="text-stone text-xs uppercase tracking-wider">Codes Issued</p>
          <p className="text-ink text-2xl font-medium mt-1">{metrics.welcomeCodesIssued}</p>
        </div>
        <div className="bg-pure border border-border rounded-2xl p-5 shadow-sm">
          <p className="text-stone text-xs uppercase tracking-wider">Redeemed</p>
          <p className="text-ink text-2xl font-medium mt-1">{metrics.welcomeCodesRedeemed}</p>
        </div>
        <div className="bg-pure border border-border rounded-2xl p-5 shadow-sm">
          <p className="text-stone text-xs uppercase tracking-wider">Redemption Rate</p>
          <p className="text-ink text-2xl font-medium mt-1">{metrics.redemptionRate}%</p>
        </div>
        <div className="bg-pure border border-border rounded-2xl p-5 shadow-sm">
          <p className="text-stone text-xs uppercase tracking-wider">Revenue</p>
          <p className="text-ink text-2xl font-medium mt-1">Rs {metrics.revenueFromWelcome.toLocaleString("en-PK")}</p>
        </div>
        <div className="bg-pure border border-border rounded-2xl p-5 shadow-sm">
          <p className="text-stone text-xs uppercase tracking-wider">Discount Cost</p>
          <p className="text-ink text-2xl font-medium mt-1">Rs {metrics.discountCost.toLocaleString("en-PK")}</p>
        </div>
        <div className="bg-pure border border-border rounded-2xl p-5 shadow-sm">
          <p className="text-stone text-xs uppercase tracking-wider">Avg Order Value</p>
          <p className="text-ink text-2xl font-medium mt-1">Rs {Math.round(metrics.averageOrderValue).toLocaleString("en-PK")}</p>
        </div>
      </div>
    </div>
  );
}
