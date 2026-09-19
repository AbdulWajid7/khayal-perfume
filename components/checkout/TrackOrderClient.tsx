"use client";

import { useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { getOrderByAccessToken, getOrderByNumberAndPhone } from "@/lib/orders";
import { formatPrice } from "@/lib/utils";
import { getWhatsAppUrl } from "@/lib/site-config";
import type { IOrder } from "@/models/Order";

export default function TrackOrderClient() {
  const searchParams = useSearchParams();
  const initialOrder = searchParams.get("order");
  const initialToken = searchParams.get("token");

  const [orderNumber, setOrderNumber] = useState(initialOrder || "");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<IOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (initialOrder && initialToken) {
      startTransition(async () => {
        const result = await getOrderByAccessToken(initialToken);
        if (result && result.orderNumber.toUpperCase() === initialOrder.toUpperCase()) {
          setOrder(result);
        } else {
          setError("Tracking link is invalid or expired.");
        }
      });
    }
  }, [initialOrder, initialToken]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOrder(null);
    startTransition(async () => {
      const result = await getOrderByNumberAndPhone(orderNumber, phone);
      if (result) {
        setOrder(result);
      } else {
        setError("Order not found. Please check your order number and phone number.");
      }
    });
  }

  const statusLabel = (status: string) =>
    status
      .split("_")
      .map((s) => s[0].toUpperCase() + s.slice(1))
      .join(" ");

  return (
    <div>
      {!order && (
        <form onSubmit={handleSubmit} className="mt-8 bg-pure border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <label className="block text-xs text-stone mb-1">Order number</label>
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="input-admin"
              placeholder="K-20260920-ABCD"
            />
          </div>
          <div>
            <label className="block text-xs text-stone mb-1">Mobile number used at checkout</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-admin"
              placeholder="03XXXXXXXXX"
            />
          </div>
          {error && <p className="text-sale text-sm">{error}</p>}
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-gold text-pure rounded-lg px-6 py-3 text-sm font-medium hover:bg-gold-light transition-colors disabled:opacity-60"
          >
            {isPending ? "Looking up..." : "Track Order"}
          </button>
        </form>
      )}

      {order && (
        <div className="mt-8 bg-pure border border-border rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <p className="text-stone text-sm">Order number</p>
              <p className="text-ink font-medium tabular-nums">{order.orderNumber}</p>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gold/10 text-gold">
              {statusLabel(order.orderStatus)}
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-stone">Payment</span>
              <span className="text-ink capitalize">{order.paymentStatus.replace(/_/g, " ")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone">Delivery method</span>
              <span className="text-ink capitalize">{order.deliveryMethod.replace(/_/g, " ")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-stone">Courier</span>
              <span className="text-ink capitalize">{order.courier.replace(/_/g, " ")}</span>
            </div>
            {order.trackingNumber && (
              <div className="flex justify-between text-sm">
                <span className="text-stone">Tracking number</span>
                <span className="text-ink tabular-nums">{order.trackingNumber}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-stone">Expected delivery</span>
              <span className="text-ink">{order.expectedDeliveryText}</span>
            </div>
            <div className="flex justify-between font-medium text-base pt-3 border-t border-border">
              <span className="text-ink">Total</span>
              <span className="text-ink tabular-nums">{formatPrice(order.total, order.currency)}</span>
            </div>
          </div>

          <a
            href={getWhatsAppUrl(`Assalamualaikam, I have a question about my order ${order.orderNumber}.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-gold text-pure rounded-lg px-6 py-3 text-sm font-medium hover:bg-gold-light transition-colors"
          >
            WhatsApp Support
          </a>
        </div>
      )}
    </div>
  );
}
