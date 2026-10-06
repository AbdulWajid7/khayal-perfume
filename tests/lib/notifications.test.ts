import { describe, expect, it } from "vitest";
import { getCustomerOrderEmail } from "@/lib/order-email";
import type { IOrder } from "@/models/Order";

const order = {
  _id: "order-id",
  orderNumber: "K-20261006-TEST",
  customer: {
    name: "Ayesha & Co",
    email: "ayesha@example.com",
    phone: "+923001234567",
    normalizedPhone: "+923001234567",
    address: { line: "1 Main Road", area: "DHA", city: "Karachi", province: "Sindh" },
  },
  items: [{ productId: "product-id", name: "Oud <Noir>", quantity: 2, unitPrice: 2500, lineTotal: 5000 }],
  total: 5200,
  currency: "PKR",
  paymentMethod: "cod",
  trackingNumber: "TCS-12345",
} as IOrder;

describe("customer order emails", () => {
  it("builds an order placement confirmation with the order summary", () => {
    const email = getCustomerOrderEmail(order, "placed");

    expect(email.subject).toContain(order.orderNumber);
    expect(email.text).toContain("Oud <Noir> × 2");
    expect(email.text).toContain("Cash on delivery");
    expect(email.html).toContain("Oud &lt;Noir&gt;");
    expect(email.html).toContain("Ayesha &amp; Co");
  });

  it("includes tracking information when an order is dispatched", () => {
    const email = getCustomerOrderEmail(order, "dispatched");

    expect(email.subject).toContain("on the way");
    expect(email.text).toContain("Tracking number: TCS-12345");
    expect(email.html).toContain("Tracking number: TCS-12345");
  });

  it("includes the reason when payment is rejected", () => {
    const email = getCustomerOrderEmail(order, "payment_rejected", "Reference number does not match");

    expect(email.subject).toContain("Action needed");
    expect(email.text).toContain("Reference number does not match");
  });
});
