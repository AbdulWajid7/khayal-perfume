import { describe, expect, it } from "vitest";
import { renderOrderEmail, renderWelcomeEmail, mapOrderToEmailData } from "@/lib/khayal-emails";
import type { IOrder } from "@/models/Order";

const order = {
  _id: "order-id",
  orderNumber: "K-20261006-TEST",
  createdAt: new Date("2026-10-06"),
  customer: {
    name: "Ayesha & Co",
    email: "ayesha@example.com",
    phone: "+923001234567",
    normalizedPhone: "+923001234567",
    address: { line: "1 Main Road", area: "DHA", city: "Karachi", province: "Sindh" },
  },
  items: [{ productId: "product-id", name: "Oud <Noir>", variantName: "50ml", sku: "OUD-50", quantity: 2, unitPrice: 2500, lineTotal: 5000, image: "/images/products/oud-imperial.svg" }],
  subtotal: 5000,
  preDiscountSubtotal: 5000,
  postDiscountSubtotal: 4750,
  discount: 250,
  shipping: 200,
  tax: 0,
  total: 4950,
  currency: "PKR",
  paymentMethod: "cod",
  courier: "tcs",
  trackingNumber: "TCS-12345",
  expectedDeliveryText: "2–3 working days",
} as IOrder;

describe("customer order emails", () => {
  it("builds an order placement confirmation with items, address and totals", () => {
    const email = renderOrderEmail("placed", mapOrderToEmailData(order));

    expect(email.subject).toContain(order.orderNumber);
    expect(email.text).toContain("Oud <Noir> (50ml) x2");
    expect(email.text).toContain("Cash on Delivery");
    expect(email.html).toContain("Oud &lt;Noir&gt;");
    expect(email.html).toContain("Ayesha &amp; Co");
    expect(email.html).toContain("https://www.khayalparfum.com/images/products/oud-imperial.svg");
    expect(email.html).toContain("1 Main Road");
    expect(email.html).toContain("Discount");
    expect(email.html).toContain("khayal-watermark.png");
  });

  it("includes tracking and courier when an order is dispatched", () => {
    const email = renderOrderEmail("dispatched", mapOrderToEmailData(order));

    expect(email.subject).toContain("On its way");
    expect(email.text).toContain("Tracking: TCS-12345 (TCS)");
    expect(email.html).toContain("TCS-12345");
    expect(email.html).toContain("2–3 working days");
  });

  it("includes the reason when payment is rejected", () => {
    const email = renderOrderEmail("payment_rejected", mapOrderToEmailData(order, "Reference number does not match"));

    expect(email.subject).toContain("Action needed");
    expect(email.text).toContain("Reason: Reference number does not match");
    expect(email.html).toContain("Reference number does not match");
  });

  it("renders the welcome email with the discount code and expiry", () => {
    const email = renderWelcomeEmail({ customerName: "Ayesha Khan", code: "KHAYAL-ABCD-EFGH", expiresAt: "13 October 2026" });

    expect(email.subject).toContain("5%");
    expect(email.html).toContain("KHAYAL-ABCD-EFGH");
    expect(email.html).toContain("Valid until 13 October 2026");
    expect(email.text).toContain("Code: KHAYAL-ABCD-EFGH");
  });
});
