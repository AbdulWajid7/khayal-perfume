import type { Metadata } from "next";
import { getBankTransferConfig, upsertBankTransferConfig } from "@/lib/admin/bank-config";

export const metadata: Metadata = { title: "Payment Settings | Khayal Admin" };

const ERRORS: Record<string, string> = {
  bank: "To show bank details, fill in the bank name and account title.",
  "qr-file": "The QR code must be a PNG, JPG or WebP image under 2 MB.",
  "qr-missing": "Upload a QR code image before switching QR payment on.",
};

export default async function PaymentSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const [config, { saved, error }] = await Promise.all([getBankTransferConfig(), searchParams]);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-serif-display text-ink text-3xl font-medium">Payment Settings</h1>
        <p className="mt-1 text-stone text-sm">
          Cash on delivery is always available. Switch on bank transfer, a QR code, or both, and
          customers will see a &quot;Bank transfer / QR&quot; option at checkout and in the WhatsApp bot.
        </p>
      </div>

      {saved && (
        <p className="bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3 text-sm">
          Saved. Checkout and the WhatsApp bot now use these details.
        </p>
      )}
      {error && ERRORS[error] && (
        <p className="bg-red-50 border border-red-200 text-red-800 rounded-xl px-4 py-3 text-sm">{ERRORS[error]}</p>
      )}

      <form action={upsertBankTransferConfig} className="space-y-6">
        <section className="bg-pure border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="enabled"
              value="true"
              id="enabled"
              defaultChecked={config?.enabled ?? false}
              className="h-4 w-4"
            />
            <label htmlFor="enabled" className="text-ink text-sm font-medium">
              Show bank account details
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="bankName" className="block text-xs text-stone mb-1">Bank name</label>
              <input id="bankName" name="bankName" defaultValue={config?.bankName} className="input-admin" />
            </div>
            <div>
              <label htmlFor="accountTitle" className="block text-xs text-stone mb-1">Account title</label>
              <input id="accountTitle" name="accountTitle" defaultValue={config?.accountTitle} className="input-admin" />
            </div>
            <div>
              <label htmlFor="accountNumber" className="block text-xs text-stone mb-1">Account number</label>
              <input id="accountNumber" name="accountNumber" defaultValue={config?.accountNumber} className="input-admin" />
            </div>
            <div>
              <label htmlFor="iban" className="block text-xs text-stone mb-1">IBAN</label>
              <input id="iban" name="iban" defaultValue={config?.iban} className="input-admin" />
            </div>
          </div>
          <div>
            <label htmlFor="instructions" className="block text-xs text-stone mb-1">
              Instructions for customers (optional)
            </label>
            <textarea
              id="instructions"
              name="instructions"
              rows={3}
              defaultValue={config?.instructions}
              placeholder="e.g. Use your order number as the payment reference, then send the screenshot on WhatsApp."
              className="input-admin"
            />
          </div>
        </section>

        <section className="bg-pure border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="qrEnabled"
              value="true"
              id="qrEnabled"
              defaultChecked={config?.qrEnabled ?? false}
              className="h-4 w-4"
            />
            <label htmlFor="qrEnabled" className="text-ink text-sm font-medium">
              Show QR code payment
            </label>
          </div>
          <div>
            <label htmlFor="qrLabel" className="block text-xs text-stone mb-1">QR label</label>
            <input
              id="qrLabel"
              name="qrLabel"
              defaultValue={config?.qrLabel}
              placeholder="e.g. Raast QR, JazzCash or Easypaisa"
              className="input-admin"
            />
          </div>
          <div>
            <label htmlFor="qrImage" className="block text-xs text-stone mb-1">
              QR code image (PNG, JPG or WebP, up to 2 MB)
            </label>
            <input id="qrImage" name="qrImage" type="file" accept="image/png,image/jpeg,image/webp" className="text-sm" />
          </div>
          {config?.qrImageUrl && (
            <div className="flex items-start gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={config.qrImageUrl} alt="Current payment QR code" className="h-32 w-32 rounded-lg border border-border object-contain bg-pure" />
              <label className="flex items-center gap-2 text-sm text-stone">
                <input type="checkbox" name="removeQr" value="true" className="h-4 w-4" />
                Remove this QR code
              </label>
            </div>
          )}
        </section>

        <button
          type="submit"
          className="bg-gold text-pure rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-gold-light transition-colors"
        >
          Save payment settings
        </button>
      </form>
    </div>
  );
}
