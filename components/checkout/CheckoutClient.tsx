"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { createOrder } from "@/lib/checkout";
import { applyDiscountCode } from "@/lib/discounts";
import { saveAbandonedCart, markCartRecovered } from "@/lib/cart-abandon";
import { trackCommerce, trackMarketing } from "@/lib/analytics";
import { formatPrice } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";
import { calculateShipping, getDeliveryMethodLabel, getExpectedDeliveryText, isKarachi } from "@/lib/shipping";
import { isValidPakistaniMobile } from "@/lib/phone";
import type { IBankTransferConfig } from "@/models/BankTransferConfig";
import Link from "next/link";

const PAKISTAN_PROVINCES = ["Sindh", "Punjab", "Khyber Pakhtunkhwa", "Balochistan", "Islamabad Capital Territory", "Gilgit-Baltistan"];

interface CheckoutClientProps {
  bankTransferEnabled: boolean;
  bankConfig?: IBankTransferConfig;
}

export default function CheckoutClient({ bankTransferEnabled, bankConfig }: CheckoutClientProps) {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [discountState, setDiscountState] = useState<
    | { status: "idle" }
    | { status: "validating" }
    | { status: "applied"; discount: number; type: "coupon" | "welcome_offer"; message?: string }
    | { status: "rejected"; message: string }
  >({ status: "idle" });

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    addressLine: "",
    area: "",
    city: "",
    province: "",
    postalCode: "",
    instructions: "",
    paymentMethod: "cod" as "cod" | "bank_transfer",
    customerNotes: "",
    discountCode: "",
    agreed: false,
  });

  const discount = discountState.status === "applied" ? discountState.discount : 0;
  const shipping = useMemo(() => calculateShipping(subtotal), [subtotal]);
  const total = useMemo(() => Math.max(0, subtotal + shipping - discount), [subtotal, shipping, discount]);
  const deliveryMethod = useMemo(() => getDeliveryMethodLabel(form.city), [form.city]);
  const expectedDelivery = useMemo(() => getExpectedDeliveryText(form.city), [form.city]);
  const cartSessionId = useMemo(() => crypto.randomUUID(), []);

  useEffect(() => {
    if (items.length > 0) {
      trackCommerce("begin_checkout", {
        value: subtotal,
        items: items.map((item) => ({
          item_id: item.productId,
          item_name: item.title,
          item_brand: "KHAYAL",
          item_variant: item.variantTitle,
          price: item.price,
          quantity: item.quantity,
          currency: "PKR",
        })),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, subtotal]);

  useEffect(() => {
    if (form.city.length >= 2 && form.addressLine.length >= 5 && form.area.length >= 2 && form.province.length >= 2) {
      trackCommerce("add_shipping_info", {
        value: subtotal + shipping,
        shipping_tier: isKarachi(form.city) ? "self_delivery" : "nationwide_courier",
      });
    }
  }, [form.city, form.addressLine, form.area, form.province, shipping, subtotal]);

  useEffect(() => {
    if (form.paymentMethod) {
      trackCommerce("add_payment_info", {
        value: subtotal + shipping,
        payment_type: form.paymentMethod,
      });
    }
  }, [form.paymentMethod, shipping, subtotal]);

  useEffect(() => {
    const hasContact = form.phone.trim() || form.email.trim();
    if (!items.length || !hasContact) return;
    const timer = setTimeout(() => {
      saveAbandonedCart({
        sessionId: cartSessionId,
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        name: form.name.trim() || undefined,
        items: items.map((item) => ({
          title: item.title,
          variantTitle: item.variantTitle,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal,
      });
    }, 4000);
    return () => clearTimeout(timer);
  }, [items, subtotal, form.phone, form.email, form.name, cartSessionId]);

  if (items.length === 0) {
    return (
      <div className="mt-8 text-center">
        <p className="text-stone">Your cart is empty.</p>
        <Link href="/shop" className="mt-4 inline-block text-gold hover:text-gold-light">Continue shopping</Link>
      </div>
    );
  }

  function updateField<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((prev) => ({ ...prev, [key]: "" }));
    }
    if (key === "email" && discountState.status === "applied") {
      setDiscountState({ status: "idle" });
    }
  }

  function applyDiscount() {
    if (!form.discountCode.trim()) return;
    setDiscountState({ status: "validating" });
    startTransition(async () => {
      trackMarketing("coupon_apply", { placement: "checkout" });
      const result = await applyDiscountCode(form.discountCode.trim(), form.email.trim() || undefined, subtotal);
      if (result.valid) {
        setDiscountState({ status: "applied", discount: result.discount, type: result.type, message: result.message });
        trackMarketing("coupon_apply_success", { placement: "checkout", coupon_type: result.type });
      } else {
        setDiscountState({ status: "rejected", message: result.message });
        trackMarketing("coupon_apply_failure", { placement: "checkout", failure_reason: result.reason });
      }
    });
  }

  function removeDiscount() {
    setDiscountState({ status: "idle" });
    setForm((prev) => ({ ...prev, discountCode: "" }));
  }

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().length < 2) errors.name = "Full name is required";
    if (!form.phone.trim() || !isValidPakistaniMobile(form.phone)) errors.phone = "Valid Pakistani mobile number is required";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Valid email is required";
    if (!form.addressLine.trim() || form.addressLine.trim().length < 5) errors.addressLine = "Address is required";
    if (!form.area.trim()) errors.area = "Area is required";
    if (!form.city.trim()) errors.city = "City is required";
    if (!form.province.trim()) errors.province = "Province is required";
    if (!form.agreed) errors.agreed = "Please agree to the terms";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isPending) return;
    if (!validate()) return;

    setError(null);
    const idempotencyKey = crypto.randomUUID();

    startTransition(async () => {
      const result = await createOrder({
        idempotencyKey,
        customer: {
          name: form.name.trim(),
          email: form.email.trim() || undefined,
          phone: form.phone.trim(),
        },
        address: {
          line: form.addressLine.trim(),
          area: form.area.trim(),
          city: form.city.trim(),
          province: form.province.trim(),
          postalCode: form.postalCode.trim() || undefined,
          instructions: form.instructions.trim() || undefined,
        },
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        paymentMethod: form.paymentMethod,
        customerNotes: form.customerNotes.trim() || undefined,
        discountCode: form.discountCode.trim() || undefined,
      });

      if (!result.success) {
        setError(result.error);
        if (result.field) setFieldErrors((prev) => ({ ...prev, [result.field!]: result.error }));
        return;
      }

      markCartRecovered(cartSessionId);
      clearCart();
      const params = new URLSearchParams();
      params.set("token", await generateOrderAccessToken(result.order.orderNumber));
      router.push(`/order-confirmation/${result.order.orderNumber}?${params.toString()}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <section className="bg-pure border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-ink font-medium mb-4">Customer Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs text-stone mb-1">Full name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="input-admin"
                placeholder="e.g. Ayesha Khan"
              />
              {fieldErrors.name && <p className="text-sale text-xs mt-1">{fieldErrors.name}</p>}
            </div>
            <div>
              <label className="block text-xs text-stone mb-1">Mobile number</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className="input-admin"
                placeholder="03XXXXXXXXX"
              />
              {fieldErrors.phone && <p className="text-sale text-xs mt-1">{fieldErrors.phone}</p>}
            </div>
            <div>
              <label className="block text-xs text-stone mb-1">Email (optional)</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                className="input-admin"
                placeholder="you@example.com"
              />
              {fieldErrors.email && <p className="text-sale text-xs mt-1">{fieldErrors.email}</p>}
            </div>
          </div>
        </section>

        <section className="bg-pure border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-ink font-medium mb-4">Delivery Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs text-stone mb-1">Address line</label>
              <input
                type="text"
                value={form.addressLine}
                onChange={(e) => updateField("addressLine", e.target.value)}
                className="input-admin"
                placeholder="House / building / street"
              />
              {fieldErrors.addressLine && <p className="text-sale text-xs mt-1">{fieldErrors.addressLine}</p>}
            </div>
            <div>
              <label className="block text-xs text-stone mb-1">Area</label>
              <input
                type="text"
                value={form.area}
                onChange={(e) => updateField("area", e.target.value)}
                className="input-admin"
                placeholder="e.g. Clifton"
              />
              {fieldErrors.area && <p className="text-sale text-xs mt-1">{fieldErrors.area}</p>}
            </div>
            <div>
              <label className="block text-xs text-stone mb-1">City</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
                className="input-admin"
                placeholder="e.g. Karachi"
              />
              {fieldErrors.city && <p className="text-sale text-xs mt-1">{fieldErrors.city}</p>}
            </div>
            <div>
              <label className="block text-xs text-stone mb-1">Province</label>
              <select
                value={form.province}
                onChange={(e) => updateField("province", e.target.value)}
                className="input-admin"
              >
                <option value="">Select province</option>
                {PAKISTAN_PROVINCES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              {fieldErrors.province && <p className="text-sale text-xs mt-1">{fieldErrors.province}</p>}
            </div>
            <div>
              <label className="block text-xs text-stone mb-1">Postal code (optional)</label>
              <input
                type="text"
                value={form.postalCode}
                onChange={(e) => updateField("postalCode", e.target.value)}
                className="input-admin"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-stone mb-1">Delivery instructions (optional)</label>
              <textarea
                value={form.instructions}
                onChange={(e) => updateField("instructions", e.target.value)}
                className="input-admin min-h-[80px]"
                placeholder="Gate code, nearby landmark, preferred time"
              />
            </div>
          </div>
        </section>

        <section className="bg-pure border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-ink font-medium mb-4">Delivery Method</h2>
          <div className="border border-border rounded-lg p-4 bg-cream-dark/50">
            <p className="text-ink font-medium">{deliveryMethod}</p>
            <p className="text-stone text-sm mt-1">Expected delivery: {expectedDelivery}</p>
          </div>
        </section>

        <section className="bg-pure border border-border rounded-2xl p-6 shadow-sm">
          <h2 className="text-ink font-medium mb-4">Payment Method</h2>
          <div className="space-y-3">
            <label className="flex items-start gap-3 border border-border rounded-lg p-4 cursor-pointer hover:bg-cream-dark/30 transition-colors">
              <input
                type="radio"
                name="payment"
                checked={form.paymentMethod === "cod"}
                onChange={() => updateField("paymentMethod", "cod")}
                className="mt-1"
              />
              <div>
                <p className="text-ink font-medium">Cash on Delivery</p>
                <p className="text-stone text-sm">Pay when you receive your order. KHAYAL may contact you to confirm.</p>
              </div>
            </label>
            {bankTransferEnabled && bankConfig && (
              <label className="flex items-start gap-3 border border-border rounded-lg p-4 cursor-pointer hover:bg-cream-dark/30 transition-colors">
                <input
                  type="radio"
                  name="payment"
                  checked={form.paymentMethod === "bank_transfer"}
                  onChange={() => updateField("paymentMethod", "bank_transfer")}
                  className="mt-1"
                />
                <div>
                  <p className="text-ink font-medium">Bank Transfer</p>
                  <p className="text-stone text-sm">Transfer to {bankConfig.bankName} — {bankConfig.accountTitle}. Instructions shown after placing order.</p>
                </div>
              </label>
            )}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-cream-dark/40 px-3 py-1.5 text-[11px] text-stone">
              <svg className="h-3.5 w-3.5 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M2 10h20M6 15h4"/></svg>
              Cash on Delivery
            </span>
            {bankTransferEnabled && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-cream-dark/40 px-3 py-1.5 text-[11px] text-stone">
                <svg className="h-3.5 w-3.5 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M3 9l9-6 9 6M4 9v10m5-10v10m6-10v10m5-10v10M2 20h20"/></svg>
                Bank Transfer
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-cream-dark/40 px-3 py-1.5 text-[11px] text-stone">
              <svg className="h-3.5 w-3.5 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Secure Checkout
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-cream-dark/40 px-3 py-1.5 text-[11px] text-stone">
              <svg className="h-3.5 w-3.5 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M21 8l-9-5-9 5v8l9 5 9-5V8zM3 8l9 5 9-5M12 13v8"/></svg>
              Tester included
            </span>
          </div>
        </section>
      </div>

      <div className="space-y-6">
        <section className="bg-pure border border-border rounded-2xl p-6 shadow-sm sticky top-32">
          <h2 className="text-ink font-medium mb-4">Order Summary</h2>
          <ul className="space-y-3 text-sm">
            {items.map((item) => (
              <li key={item.id} className="flex justify-between">
                <span className="text-stone">{item.title} {item.variantTitle ? `— ${item.variantTitle}` : ""} × {item.quantity}</span>
                <span className="text-ink tabular-nums">{formatPrice(item.price * item.quantity, item.currencyCode)}</span>
              </li>
            ))}
          </ul>
          <div className="border-t border-border mt-4 pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-stone">Subtotal</span>
              <span className="text-ink tabular-nums">{formatPrice(subtotal, siteConfig.currency)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between">
                <span className="text-stone">Discount</span>
                <span className="text-emerald-600 tabular-nums">-{formatPrice(discount, siteConfig.currency)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-stone">Shipping</span>
              <span className="text-ink tabular-nums">{shipping === 0 ? "Free" : formatPrice(shipping, siteConfig.currency)}</span>
            </div>
            <div className="flex justify-between font-medium text-base pt-2 border-t border-border">
              <span className="text-ink">Total</span>
              <span className="text-ink tabular-nums">{formatPrice(total, siteConfig.currency)}</span>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs text-stone mb-1">Discount code</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.discountCode}
                onChange={(e) => {
                  updateField("discountCode", e.target.value.toUpperCase());
                  if (discountState.status === "rejected" || discountState.status === "applied") {
                    setDiscountState({ status: "idle" });
                  }
                }}
                disabled={discountState.status === "applied"}
                className="input-admin flex-1"
                placeholder="Enter code"
              />
              {discountState.status !== "applied" ? (
                <button
                  type="button"
                  onClick={applyDiscount}
                  disabled={!form.discountCode.trim() || discountState.status === "validating"}
                  className="bg-ink text-pure rounded-lg px-4 py-2 text-sm font-medium hover:bg-gold transition-colors disabled:opacity-60"
                >
                  {discountState.status === "validating" ? "Applying..." : "Apply"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={removeDiscount}
                  className="border border-border text-stone rounded-lg px-4 py-2 text-sm font-medium hover:bg-cream transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
            {discountState.status === "applied" && discountState.message && (
              <p className="text-emerald-600 text-xs mt-1">{discountState.message}</p>
            )}
            {discountState.status === "rejected" && (
              <p className="text-sale text-xs mt-1">{discountState.message}</p>
            )}
          </div>

          <div className="mt-4">
            <label className="block text-xs text-stone mb-1">Order notes (optional)</label>
            <textarea
              value={form.customerNotes}
              onChange={(e) => updateField("customerNotes", e.target.value)}
              className="input-admin min-h-[80px]"
              placeholder="Any special requests"
            />
          </div>

          <label className="flex items-start gap-2 mt-4 text-xs text-stone">
            <input
              type="checkbox"
              checked={form.agreed}
              onChange={(e) => updateField("agreed", e.target.checked)}
              className="mt-0.5"
            />
            <span>
              I agree to the{" "}
              <Link href="/terms" target="_blank" className="text-gold hover:underline">Terms</Link>{" "}
              and{" "}
              <Link href="/privacy" target="_blank" className="text-gold hover:underline">Privacy Policy</Link>.
            </span>
          </label>
          {fieldErrors.agreed && <p className="text-sale text-xs mt-1">{fieldErrors.agreed}</p>}

          {error && <p className="text-sale text-sm mt-3">{error}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="w-full mt-4 bg-gold text-pure rounded-lg px-6 py-3 text-sm font-medium hover:bg-gold-light transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPending ? "Placing order..." : "Place Order"}
          </button>
        </section>
      </div>
    </form>
  );
}

async function generateOrderAccessToken(orderNumber: string): Promise<string> {
  const { generateOrderAccessToken: gen } = await import("@/lib/orders");
  return gen(orderNumber);
}
