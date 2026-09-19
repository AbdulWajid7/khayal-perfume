"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { trackPurchaseOnce } from "@/lib/analytics";
import { formatPrice } from "@/lib/utils";
import { submitPaymentProof } from "@/lib/orders";
import { getWhatsAppUrl } from "@/lib/site-config";
import type { IOrder } from "@/models/Order";
import type { IBankTransferConfig } from "@/models/BankTransferConfig";

interface Props {
  order: IOrder;
  bankConfig?: IBankTransferConfig;
  accessToken?: string;
}

export default function OrderConfirmationClient({ order, bankConfig, accessToken }: Props) {
  const [proof, setProof] = useState({ senderName: "", referenceNumber: "", transferDate: "" });
  const [file, setFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const [proofResult, setProofResult] = useState<{ success: boolean; message: string } | null>(null);
  const [currentOrder, setCurrentOrder] = useState<IOrder>(order);

  useEffect(() => {
    if (currentOrder.paymentMethod === "cod" && currentOrder.orderStatus !== "cancelled") {
      trackPurchaseOnce({
        transaction_id: currentOrder.orderNumber,
        value: currentOrder.total,
        shipping: currentOrder.shipping,
        tax: currentOrder.tax,
        coupon: currentOrder.discountCode,
        items: currentOrder.items.map((item) => ({
          item_id: item.productId,
          item_name: item.name,
          item_brand: "KHAYAL",
          item_variant: item.variantName,
          price: item.unitPrice,
          quantity: item.quantity,
          currency: "PKR" as const,
        })),
      });
    }

    if (currentOrder.paymentMethod === "bank_transfer" && currentOrder.paymentStatus === "paid") {
      trackPurchaseOnce({
        transaction_id: currentOrder.orderNumber,
        value: currentOrder.total,
        shipping: currentOrder.shipping,
        tax: currentOrder.tax,
        coupon: currentOrder.discountCode,
        items: currentOrder.items.map((item) => ({
          item_id: item.productId,
          item_name: item.name,
          item_brand: "KHAYAL",
          item_variant: item.variantName,
          price: item.unitPrice,
          quantity: item.quantity,
          currency: "PKR" as const,
        })),
      });
    }
  }, [currentOrder]);

  function handleProofSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setProofResult({ success: false, message: "Please select a payment proof image." });
      return;
    }
    if (!proof.senderName || !proof.referenceNumber || !proof.transferDate) {
      setProofResult({ success: false, message: "Please fill in all transfer details." });
      return;
    }

    const formData = new FormData();
    formData.append("senderName", proof.senderName);
    formData.append("referenceNumber", proof.referenceNumber);
    formData.append("transferDate", proof.transferDate);
    formData.append("proof", file);

    startTransition(async () => {
      const result = await submitPaymentProof(currentOrder._id.toString(), formData);
      if (result.success) {
        setCurrentOrder(result.order);
        setProofResult({ success: true, message: "Payment proof submitted. We will verify it shortly." });
      } else {
        setProofResult({ success: false, message: result.error });
      }
    });
  }

  const trackingHref = accessToken
    ? `/track-order?order=${currentOrder.orderNumber}&token=${accessToken}`
    : `/track-order`;

  return (
    <div className="bg-pure border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
      <div className="text-center">
        <h1 className="font-serif-display text-ink text-2xl md:text-3xl font-medium">
          {currentOrder.paymentStatus === "rejected"
            ? "Payment Rejected"
            : currentOrder.paymentMethod === "bank_transfer" && currentOrder.paymentStatus === "pending_verification"
              ? "Order Received — Awaiting Payment Proof"
              : "Order Confirmed"}
        </h1>
        <p className="text-stone mt-2">Order number: <span className="text-ink font-medium tabular-nums">{currentOrder.orderNumber}</span></p>
      </div>

      <div className="border-t border-border pt-4">
        <h2 className="text-ink font-medium mb-3">Items</h2>
        <ul className="space-y-2 text-sm">
          {currentOrder.items.map((item) => (
            <li key={`${item.productId}-${item.variantId}`} className="flex justify-between">
              <span className="text-stone">{item.name} {item.variantName ? `— ${item.variantName}` : ""} × {item.quantity}</span>
              <span className="text-ink tabular-nums">{formatPrice(item.lineTotal, currentOrder.currency)}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between items-center border-t border-border mt-3 pt-3 text-ink font-medium">
          <span>Total</span>
          <span className="tabular-nums">{formatPrice(currentOrder.total, currentOrder.currency)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <h3 className="text-ink font-medium mb-1">Customer</h3>
          <p className="text-stone">{currentOrder.customer.name}</p>
          <p className="text-stone">{currentOrder.customer.phone}</p>
          {currentOrder.customer.email && <p className="text-stone">{currentOrder.customer.email}</p>}
        </div>
        <div>
          <h3 className="text-ink font-medium mb-1">Delivery</h3>
          <p className="text-stone">{currentOrder.customer.address.line}, {currentOrder.customer.address.area}</p>
          <p className="text-stone">{currentOrder.customer.address.city}, {currentOrder.customer.address.province}</p>
          <p className="text-stone mt-1">Expected: {currentOrder.expectedDeliveryText}</p>
        </div>
      </div>

      {currentOrder.paymentMethod === "bank_transfer" && currentOrder.paymentStatus === "pending_verification" && !currentOrder.paymentVerification && bankConfig && (
        <div className="bg-cream-dark/40 border border-border rounded-xl p-5">
          <h2 className="text-ink font-medium mb-3">Bank Transfer Details</h2>
          <dl className="grid grid-cols-[120px_1fr] gap-y-2 text-sm">
            <dt className="text-stone">Bank</dt>
            <dd className="text-ink">{bankConfig.bankName}</dd>
            <dt className="text-stone">Account title</dt>
            <dd className="text-ink">{bankConfig.accountTitle}</dd>
            {bankConfig.accountNumber && (
              <><dt className="text-stone">Account #</dt><dd className="text-ink tabular-nums">{bankConfig.accountNumber}</dd></>
            )}
            {bankConfig.iban && (
              <><dt className="text-stone">IBAN</dt><dd className="text-ink tabular-nums">{bankConfig.iban}</dd></>
            )}
          </dl>
          {bankConfig.instructions && <p className="text-stone text-sm mt-3">{bankConfig.instructions}</p>}

          <form onSubmit={handleProofSubmit} className="mt-5 space-y-3">
            <h3 className="text-ink font-medium text-sm">Submit payment proof</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Sender name"
                value={proof.senderName}
                onChange={(e) => setProof((p) => ({ ...p, senderName: e.target.value }))}
                className="input-admin"
              />
              <input
                type="text"
                placeholder="Reference / transaction number"
                value={proof.referenceNumber}
                onChange={(e) => setProof((p) => ({ ...p, referenceNumber: e.target.value }))}
                className="input-admin"
              />
              <input
                type="date"
                value={proof.transferDate}
                onChange={(e) => setProof((p) => ({ ...p, transferDate: e.target.value }))}
                className="input-admin"
              />
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="input-admin py-2"
              />
            </div>
            {proofResult && (
              <p className={`text-sm ${proofResult.success ? "text-emerald-600" : "text-sale"}`}>{proofResult.message}</p>
            )}
            <button
              type="submit"
              disabled={isPending}
              className="bg-gold text-pure rounded-lg px-6 py-2.5 text-sm font-medium hover:bg-gold-light transition-colors disabled:opacity-60"
            >
              {isPending ? "Submitting..." : "Submit Proof"}
            </button>
          </form>
        </div>
      )}

      {currentOrder.paymentVerification && (
        <div className="bg-cream-dark/40 border border-border rounded-xl p-5 text-sm">
          <p className="text-stone">Payment proof submitted on {new Date(currentOrder.paymentVerification.transferDate).toLocaleDateString("en-PK")}.</p>
          <p className="text-stone mt-1">Status: <span className="capitalize">{currentOrder.paymentVerification.status.replace(/_/g, " ")}</span></p>
          {currentOrder.paymentVerification.rejectionReason && (
            <p className="text-sale mt-1">Reason: {currentOrder.paymentVerification.rejectionReason}</p>
          )}
        </div>
      )}

      {currentOrder.paymentStatus === "rejected" && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-5 text-sm">
          <p className="text-sale">Your payment proof was rejected. Please contact us on WhatsApp to complete your order.</p>
          <a
            href={getWhatsAppUrl(`Assalamualaikam, my order ${currentOrder.orderNumber} payment was rejected. Please help.`)}            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 text-gold hover:text-gold-light"
          >
            Chat on WhatsApp
          </a>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Link href={trackingHref} className="inline-flex justify-center items-center bg-gold text-pure rounded-lg px-6 py-3 text-sm font-medium hover:bg-gold-light transition-colors">
          Track Order
        </Link>
        <a
          href={getWhatsAppUrl(`Assalamualaikam, I have a question about my order ${currentOrder.orderNumber}.`)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex justify-center items-center border border-border text-ink rounded-lg px-6 py-3 text-sm font-medium hover:bg-cream transition-colors"
        >
          WhatsApp Support
        </a>
      </div>
    </div>
  );
}
